<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher\Task;
use App\Models\Teacher\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MakerController extends Controller
{
    public function index()
    {
        $teacherId = Auth::id();

        $tasks = Task::where('teacher_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($task) {
                $topicTags = [
                    'PPh 21 (Income Tax)' => 'PPh 21',
                    'PPh 23 (Withholding Tax)' => 'PPh 23',
                    'PPh 25 (Corporate Tax)' => 'PPh 25',
                    'PPN (Value Added Tax)' => 'PPN',
                    'PPnBM (Luxury Goods Tax)' => 'PPnBM',
                    'Bes Meterai (Stamp Duty)' => 'Meterai',
                ];

                $diffMap = [
                    'beginner' => 1,
                    'intermediate' => 2,
                    'advanced' => 3
                ];

                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'tag' => $topicTags[$task->tax_topic] ?? $task->tax_topic,
                    'diff' => $diffMap[$task->difficulty] ?? 2,
                    'source' => $task->source_type === 'ai' ? 'AI' : 'Manual',
                    'released' => (bool) $task->is_released,
                    'age' => $task->created_at ? $task->created_at->diffForHumans() : 'baru saja',

                    'description' => $task->description,
                    'correct_answer' => $task->correct_answer,
                    'deadline' => $task->deadline,
                ];
            });

        return Inertia::render('Teacher/Maker', [
            'tasksBank' => $tasks
        ]);
    }

    public function generateAiCase(Request $request)
    {
        $request->validate([
            'tax_topic' => 'required|string',
            'difficulty' => 'required|string|in:Beginner,Intermediate,Advanced',
            'deadline' => 'required|date|after:now',
        ]);

        $teacherId = Auth::id();
        $class = DB::table('classes')->where('teacher_id', $teacherId)->first();
        $classId = $class ? $class->id : 1;

        $xpRewards = [
            'Beginner' => 30,
            'Intermediate' => 60,
            'Advanced' => 90
        ];
        $xp = $xpRewards[$request->difficulty] ?? 30;

        $topic = $request->tax_topic;
        $difficulty = $request->difficulty;

        $systemInstruction = "Anda adalah seorang guru produktif Akuntansi SMK yang ramah, seru, dan ahli perpajakan Indonesia. Anda sedang membuat soal cerita interaktif berbasis gamifikasi. Panggil siswa dengan sebutan 'kamu'. Gunakan bahasa yang komunikatif, semi-santai, tidak kaku, namun tetap edukatif agar siswa SMK mudah paham.";

        $prompt = "Buatlah satu soal cerita studi kasus perpajakan Indonesia terbaru dengan ketentuan berikut:\n"
                . "- Topik Pajak: {$topic}\n"
                . "- Tingkat Kesulitan: {$difficulty}\n"
                . "- Ketentuan Gaya Bahasa & Panjang Soal:\n"
                . "  * Wajib panggil siswa dengan kata 'kamu'. Jangan gunakan kata 'Anda'.\n"
                . "  * Jika tingkat kesulitan 'Beginner': Soal harus pendek, to the point, dan sederhana (maksimal 3-4 kalimat cerita). Berikan data angka yang langsung siap dihitung tanpa jebakan analisis yang rumit.\n"
                . "  * Jika tingkat kesulitan 'Intermediate/Advanced': Soal boleh sedikit lebih panjang dengan menambahkan skenario studi kasus atau analisis regulasi perpajakan yang lebih mendalam.\n"
                . "- Karakter/Latar: Buat latar cerita dunia kerja fiktif atau proyek seru (misal: dunia game, magang di industri, proyek kreatif, atau UMKM kekinian).\n"
                . "- Instruksi Jawaban Soal: Di akhir cerita soal, Anda WAJIB menambahkan kalimat petunjuk ini:\n"
                . "  '*(Catatan: Masukkan hasil akhir berupa angka saja tanpa perlu mengetik Rp, titik, atau koma. Sistem ApTax akan otomatis memformat jawaban kamu menjadi Rupiah secara real-time. Contoh: jika jawabannya Rp1.200.000, cukup ketik 1200000)*'.\n"
                . "- Kunci Jawaban: Hitunglah dengan sangat akurat secara matematis berdasarkan hukum perpajakan Indonesia yang masih berlaku berdasarkan peraturan direktorat Jenderal pajak jangan menggunakan peraturan yang sudah dicabut atau tarif lama dan semua materi untuk soal harus mengacu pada https://pajak.go.id, UU HPP, JDIH BPK RI, PMK, (seperti tarif PPN 12% jika barang mewah, PPh 23 atas jasa sebesar 2%, atau skema TER PPh 21 jika relevan). Berikan hasil akhir angka bulat tersebut sebagai correct_answer.";

        $apiKey = env('GEMINI_API_KEY');
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
                        'title' => [
                            'type' => 'STRING',
                            'description' => 'Judul studi kasus perpajakan yang seru dan merepresentasikan tingkat kesulitan.'
                        ],
                        'description' => [
                            'type' => 'STRING',
                            'description' => 'Cerita studi kasus sesuai panduan panjang kesulitan, diakhiri dengan pertanyaan dan kalimat instruksi catatan kaki.'
                        ],
                        'correct_answer' => [
                            'type' => 'STRING',
                            'description' => 'Hasil perhitungan akhir yang MUTLAK hanya berupa karakter angka/digit saja (contoh: "300000"). Dilarang menyertakan Rp, titik, atau koma.'
                        ]
                    ],
                    'required' => ['title', 'description', 'correct_answer']
                ]
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API Error: ' . $response->body());
            return redirect()->back()->with('error', 'Gagal membuat soal via AI. Silakan coba lagi.');
        }

        $resultData = $response->json();
        $aiJsonString = $resultData['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
        $caseData = json_decode($aiJsonString, true);

        $generatedTitle = $caseData['title'] ?? "Studi Kasus Perpajakan - " . $topic;
        $generatedDesc = $caseData['description'] ?? "Gagal memuat deskripsi soal secara otomatis.";
        $correctAnswer = $caseData['correct_answer'] ?? "0";

        // Sanitisasi ketat agar jika AI khilaf, string non-angka langsung dibersihkan sebelum masuk DB
        $correctAnswer = preg_replace('/[^0-9]/', '', $correctAnswer);

        Task::create([
            'teacher_id' => $teacherId,
            'class_id' => $classId,
            'title' => $generatedTitle . " [" . $difficulty . " Mode]",
            'description' => $generatedDesc,
            'difficulty' => strtolower($difficulty),
            'tax_topic' => $topic,
            'source_type' => 'ai',
            'correct_answer' => $correctAnswer,
            'xp_reward' => $xp,
            'deadline' => $request->deadline,
            'is_released' => 0,
        ]);

        return redirect()->back();
    }

    public function storeManualCase(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'tax_topic' => 'required|string',
            'description' => 'required|string',
            'correct_answer' => 'required|string',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
            'deadline' => 'required|date',
        ]);

        $teacherId = Auth::id();
        $class = ClassModel::where('teacher_id', $teacherId)->first();
        $classId = $class ? $class->id : 1;

        $xpRewards = [
            'beginner' => 30,
            'intermediate' => 60,
            'advanced' => 90
        ];
        $xp = $xpRewards[$request->difficulty] ?? 30;

        Task::create([
            'teacher_id' => $teacherId,
            'class_id' => $classId,
            'title' => $request->title,
            'tax_topic' => $request->tax_topic,
            'description' => $request->description,
            'correct_answer' => $request->correct_answer,
            'difficulty' => $request->difficulty,
            'xp_reward' => $xp,
            'deadline' => $request->deadline,
            'source_type' => 'manual',
            'is_released' => 0,
        ]);

        return redirect()->route('teacher.maker');
    }

    public function toggleRelease(int $taskId)
    {
        $task = Task::where('id', $taskId)
                    ->where('teacher_id', Auth::id())
                    ->firstOrFail();

        $task->is_released = !$task->is_released;
        $task->save();

        return redirect()->back();
    }
}
