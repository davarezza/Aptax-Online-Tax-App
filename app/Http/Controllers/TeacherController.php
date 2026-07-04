<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function dashboard()
    {
        $teacherId   = Auth::id();
        $teacherName = Auth::user()->name;

        $class   = DB::table('classes')->where('teacher_id', $teacherId)->first();
        $classId = $class->id ?? null;
        $className = $class->class_name ?? 'Belum Ada Kelas';

        $studentIds = $classId
            ? DB::table('class_students')->where('class_id', $classId)->pluck('student_id')
            : collect();

        $totalStudents = $studentIds->count();

        $submissions = $studentIds->isNotEmpty()
            ? DB::table('submissions')->whereIn('student_id', $studentIds)->get()
            : collect();

        $totalSubmissions     = $submissions->count();
        $completedSubmissions = $submissions->where('status', 'evaluation')->count();

        $avgCompletionRate = $totalSubmissions > 0
            ? round(($completedSubmissions / $totalSubmissions) * 100)
            : 0;

        $scoredSubmissions = $submissions->whereNotNull('ai_score');
        $avgScore = $scoredSubmissions->isNotEmpty()
            ? round($scoredSubmissions->avg('ai_score'), 1)
            : 0;

        $studentPerformance = $studentIds->map(function ($sid) use ($submissions) {
            $scores = $submissions->where('student_id', $sid)->whereNotNull('ai_score');

            $avg = $scores->isNotEmpty() ? $scores->avg('ai_score') : null;

            return [
                'student_id' => $sid,
                'avg_score'  => $avg,
                'need_help'  => is_null($avg) || $avg < 60,
            ];
        });

        $studentsNeedHelp = $studentPerformance->where('need_help', true)->count();
        $studentsGood     = $totalStudents - $studentsNeedHelp;

        $statsOverview = [
            [
                'key'   => 'active_students',
                'label' => 'Siswa Aktif',
                'value' => (string) $totalStudents,
                'icon'  => '👥',
                'color' => 'bg-emerald-50 border-emerald-100 text-emerald-700',
            ],
            [
                'key'   => 'completion_rate',
                'label' => 'Rata-rata Selesai',
                'value' => $avgCompletionRate . '%',
                'icon'  => '✅',
                'color' => 'bg-orange-50 border-orange-100 text-orange-700',
            ],
            [
                'key'   => 'average_score',
                'label' => 'Rata-rata Skor',
                'value' => (string) $avgScore,
                'icon'  => '⭐',
                'color' => 'bg-amber-50 border-amber-100 text-amber-700',
            ],
            [
                'key'   => 'need_help',
                'label' => 'Butuh Bantuan',
                'value' => (string) $studentsNeedHelp,
                'icon'  => '🆘',
                'color' => 'bg-red-50 border-red-100 text-red-700',
            ],
        ];

        $donutChart = [
            ['name' => 'Performa Baik', 'value' => $studentsGood, 'color' => '#1A6B3C'],
            ['name' => 'Butuh Bantuan', 'value' => $studentsNeedHelp, 'color' => '#FAA042'],
        ];

        $barChart = DB::table('classes')->get()->map(function ($cls) use ($classId) {
            $ids = DB::table('class_students')->where('class_id', $cls->id)->pluck('student_id');

            $avg = $ids->isNotEmpty()
                ? DB::table('submissions')
                    ->whereIn('student_id', $ids)
                    ->whereNotNull('ai_score')
                    ->avg('ai_score')
                : null;

            return [
                'className'  => $cls->class_name,
                'avgScore'   => $avg ? round($avg, 1) : 0,
                'isCurrent'  => $cls->id === $classId,
            ];
        })->values();

        $releasedTasks = $classId
            ? DB::table('tasks')->where('class_id', $classId)->where('is_released', 1)->get()
            : collect();

        $studentsById = $studentIds->isNotEmpty()
            ? DB::table('users')->whereIn('id', $studentIds)->get()->keyBy('id')
            : collect();

        $now = Carbon::now();
        $lateItems = collect();

        foreach ($releasedTasks as $task) {
            $deadline = Carbon::parse($task->deadline);

            foreach ($studentIds as $sid) {
                $studentName = $studentsById[$sid]->name ?? 'Siswa';

                $submission = $submissions
                    ->where('task_id', $task->id)
                    ->where('student_id', $sid)
                    ->sortByDesc('created_at')
                    ->first();

                if (!$submission) {
                    if ($now->greaterThan($deadline)) {
                        $lateItems->push([
                            'student_id'   => $sid,
                            'student_name' => $studentName,
                            'task_title'   => $task->title,
                            'deadline'     => $deadline->format('d M Y, H:i'),
                            'submitted_at' => null,
                            'status'       => 'Belum Mengerjakan',
                            'days_late'    => (int) floor($deadline->diffInDays($now)),
                        ]);
                    }
                    continue;
                }

                $submittedAt = Carbon::parse($submission->created_at);

                if ($submittedAt->greaterThan($deadline)) {
                    $lateItems->push([
                        'student_id'   => $sid,
                        'student_name' => $studentName,
                        'task_title'   => $task->title,
                        'deadline'     => $deadline->format('d M Y, H:i'),
                        'submitted_at' => $submittedAt->format('d M Y, H:i'),
                        'status'       => 'Terlambat Mengumpulkan',
                        'days_late'    => (int) floor($deadline->diffInDays($submittedAt)),
                    ]);
                }
            }
        }

        $lateItems = $lateItems->sortByDesc('days_late')->values();
        $lateStudentsCount = $lateItems->pluck('student_id')->unique()->count();

        return Inertia::render('Teacher/Dashboard', [
            'teacherName' => $teacherName,
            'className'   => $className,
            'statsOverview' => $statsOverview,
            'chartData' => [
                'donutChart' => $donutChart,
                'barChart'   => $barChart,
            ],
            'lateSubmissions' => [
                'studentCount' => $lateStudentsCount,
                'items'        => $lateItems,
            ],
        ]);
    }
}