<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AnalyticController extends Controller
{
    public function index()
    {
        $teacherId = Auth::id();
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

        $existingAnalytic = DB::table('class_ai_analytics')
            ->where('class_id', $classId)
            ->orderBy('analyzed_at', 'desc')
            ->first();

        if ($existingAnalytic) {
            $aiDiagnostic = [
                'executiveSummary' => $existingAnalytic->ai_executive_summary,
                'struggles'        => json_decode($existingAnalytic->struggle_points_json, true),
                'actionPlan'       => json_decode($existingAnalytic->action_plan, true),
                'generatedAt'      => Carbon::parse($existingAnalytic->analyzed_at)->toIso8601String(),
            ];
        } else {
            $aiDiagnostic = $this->getFallbackDiagnostic($classId);
        }

        return Inertia::render('Teacher/Analytics', [
            'classStats'      => $this->getClassStats($classId),
            'topicAnalytics'  => $this->getTopicAnalytics($classId),
            'weeklyProgress'  => $this->getWeeklyProgress($classId),
            'leaderboardData' => $this->getLeaderboard($classId),
            'aiDiagnostic'    => $aiDiagnostic,
        ]);
    }

    public function refreshDiagnostic()
    {
        $classId = DB::table('classes')->where('teacher_id', Auth::id())->value('id');

        if (! $classId) {
            return Inertia::render('Teacher/Analytics', [
                'aiDiagnostic' => $this->emptyDiagnostic(),
            ]);
        }

        $recentAnalytic = DB::table('class_ai_analytics')
            ->where('class_id', $classId)
            ->where('analyzed_at', '>=', Carbon::now()->subHours(6))
            ->orderBy('analyzed_at', 'desc')
            ->first();

        if ($recentAnalytic) {
            return redirect()->back();
        }

        $stats = $this->getClassStats($classId);
        $topicAnalytics = $this->getTopicAnalytics($classId);

        $inputDataText = "Statistik Progres Kelas Saat Ini:\n"
            . "- Total XP Akumulasi Seluruh Siswa: {$stats['totalClassXp']} XP\n"
            . "- Rata-rata Persentase Penyelesaian Tugas: {$stats['avgCompletion']}%\n\n";

        if (empty($topicAnalytics)) {
            $inputDataText .= "Detail Performa Akurasi: Belum ada data submission bernilai evaluasi yang masuk dari siswa. Kelas baru saja dimulai atau perlu dorongan pengerjaan kuis.\n";
        } else {
            $inputDataText .= "Detail Performa Akurasi Siswa per Topik Pajak:\n";
            foreach ($topicAnalytics as $topic) {
                $inputDataText .= "- Topik Pajak: {$topic['topic']}, Rata-rata Akurasi: {$topic['pct']}%, Kategori: {$topic['level']}, Jumlah Submit: {$topic['total']}\n";
            }
        }

        $systemInstruction = "Anda adalah sistem AI Analitik Pendidikan khusus SMK Akuntansi di aplikasi ApTax. Tugas Anda adalah menganalisis data performa kompetensi siswa dan memberikan laporan diagnosis yang instruktif, solutif, serta menggunakan bahasa motivasi informal (wajib gunakan panggilan 'kamu' kepada guru).";
        $prompt = "Berdasarkan data kondisi kelas dampinganmu berikut, buatlah analisis evaluasi kualitatif cerdas:\n\n"
            . $inputDataText . "\n"
            . "Ketentuan Output Format JSON:\n"
            . "1. executiveSummary: Berikan paragraf ringkasan evaluasi performa kelas (2-3 kalimat). Jika data performa masih kosong, berikan teks sapaan motivasi kepada guru untuk segera memicu siswa mengerjakan tugas pertama mereka di ApTax.\n"
            . "2. struggles: Berikan analisis 2-3 topik dengan tingkat akurasi terendah. Jika data performa kelas masih kosong, sebutkan materi fundamental perpajakan (seperti PPh 21 atau PPN) yang berpotensi menjadi titik bingung utama anak SMK berdasarkan asumsi umum. Tentukan nilai 'pct' (tingkat kesulitan, angka integer bebas antara 0-100) dan tulis deskripsi 'text'-nya.\n"
            . "3. actionPlan: Berikan 3 poin rencana aksi strategis konkret yang bisa guru terapkan di kelas esok hari. Tentukan 'icon' berupa emoji tunggal yang relevan serta deskripsi 'text' instruksinya.";

        $apiKey = env('GEMINI_API_KEY');

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ],
                'systemInstruction' => [
                    'parts' => [['text' => $systemInstruction]]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'responseSchema' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'executiveSummary' => ['type' => 'STRING'],
                            'struggles' => [
                                'type' => 'ARRAY',
                                'items' => [
                                    'type' => 'OBJECT',
                                    'properties' => [
                                        'pct' => ['type' => 'INTEGER'],
                                        'text' => ['type' => 'STRING']
                                    ],
                                    'required' => ['pct', 'text']
                                ]
                            ],
                            'actionPlan' => [
                                'type' => 'ARRAY',
                                'items' => [
                                    'type' => 'OBJECT',
                                    'properties' => [
                                        'icon' => ['type' => 'STRING'],
                                        'text' => ['type' => 'STRING']
                                    ],
                                    'required' => ['icon', 'text']
                                ]
                            ]
                        ],
                        'required' => ['executiveSummary', 'struggles', 'actionPlan']
                    ]
                ]
            ]);

            if ($response->successful()) {
                $resultData = $response->json();
                $aiJsonString = $resultData['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
                $aiData = json_decode($aiJsonString, true);

                DB::table('class_ai_analytics')->insert([
                    'class_id'             => $classId,
                    'ai_executive_summary' => $aiData['executiveSummary'] ?? 'Gagal membuat ringkasan.',
                    'struggle_points_json' => json_encode($aiData['struggles'] ?? []),
                    'action_plan'          => json_encode($aiData['actionPlan'] ?? []),
                    'analyzed_at'          => Carbon::now(),
                    'created_at'           => Carbon::now(),
                    'updated_at'           => Carbon::now(),
                ]);

                return redirect()->back();
            }

            Log::error('Gemini API Error di Objek Response: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Koneksi Gagal/Exception Terdeteksi: ' . $e->getMessage());
        }

        return Inertia::render('Teacher/Analytics', [
            'aiDiagnostic' => $this->getFallbackDiagnostic($classId),
        ]);
    }

    private function getFallbackDiagnostic(int $classId): array
    {
        $topics = collect($this->getTopicAnalytics($classId));
        $stats  = $this->getClassStats($classId);

        if ($topics->isEmpty()) {
            return $this->emptyDiagnostic();
        }

        $bestTopic   = $topics->sortByDesc('pct')->first();
        $worstTopics = $topics->sortBy('pct')->take(3)->values();

        $executiveSummary = sprintf(
            'Halo! Berdasarkan rekap data, siswa kelasmu menunjukkan penguasaan materi paling matang pada topik "%s" dengan rata-rata akurasi %d%%. '
            . 'Namun, fokus bimbingan intensif sangat diperlukan pada materi "%s" karena akurasi rata-rata barunya menyentuh %d%%.',
            $bestTopic['topic'],
            $bestTopic['pct'],
            $worstTopics->first()['topic'],
            $worstTopics->first()['pct']
        );

        $struggles = $worstTopics->map(function ($topic) {
            return [
                'pct'  => 100 - $topic['pct'],
                'text' => sprintf('Siswa terindikasi mengalami kendala pemahaman konsep pada kompetensi dasar "%s" (Akurasi kelas: %d%%).', $topic['topic'], $topic['pct']),
            ];
        })->toArray();

        $actionPlan = [
            ['icon' => '💡', 'text' => sprintf('Buka kembali pembahasan materi dasar khusus untuk topik "%s" pada sela jam produktif.', $worstTopics->first()['topic'])],
            ['icon' => '🎯', 'text' => 'Gunakan fitur AI Case Maker untuk merilis latihan soal berstatus [Beginner] guna memicu kembali kepercayaan diri siswa.'],
            ['icon' => '📋', 'text' => 'Pantau menu Performa Murid untuk memberikan bimbingan personal via chat kepada siswa di peringkat bawah.'],
        ];

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
            'executiveSummary' => 'Belum ada cukup data submission siswa untuk dievaluasi oleh AI.',
            'struggles'        => [],
            'actionPlan'       => [],
            'generatedAt'      => Carbon::now()->toIso8601String(),
        ];
    }

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
}
