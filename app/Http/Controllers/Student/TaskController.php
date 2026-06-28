<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Teacher\Task;
use App\Models\Student\Submission;
use App\Models\Shared\SubmissionFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        $student   = Auth::user();
        $studentId = $student->id;

        $classIds = DB::table('class_students')
            ->where('student_id', $studentId)
            ->pluck('class_id');

        $submittedTaskIds = Submission::where('student_id', $studentId)
            ->pluck('task_id');

        // ── ACTIVE TASKS (termasuk yang sudah lewat deadline tapi belum dikerjakan) ──
        $activeTasks = Task::whereIn('class_id', $classIds)
            ->where('is_released', true)
            ->whereNotIn('id', $submittedTaskIds)
            ->get()
            ->map(function (Task $task) {
                $isLate = now()->greaterThan($task->deadline);

                return [
                    'id'               => $task->id,
                    'title'            => $task->title,
                    'description'      => $task->description,
                    'difficulty'       => $task->difficulty,
                    'tax_topic'        => $task->tax_topic,
                    'xp_reward'        => $task->xp_reward,
                    // XP yang akan diterima jika dikerjakan terlambat (50%)
                    'xp_reward_late'   => (int) round($task->xp_reward * 0.5),
                    'deadline'         => $task->deadline,
                    'is_late'          => $isLate,
                    'due_label'        => $this->formatDueLabel($task->deadline),
                    'status'           => $isLate ? 'Late' : 'Active',
                ];
            });

        $evaluationTasks = Submission::where('student_id', $studentId)
            ->with([
                'task',
                'feedbacks' => fn($q) => $q->with('sender:id,name,role')->orderBy('created_at', 'asc'),
            ])
            ->get()
            ->map(function (Submission $submission) {
                return [
                    'submission_id'  => $submission->id,
                    'task_id'        => $submission->task_id,
                    'title'          => $submission->task->title,
                    'description'    => $submission->task->description,
                    'tax_topic'      => $submission->task->tax_topic,
                    'student_answer' => $submission->student_answer,
                    'ai_score'       => $submission->ai_score,
                    'ai_feedback'    => $submission->ai_feedback,
                    'xp_earned'      => $submission->ai_score !== null
                        ? (int) round(($submission->ai_score / 100) * $submission->task->xp_reward)
                        : 0,
                    'status'         => 'Reviewed',
                    'submitted_at'   => $submission->created_at,
                    'feedbacks'      => $submission->feedbacks->map(fn($f) => [
                        'id'        => $f->id,
                        'sender_id' => $f->sender_id,
                        'name'      => $f->sender->name,
                        'role'      => $f->sender->role,
                        'message'   => $f->message,
                        'time'      => $f->created_at->format('H:i'),
                    ]),
                ];
            });

        return Inertia::render('Student/Tasks', [
            'activeTasks'     => $activeTasks,
            'evaluationTasks' => $evaluationTasks,
            'currentUser'     => [
                'id'   => $student->id,
                'name' => $student->name,
                'role' => $student->role,
            ],
        ]);
    }

    public function submitAnswer(Request $request, int $taskId)
    {
        $request->validate([
            'student_answer' => 'required|string|max:2000',
        ]);

        $student = Auth::user();
        $task    = Task::findOrFail($taskId);

        if (Submission::where('task_id', $taskId)->where('student_id', $student->id)->exists()) {
            return back()->with('error', 'Kamu sudah mengerjakan tugas ini sebelumnya.');
        }

        $isPastDeadline = now()->greaterThan($task->deadline);

        // ── Hitung skor kemiripan ──
        $studentAnswer = strtolower(trim($request->student_answer));
        $correctAnswer = strtolower(trim($task->correct_answer));
        $cleanStudent  = preg_replace('/[^0-9]/', '', $studentAnswer);
        $cleanCorrect  = preg_replace('/[^0-9]/', '', $correctAnswer);

        if ($studentAnswer === $correctAnswer || (!empty($cleanStudent) && $cleanStudent === $cleanCorrect)) {
            $aiScore = 100;
        } elseif (is_numeric($cleanCorrect) && is_numeric($cleanStudent) && (int)$cleanCorrect > 0) {
            $correctNum   = (int)$cleanCorrect;
            $studentNum   = (int)$cleanStudent;
            $errorPercent = (abs($correctNum - $studentNum) / $correctNum) * 100;

            $aiScore = match (true) {
                $errorPercent <= 5  => 95,
                $errorPercent <= 15 => 85,
                $errorPercent <= 30 => 70,
                $errorPercent <= 50 => 50,
                default             => 20,
            };
        } else {
            similar_text($studentAnswer, $correctAnswer, $similarityPercent);
            $aiScore = (int) round($similarityPercent);
        }

        // ── XP proporsional + penalti 50% jika terlambat ──
        $baseXp   = (int) round(($aiScore / 100) * $task->xp_reward);
        $xpEarned = $isPastDeadline ? (int) round($baseXp * 0.5) : $baseXp;

        // ── Penalti poin -20 jika terlambat ──
        $pointPenalty = $isPastDeadline ? 20 : 0;

        Submission::create([
            'task_id'        => $task->id,
            'student_id'     => $student->id,
            'student_answer' => $request->student_answer,
            'ai_score'       => $aiScore,
            'ai_feedback'    => $this->generateSimulatedFeedback($aiScore, $task->correct_answer, $task, $isPastDeadline),
            'status'         => 'evaluation',
        ]);

        // Update XP
        DB::table('users')
            ->where('id', $student->id)
            ->increment('total_exp', $xpEarned);

        // Kurangi poin jika terlambat
        if ($pointPenalty > 0) {
            DB::table('users')
                ->where('id', $student->id)
                ->update([
                    'total_point' => DB::raw("GREATEST(0, COALESCE(total_point, 0) - {$pointPenalty})")
                ]);
        }

        return redirect()->route('student.tasks')
            ->with('success', $isPastDeadline
                ? "Jawaban dikumpulkan (terlambat). +{$xpEarned} XP (50%) · -{$pointPenalty} Poin."
                : "Jawaban berhasil dikumpulkan! Kamu mendapatkan {$xpEarned} XP."
            );
    }

    public function storeChatFeedback(Request $request, int $submissionId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $student    = Auth::user();
        $submission = Submission::findOrFail($submissionId);

        if ($submission->student_id !== $student->id) {
            abort(403, 'Tidak diizinkan.');
        }

        SubmissionFeedback::create([
            'submission_id' => $submission->id,
            'sender_id'     => $student->id,
            'message'       => $request->message,
        ]);

        return back();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function formatDueLabel(\DateTime|string $deadline): string
    {
        $due  = \Carbon\Carbon::parse($deadline);
        $now  = now();
        $diff = (int) $now->diffInDays($due, false);

        if ($diff < 0) {
            return 'Was due: ' . $due->translatedFormat('l');
        } elseif ($diff === 0) {
            return 'Due: Today, ' . $due->format('H:i');
        } elseif ($diff === 1) {
            return 'Due: Tomorrow, ' . $due->format('H:i');
        }

        return 'Due: ' . $due->translatedFormat('l, d M');
    }

    private function generateSimulatedFeedback(int $score, string $correctAnswer, Task $task, bool $isPastDeadline = false): string
    {
        $topic        = $task->tax_topic;
        $formattedKey = is_numeric($correctAnswer)
            ? 'Rp ' . number_format((float)$correctAnswer, 0, ',', '.')
            : $correctAnswer;

        $lateWarning = $isPastDeadline
            ? "\n\n⚠️ *Catatan: Tugas dikerjakan setelah deadline. XP yang diperoleh berkurang 50% dan terdapat penalti -20 poin.*"
            : '';

        return match (true) {
            $score >= 95 =>
                "🌟 Hasil Evaluasi AI: Sempurna!\n\n"
                . "Jawaban kamu pada topik {$topic} sudah sangat tepat dan akurat (Akurasi: {$score}%).\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "Kamu telah menunjukkan penguasaan materi yang luar biasa. Pertahankan performa hebat ini!"
                . $lateWarning,

            $score >= 75 =>
                "👍 Hasil Evaluasi AI: Cukup Baik\n\n"
                . "Jawaban kamu pada topik {$topic} sudah mendekati benar dengan tingkat akurasi sebesar {$score}%.\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "Analisis Kekeliruan: Kemungkinan terdapat kesalahan kecil pada pembulatan angka atau penulisan. Evaluasi kembali langkah pengerjaanmu."
                . $lateWarning,

            $score >= 45 =>
                "📑 Hasil Evaluasi AI: Perlu Perbaikan\n\n"
                . "Jawaban yang kamu kumpulkan untuk topik {$topic} mendapatkan skor evaluasi sebesar {$score}%.\n"
                . "* Kunci Jawaban Resmi: `{$formattedKey}`\n\n"
                . "Analisis Kesalahan: Perhitungan nominal akhir kamu masih memiliki gap yang cukup jauh. Silakan diskusikan langkah pengerjaannya bersama guru."
                . $lateWarning,

            default =>
                "⛔ Hasil Evaluasi AI: Kurang Tepat\n\n"
                . "Mohon maaf, jawaban kamu untuk topik {$topic} belum sesuai dengan regulasi perhitungan perpajakan yang benar (Skor Akurasi: {$score}%).\n"
                . "* Kunci Jawaban Resmi: `{$formattedKey}`\n\n"
                . "Saran Pembelajaran: Terjadi kesalahan fundamental pada logika perhitungan. Sangat disarankan untuk membaca kembali materi modul terkait."
                . $lateWarning,
        };
    }
}
