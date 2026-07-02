<?php

namespace App\Http\Controllers;

use App\Models\Teacher\Task;
use App\Models\Student\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function home()
    {
        $user      = Auth::user();
        $studentId = $user->id;

        $classId = DB::table('class_students')
            ->where('student_id', $studentId)
            ->value('class_id');

        $latestTask       = null;
        $latestSubmission = null;

        if ($classId) {
            $latestTask = Task::where('class_id', $classId)
                ->where('is_released', true)
                ->latest()
                ->first();

            if ($latestTask) {
                $latestSubmission = Submission::where('task_id', $latestTask->id)
                    ->where('student_id', $studentId)
                    ->first();
            }
        }

        return Inertia::render('Student/Home', [
            'latestTask' => $latestTask ? [
                'id'               => $latestTask->id,
                'title'            => $latestTask->title,
                'description'      => $latestTask->description,
                'difficulty'       => $latestTask->difficulty,
                'tax_topic'        => $latestTask->tax_topic,
                'correct_answer'   => $latestTask->correct_answer,
                'xp_reward'        => $latestTask->xp_reward,
                'deadline'         => $latestTask->deadline,
                'is_past_deadline' => now()->greaterThan($latestTask->deadline),
            ] : null,
            'latestSubmission' => $latestSubmission ? [
                'ai_score'  => $latestSubmission->ai_score,
                'xp_earned' => $latestSubmission->ai_score !== null
                    ? (int) round(($latestSubmission->ai_score / 100) * $latestTask->xp_reward)
                    : 0,
            ] : null,
        ]);
    }

    public function submitTask(Request $request)
    {
        $request->validate([
            // FIX: ubah dari 'submitted_answer' → 'student_answer'
            // agar seragam dengan AnswerModal dan TaskController
            'task_id'        => 'required|exists:tasks,id',
            'student_answer' => 'required|string|max:2000',
        ]);

        $user = Auth::user();
        $task = Task::findOrFail($request->task_id);

        if (Submission::where('task_id', $task->id)->where('student_id', $user->id)->exists()) {
            return back()->with('flash', ['alreadySubmitted' => true]);
        }

        $isPastDeadline = now()->greaterThan($task->deadline);

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
                default             => 30,
            };
        } else {
            similar_text($studentAnswer, $correctAnswer, $similarityPercent);
            $aiScore = (int) round($similarityPercent);
        }

        $baseXp       = (int) round(($aiScore / 100) * $task->xp_reward);
        $xpEarned     = $isPastDeadline ? (int) round($baseXp * 0.5) : $baseXp;
        $pointPenalty = $isPastDeadline ? 20 : 0;

        Submission::create([
            'task_id'        => $task->id,
            'student_id'     => $user->id,
            'student_answer' => $request->student_answer,
            'ai_score'       => $aiScore,
            'ai_feedback'    => $this->generateFeedback($aiScore, $task->correct_answer, $task, $isPastDeadline),
            'status'         => 'evaluation',
        ]);

        DB::table('users')
            ->where('id', $user->id)
            ->increment('total_exp', $xpEarned);

        if ($pointPenalty > 0) {
            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'total_point' => DB::raw("GREATEST(0, COALESCE(total_point, 0) - {$pointPenalty})")
                ]);
        }

        return back()->with('flash', [
            'isCorrect'      => $aiScore >= 95,
            'aiScore'        => $aiScore,
            'xpChange'       => $xpEarned,
            'pointPenalty'   => $pointPenalty,
            'isPastDeadline' => $isPastDeadline,
            'correctAnswer'  => $task->correct_answer,
        ]);
    }

    private function generateFeedback(int $score, string $correctAnswer, Task $task, bool $isPastDeadline = false): string
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
                . "Jawaban kamu pada topik {$topic} sudah sangat tepat (Akurasi: {$score}%).\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "Kamu telah menunjukkan penguasaan materi yang luar biasa. Pertahankan performa ini!"
                . $lateWarning,

            $score >= 75 =>
                "👍 Hasil Evaluasi AI: Cukup Baik\n\n"
                . "Jawaban kamu pada topik {$topic} sudah mendekati benar (Akurasi: {$score}%).\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "Kemungkinan ada kesalahan kecil pada pembulatan atau penulisan. Evaluasi kembali langkah pengerjaanmu."
                . $lateWarning,

            $score >= 45 =>
                "📑 Hasil Evaluasi AI: Perlu Perbaikan\n\n"
                . "Jawaban kamu untuk topik {$topic} mendapatkan skor {$score}%.\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "Masih ada gap yang cukup jauh. Periksa kembali rumus tarif dan diskusikan dengan guru."
                . $lateWarning,

            default =>
                "⛔ Hasil Evaluasi AI: Kurang Tepat\n\n"
                . "Jawaban kamu untuk topik {$topic} belum sesuai (Skor: {$score}%).\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "Ada kesalahan fundamental pada logika perhitungan. Baca ulang materi modul terkait."
                . $lateWarning,
        };
    }
}
