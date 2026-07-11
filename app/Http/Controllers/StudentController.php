<?php

namespace App\Http\Controllers;

use App\Models\Teacher\Task;
use App\Models\Student\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        $aiFeedback = $this->generateFeedback(
            $aiScore,
            $task->correct_answer,
            $task,
            $request->student_answer,
            $isPastDeadline
        );

        Submission::create([
            'task_id'        => $task->id,
            'student_id'     => $user->id,
            'student_answer' => $request->student_answer,
            'ai_score'       => $aiScore,
            'ai_feedback'    => $aiFeedback,
            'status'         => 'evaluation',
        ]);

        DB::table('users')
            ->where('id', $user->id)
            ->increment('total_exp', $xpEarned);

        if ($pointPenalty > 0) {
            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'total_exp' => DB::raw("GREATEST(0, COALESCE(total_exp, 0) - {$pointPenalty})")
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

    private function generateFeedback(int $score, string $correctAnswer, Task $task, string $studentAnswer, bool $isPastDeadline = false): string
    {
        $topic        = $task->tax_topic;
        $formattedKey = is_numeric($correctAnswer)
            ? 'Rp ' . number_format((float)$correctAnswer, 0, ',', '.')
            : $correctAnswer;

        $formattedStudentAnswer = is_numeric($studentAnswer)
            ? 'Rp ' . number_format((float)$studentAnswer, 0, ',', '.')
            : $studentAnswer;

        $lateWarning = $isPastDeadline
            ? "\n\n⚠️ *Catatan: Tugas dikerjakan setelah deadline. XP yang diperoleh berkurang 50% dan terdapat penalti -20 poin.*"
            : '';

        $systemInstruction = "Anda adalah seorang guru produktif Akuntansi SMK yang ramah, seru, memberikan kritik membangun, dan ahli perpajakan Indonesia. Panggil siswa dengan sebutan 'kamu'. Gunakan bahasa yang komunikatif, semi-santai, tidak kaku, namun tetap edukatif agar siswa SMK mudah paham.";

        $prompt = "Berikan analisis umpan balik (feedback) singkat dan tips belajar yang spesifik berdasarkan data berikut:\n"
                . "- Topik Pajak: {$topic}\n"
                . "- Deskripsi Soal: {$task->description}\n"
                . "- Kunci Jawaban Resmi: {$formattedKey}\n"
                . "- Jawaban Siswa: {$formattedStudentAnswer}\n"
                . "- Tingkat Akurasi/Skor Siswa: {$score}%\n\n"
                . "Ketentuan Output:\n"
                . "- Jika skor 100 atau >= 95: Berikan apresiasi yang seru dan validasi logika mereka yang sudah sempurna.\n"
                . "- Jika skor 75-94: Berikan apresiasi, lalu analisis kemungkinan kekeliruan kecilnya (misal: salah input angka, pembulatan, atau salah tarif TER/PPN sedikit).\n"
                . "- Jika skor < 75: Jangan menghakimi. Berikan kalimat penyemangat, sebutkan letak perbedaan angka yang jauh, dan berikan tips bagian materi mana dari topik {$topic} yang harus dibaca ulang.";

        $aiAnalysis = "Gagal memproses analisis otomatis dari AI.";

        $apiKey = env('GEMINI_API_KEY');

        Log::info('Gemini Feedback (StudentController): memulai request', [
            'task_id'     => $task->id,
            'score'       => $score,
            'key_present' => !empty($apiKey),
        ]);

        try {
            $response = Http::timeout(20)->withHeaders([
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
                            'analysis_feedback' => [
                                'type' => 'STRING',
                                'description' => 'Ulasan analisis interaktif dan tips koreksi jawaban dari sudut pandang guru akuntansi SMK yang ramah (maksimal 3-4 kalimat).'
                            ]
                        ],
                        'required' => ['analysis_feedback']
                    ]
                ]
            ]);

            Log::info('Gemini Feedback (StudentController): response diterima', [
                'status' => $response->status(),
            ]);

            if ($response->successful()) {
                $resultData = $response->json();
                $aiJsonString = $resultData['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
                $feedbackData = json_decode($aiJsonString, true);
                $aiAnalysis = $feedbackData['analysis_feedback'] ?? $aiAnalysis;
            } else {
                \Illuminate\Support\Facades\Log::error('Gemini Feedback API Error (StudentController): [' . $response->status() . '] ' . $response->body());
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gemini Feedback Exception (StudentController): ' . $e->getMessage());
        }

        return match (true) {
            $score >= 95 =>
                "🌟 Hasil Evaluasi AI: Sempurna!\n\n"
                . "Jawaban kamu pada topik {$topic} sudah sangat tepat (Akurasi: {$score}%).\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "💬 *Analisis Guru AI*:\n{$aiAnalysis}"
                . $lateWarning,

            $score >= 75 =>
                "👍 Hasil Evaluasi AI: Cukup Baik\n\n"
                . "Jawaban kamu pada topik {$topic} sudah mendekati benar (Akurasi: {$score}%).\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "💬 *Analisis Guru AI*:\n{$aiAnalysis}"
                . $lateWarning,

            $score >= 45 =>
                "📑 Hasil Evaluasi AI: Perlu Perbaikan\n\n"
                . "Jawaban kamu untuk topik {$topic} mendapatkan skor {$score}%.\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "💬 *Analisis Guru AI*:\n{$aiAnalysis}"
                . $lateWarning,

            default =>
                "⛔ Hasil Evaluasi AI: Kurang Tepat\n\n"
                . "Jawaban kamu untuk topik {$topic} belum sesuai (Skor: {$score}%).\n"
                . "* Kunci Jawaban: `{$formattedKey}`\n\n"
                . "💬 *Analisis Guru AI*:\n{$aiAnalysis}"
                . $lateWarning,
        };
    }
}
