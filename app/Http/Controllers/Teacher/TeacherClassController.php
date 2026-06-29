<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Shared\SubmissionFeedback;
use App\Models\Student\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherClassController extends Controller
{
    public function index()
    {
        $teacherId = Auth::id();

        $class = DB::table('classes')
            ->where('teacher_id', $teacherId)
            ->first();

        if (! $class) {
            return Inertia::render('Teacher/TeacherClass', [
                'classInfo'    => null,
                'studentsList' => [],
                'classStats'   => ['total' => 0, 'avgProgress' => 0, 'tuntas' => 0],
                'activityLogs' => [],
                'currentUser'  => ['id' => $teacherId, 'name' => Auth::user()->name],
            ]);
        }

        $classId       = $class->id;
        $totalTasks    = DB::table('tasks')
            ->where('class_id', $classId)
            ->where('is_released', true)
            ->count();

        $students = DB::table('class_students as cs')
            ->join('users as u', 'u.id', '=', 'cs.student_id')
            ->where('cs.class_id', $classId)
            ->select('u.id', 'u.name', 'u.total_exp')
            ->get();

        $studentsList = $students->map(function ($s) use ($classId, $totalTasks) {
            $done = DB::table('submissions as sb')
                ->join('tasks as t', 't.id', '=', 'sb.task_id')
                ->where('t.class_id', $classId)
                ->where('sb.student_id', $s->id)
                ->where('sb.status', 'evaluation')
                ->count();

            $progress = $totalTasks > 0
                ? (int) round(($done / $totalTasks) * 100)
                : 0;

            $lastSub = DB::table('submissions as sb')
                ->join('tasks as t', 't.id', '=', 'sb.task_id')
                ->where('sb.student_id', $s->id)
                ->where('t.class_id', $classId)
                ->orderByDesc('sb.updated_at')
                ->select('t.title', 'sb.updated_at')
                ->first();

            $lastActivity = $lastSub
                ? 'Menyelesaikan ' . $lastSub->title
                : 'Belum ada aktivitas';
            $activityType = $lastSub ? 'done' : 'inactive';

            $initials = collect(explode(' ', $s->name))
                ->take(2)
                ->map(fn($w) => strtoupper($w[0]))
                ->implode('');

            $level = max(1, (int) floor($s->total_exp / 100) + 1);

            return [
                'id'           => $s->id,
                'name'         => $s->name,
                'initials'     => $initials,
                'xp'           => $s->total_exp,
                'level'        => $level,
                'progress'     => $progress,
                'lastActivity' => $lastActivity,
                'activityType' => $activityType,
            ];
        });

        $total      = $studentsList->count();
        $avgProgress = $total > 0
            ? (int) round($studentsList->avg('progress'))
            : 0;
        $tuntas     = $studentsList->where('progress', 100)->count();

        $activityLogs = DB::table('submissions as sb')
            ->join('tasks as t', 't.id', '=', 'sb.task_id')
            ->join('users as u', 'u.id', '=', 'sb.student_id')
            ->where('t.class_id', $classId)
            ->where('sb.status', 'evaluation')
            ->orderByDesc('sb.updated_at')
            ->limit(5)
            ->select('u.name as studentName', 't.title as taskTitle', 'sb.ai_score', 'sb.updated_at')
            ->get()
            ->map(fn($log) => [
                'label'  => "{$log->studentName} menyelesaikan {$log->taskTitle}",
                'score'  => $log->ai_score,
                'time'   => \Carbon\Carbon::parse($log->updated_at)->diffForHumans(),
            ]);

        return Inertia::render('Teacher/TeacherClass', [
            'classInfo'    => ['id' => $class->id, 'name' => $class->class_name, 'code' => $class->class_code],
            'studentsList' => $studentsList->values(),
            'classStats'   => ['total' => $total, 'avgProgress' => $avgProgress, 'tuntas' => $tuntas],
            'activityLogs' => $activityLogs,
            'currentUser'  => ['id' => $teacherId, 'name' => Auth::user()->name],
        ]);
    }

    public function showStudentDetail(int $studentId)
    {
        $teacherId = Auth::id();

        $class = DB::table('classes')->where('teacher_id', $teacherId)->first();
        abort_unless($class, 403, 'Kelas tidak ditemukan.');

        $classId = $class->id;

        $isMember = DB::table('class_students')
            ->where('class_id', $classId)
            ->where('student_id', $studentId)
            ->exists();
        abort_unless($isMember, 403, 'Siswa bukan anggota kelas ini.');

        $student = DB::table('users')->where('id', $studentId)->first();

        $tasks = DB::table('tasks as t')
            ->where('t.class_id', $classId)
            ->where('t.is_released', true)
            ->leftJoin('submissions as sb', function ($join) use ($studentId) {
                $join->on('sb.task_id', '=', 't.id')
                     ->where('sb.student_id', '=', $studentId);
            })
            ->select(
                't.id as task_id',
                't.title',
                't.tax_topic',
                't.xp_reward',
                'sb.id as submission_id',
                'sb.ai_score',
                'sb.ai_feedback',
                'sb.student_answer',
                'sb.status',
            )
            ->get()
            ->map(function ($t) {
                if (! $t->submission_id) {
                    return [
                        'id'            => $t->task_id,
                        'submission_id' => null,
                        'title'         => $t->title,
                        'tax_topic'     => $t->tax_topic,
                        'xp_reward'     => $t->xp_reward,
                        'done'          => false,
                        'score'         => null,
                        'aiFeedback'    => null,
                        'studentAnswer' => null,
                        'thread'        => [],
                    ];
                }

                $thread = DB::table('submission_feedbacks as sf')
                    ->join('users as u', 'u.id', '=', 'sf.sender_id')
                    ->where('sf.submission_id', $t->submission_id)
                    ->orderBy('sf.created_at')
                    ->select('sf.id', 'sf.sender_id', 'u.name', 'u.role', 'sf.message', 'sf.created_at')
                    ->get()
                    ->map(fn($m) => [
                        'id'       => $m->id,
                        'senderId' => $m->sender_id,
                        'sender'   => $m->role === 'guru' ? 'guru' : 'siswa',
                        'name'     => $m->name,
                        'avatar'   => strtoupper($m->name[0]),
                        'message'  => $m->message,
                        'time'     => \Carbon\Carbon::parse($m->created_at)->format('H:i'),
                    ]);

                return [
                    'id'            => $t->task_id,
                    'submission_id' => $t->submission_id,
                    'title'         => $t->title,
                    'tax_topic'     => $t->tax_topic,
                    'xp_reward'     => $t->xp_reward,
                    'done'          => true,
                    'score'         => $t->ai_score,
                    'aiFeedback'    => $t->ai_feedback,
                    'studentAnswer' => $t->student_answer,
                    'thread'        => $thread,
                ];
            });

        $initials = collect(explode(' ', $student->name))
            ->take(2)->map(fn($w) => strtoupper($w[0]))->implode('');

        return response()->json([
            'id'       => $student->id,
            'name'     => $student->name,
            'initials' => $initials,
            'xp'       => $student->total_exp,
            'level'    => max(1, (int) floor($student->total_exp / 100) + 1),
            'tasks'    => $tasks->values(),
        ]);
    }

    public function storeTeacherMessage(Request $request, int $submissionId)
    {
        $request->validate(['message' => 'required|string|max:2000']);

        $teacherId  = Auth::id();
        $submission = Submission::findOrFail($submissionId);
        $classId = DB::table('classes')->where('teacher_id', $teacherId)->value('id');
        $taskBelongsToClass = DB::table('tasks')
            ->where('id', $submission->task_id)
            ->where('class_id', $classId)
            ->exists();
        abort_unless($taskBelongsToClass, 403, 'Tidak diizinkan.');

        $feedback = SubmissionFeedback::create([
            'submission_id' => $submissionId,
            'sender_id'     => $teacherId,
            'message'       => $request->message,
        ]);

        $teacher = Auth::user();

        return response()->json([
            'id'       => $feedback->id,
            'senderId' => $teacher->id,
            'sender'   => 'guru',
            'name'     => $teacher->name,
            'avatar'   => strtoupper($teacher->name[0]),
            'message'  => $feedback->message,
            'time'     => $feedback->created_at->format('H:i'),
        ], 201);
    }
}
