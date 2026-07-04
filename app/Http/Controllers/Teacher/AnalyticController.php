<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticController extends Controller
{
    public function index()
    {
        $teacherId = Auth::id();

        // Asumsi: 1 guru mengampu 1 kelas utama (sesuai seed data classes.teacher_id)
        $classId = DB::table('classes')->where('teacher_id', $teacherId)->value('id');

        if (! $classId) {
            return Inertia::render('Teacher/Analytics', [
                'classStats'      => ['totalClassXp' => 0, 'avgCompletion' => 0],
                'topicAnalytics'  => [],
                'weeklyProgress'  => [],
                'leaderboardData' => [],
                'aiDiagnostic'    => $this->emptyDiagnostic(),
            ]);
        }

        return Inertia::render('Teacher/Analytics', [
            'classStats'      => $this->getClassStats($classId),
            'topicAnalytics'  => $this->getTopicAnalytics($classId),
            'weeklyProgress'  => $this->getWeeklyProgress($classId),
            'leaderboardData' => $this->getLeaderboard($classId),
            'aiDiagnostic'    => $this->getAiDiagnostic($classId),
        ]);
    }

    /**
     * Endpoint khusus untuk tombol "Analisis dengan AI" — Inertia partial reload
     * hanya akan menarik ulang prop 'aiDiagnostic' ini (lihat web.php).
     */
    public function refreshDiagnostic()
    {
        $classId = DB::table('classes')->where('teacher_id', Auth::id())->value('id');

        return Inertia::render('Teacher/Analytics', [
            'aiDiagnostic' => $classId ? $this->getAiDiagnostic($classId) : $this->emptyDiagnostic(),
        ]);
    }

    /**
     * Ringkasan atas: Total XP kelas & rata-rata completion rate.
     */
    private function getClassStats(int $classId): array
    {
        $totalClassXp = (int) DB::table('class_students')
            ->join('users', 'users.id', '=', 'class_students.student_id')
            ->where('class_students.class_id', $classId)
            ->sum('users.total_exp');

        $studentIds = DB::table('class_students')
            ->where('class_id', $classId)
            ->pluck('student_id');

        $totalReleasedTasks = DB::table('tasks')
            ->where('class_id', $classId)
            ->where('is_released', 1)
            ->count();

        $avgCompletion = 0;

        if ($studentIds->count() > 0 && $totalReleasedTasks > 0) {
            $rates = $studentIds->map(function ($studentId) use ($classId, $totalReleasedTasks) {
                $completed = DB::table('submissions')
                    ->join('tasks', 'tasks.id', '=', 'submissions.task_id')
                    ->where('tasks.class_id', $classId)
                    ->where('submissions.student_id', $studentId)
                    ->where('submissions.status', 'evaluation')
                    ->count();

                return ($completed / $totalReleasedTasks) * 100;
            });

            $avgCompletion = (int) round($rates->avg());
        }

        return [
            'totalClassXp'  => $totalClassXp,
            'avgCompletion' => $avgCompletion,
        ];
    }

    /**
     * Data untuk Bar/Donut Chart: rata-rata ai_score per tax_topic.
     */
    private function getTopicAnalytics(int $classId): array
    {
        $rows = DB::table('submissions')
            ->join('tasks', 'tasks.id', '=', 'submissions.task_id')
            ->where('tasks.class_id', $classId)
            ->where('submissions.status', 'evaluation')
            ->whereNotNull('submissions.ai_score')
            ->select(
                'tasks.tax_topic',
                DB::raw('AVG(submissions.ai_score) as avg_score'),
                DB::raw('COUNT(submissions.id) as total_submission')
            )
            ->groupBy('tasks.tax_topic')
            ->orderByDesc('avg_score')
            ->get();

        return $rows->map(function ($row) {
            $pct = (int) round($row->avg_score);

            $level = 'struggle';
            if ($pct >= 75) {
                $level = 'mastered';
            } elseif ($pct >= 50) {
                $level = 'moderate';
            }

            return [
                'topic' => $row->tax_topic,
                'pct'   => $pct,
                'level' => $level,
                'total' => (int) $row->total_submission,
            ];
        })->values()->toArray();
    }

    /**
     * Data untuk Line/Area Chart: tren jumlah submission per minggu (6 minggu terakhir).
     */
    private function getWeeklyProgress(int $classId, int $weeksBack = 6): array
    {
        $startDate = Carbon::now()->subWeeks($weeksBack - 1)->startOfWeek();

        $rows = DB::table('submissions')
            ->join('tasks', 'tasks.id', '=', 'submissions.task_id')
            ->where('tasks.class_id', $classId)
            ->where('submissions.status', 'evaluation')
            ->where('submissions.updated_at', '>=', $startDate)
            ->select(
                DB::raw("YEARWEEK(submissions.updated_at, 3) as year_week"),
                DB::raw('COUNT(submissions.id) as completed')
            )
            ->groupBy('year_week')
            ->get()
            ->keyBy('year_week');

        $result = [];
        for ($i = $weeksBack - 1; $i >= 0; $i--) {
            $weekStart = Carbon::now()->subWeeks($i)->startOfWeek();
            $yearWeek  = (int) $weekStart->format('oW'); // format ISO cocok dgn YEARWEEK(..., 3)
            $matched   = $rows->get($yearWeek);

            $result[] = [
                'week'      => 'Mgg ' . $weekStart->format('d/m'),
                'completed' => $matched ? (int) $matched->completed : 0,
            ];
        }

        return $result;
    }

    /**
     * Leaderboard: siswa di kelas ini, diurutkan total_exp tertinggi ke terendah.
     */
    private function getLeaderboard(int $classId): array
    {
        $students = DB::table('class_students')
            ->join('users', 'users.id', '=', 'class_students.student_id')
            ->where('class_students.class_id', $classId)
            ->select('users.id', 'users.name', 'users.total_exp')
            ->orderByDesc('users.total_exp')
            ->get();

        return $students->values()->map(function ($student, $index) {
            return [
                'rank'     => $index + 1,
                'id'       => $student->id,
                'name'     => $student->name,
                'initials' => $this->makeInitials($student->name),
                'xp'       => (int) $student->total_exp,
                // Belum ada kolom 'level' di tabel users, jadi diturunkan dari XP (100 XP / level)
                'level'    => (int) floor($student->total_exp / 100) + 1,
            ];
        })->toArray();
    }

    private function makeInitials(string $name): string
    {
        $parts = array_filter(explode(' ', $name));
        $initials = collect($parts)
            ->map(fn ($p) => mb_strtoupper(mb_substr($p, 0, 1)))
            ->take(2)
            ->implode('');

        return $initials ?: 'S';
    }

    /**
     * Simulasi respons AI (Executive Summary, Struggle Points, Action Plan)
     * berdasarkan statistik ai_score & completion rate riil kelas.
     */
    private function getAiDiagnostic(int $classId): array
    {
        $topics = collect($this->getTopicAnalytics($classId));
        $stats  = $this->getClassStats($classId);

        if ($topics->isEmpty()) {
            return $this->emptyDiagnostic();
        }

        $bestTopic   = $topics->sortByDesc('pct')->first();
        $worstTopics = $topics->sortBy('pct')->take(4)->values();

        $executiveSummary = sprintf(
            'Secara keseluruhan, siswa menunjukkan penguasaan terbaik pada topik "%s" (%d%% akurasi). '
            . 'Namun performa kelas masih tertinggal pada topik "%s" (%d%% akurasi). '
            . 'Rata-rata tingkat penyelesaian tugas kelas saat ini berada di %d%%, dengan total akumulasi %s XP dari seluruh siswa.',
            $bestTopic['topic'],
            $bestTopic['pct'],
            $worstTopics->first()['topic'],
            $worstTopics->first()['pct'],
            $stats['avgCompletion'],
            number_format($stats['totalClassXp'], 0, ',', '.')
        );

        $struggles = $worstTopics->map(function ($topic) {
            return [
                'pct'  => 100 - $topic['pct'],
                'text' => sprintf(
                    'Sebagian besar siswa masih kesulitan pada topik "%s" dengan rata-rata akurasi hanya %d%%. Diperlukan perhatian tambahan pada materi ini.',
                    $topic['topic'],
                    $topic['pct']
                ),
            ];
        })->values()->toArray();

        $icons = ['📋', '🎯', '💡', '⏰'];
        $actionPlan = $worstTopics->map(function ($topic, $index) use ($icons) {
            return [
                'icon' => $icons[$index % count($icons)],
                'text' => sprintf(
                    'Selenggarakan sesi ulasan atau soal latihan tambahan untuk topik "%s" agar akurasi siswa meningkat dari %d%%.',
                    $topic['topic'],
                    $topic['pct']
                ),
            ];
        })->values()->toArray();

        return [
            'executiveSummary' => $executiveSummary,
            'struggles'        => $struggles,
            'actionPlan'       => $actionPlan,
            'generatedAt'      => Carbon::now()->toIso8601String(),
        ];
    }

    private function emptyDiagnostic(): array
    {
        return [
            'executiveSummary' => 'Belum ada cukup data submission untuk menghasilkan analisis AI. Silakan tunggu hingga siswa menyelesaikan beberapa tugas.',
            'struggles'        => [],
            'actionPlan'       => [],
            'generatedAt'      => Carbon::now()->toIso8601String(),
        ];
    }
}