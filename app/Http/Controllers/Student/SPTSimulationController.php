<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student\SptSubmission;
use App\Models\Teacher\SptAssignment;
use App\Services\Student\SptWizardService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SPTSimulationController extends Controller
{
    public function __construct(private readonly SptWizardService $wizard)
    {
    }

    /**
     * Halaman "Tugas Aktif" — SATU list saja, tanpa tab Evaluasi/Feedback.
     * Soal yang sudah selesai (status evaluation) tetap muncul di bagian
     * bawah ("Selesai Baru-baru Ini") supaya siswa bisa review & unduh BPE.
     */
    public function index(): Response
    {
        $classIds = DB::table('class_students')
            ->where('student_id', Auth::id())
            ->pluck('class_id');

        $assignments = SptAssignment::query()
            ->whereIn('class_id', $classIds)
            ->where('is_released', true)
            ->orderBy('deadline')
            ->get();

        $submissions = SptSubmission::where('student_id', Auth::id())
            ->whereIn('spt_assignment_id', $assignments->pluck('id'))
            ->get()
            ->keyBy('spt_assignment_id');

        $aktif = [];
        $selesai = [];

        foreach ($assignments as $a) {
            $submission = $submissions->get($a->id);
            $isLate = now()->greaterThan($a->deadline);

            $item = [
                'id'             => $a->id,
                'title'          => $a->title,
                'description'    => $a->description,
                'xp_reward'      => $a->xp_reward,
                'deadline'       => $a->deadline->toIso8601String(),
                'deadline_label' => $a->deadline->translatedFormat('l, H:i'),
                'is_late'        => $isLate,
                'has_started'    => (bool) $submission,
            ];

            if ($submission && $submission->status === 'evaluation') {
                $item['final_score'] = $submission->final_score;
                $item['bpe_number']  = $submission->bpe_number;
                $selesai[] = $item;
            } else {
                $aktif[] = $item;
            }
        }

        return Inertia::render('Student/SptSimulation', [
            'aktif'   => $aktif,
            'selesai' => $selesai,
        ]);
    }

    /** Mulai (atau lanjutkan) simulasi untuk satu soal. */
    public function start(SptAssignment $sptAssignment): RedirectResponse
    {
        $submission = SptSubmission::firstOrCreate(
            ['spt_assignment_id' => $sptAssignment->id, 'student_id' => Auth::id()],
            ['status' => 'active', 'form_data' => $this->emptyFormData()]
        );

        return redirect()->route('student.spt-simulation.wizard', $sptAssignment);
    }

    /** Halaman chat wizard. */
    public function wizard(SptAssignment $sptAssignment): Response
    {
        $submission = SptSubmission::firstOrCreate(
            ['spt_assignment_id' => $sptAssignment->id, 'student_id' => Auth::id()],
            ['status' => 'active', 'form_data' => $this->emptyFormData()]
        );

        $ringkasan = $sptAssignment->ringkasan;
        $steps = $this->wizard->steps($ringkasan);

        return Inertia::render('Student/SptWizard', [
            'assignment' => [
                'id'        => $sptAssignment->id,
                'title'     => $sptAssignment->title,
                'xp_reward' => $sptAssignment->xp_reward,
                'deadline'  => $sptAssignment->deadline->toIso8601String(),
                'is_late'   => now()->greaterThan($sptAssignment->deadline),
            ],
            'detected_data'    => $this->wizard->detectedData($sptAssignment, $ringkasan),
            'steps_meta'       => array_map(fn ($s) => [
                'id' => $s['id'], 'langkah' => $s['langkah'], 'judul' => $s['judul'], 'type' => $s['type'],
                'options' => $s['options'] ?? null, 'action_label' => $s['action_label'] ?? null,
                'system' => $s['system'],
            ], $steps),
            'total_langkah'    => 7,
            'form_data'        => $submission->form_data,
            'is_completed'     => $submission->status === 'evaluation',
            'result'           => $submission->status === 'evaluation' ? [
                'final_score'   => $submission->final_score,
                'score'         => $submission->final_score,
                'bpe_number'    => $submission->bpe_number,
                'status_akhir'  => $ringkasan['status_akhir'],
                'nama_wp'       => $ringkasan['nama_wp'],
                'npwp_simulasi' => $this->wizard->detectedData($sptAssignment, $ringkasan)['npwp_simulasi'],
                'tahun_pajak'   => $ringkasan['tahun_pajak'],
                'xp_awarded'    => $submission->form_data['xp_awarded'] ?? 0,
                'is_late'       => $submission->form_data['is_late'] ?? false,
            ] : null,
        ]);
    }

    /**
     * Endpoint JSON dipanggil dari chat setiap siswa menjawab satu step.
     * Sengaja tidak lewat Inertia supaya chat bisa update tanpa reload halaman.
     */
    public function answer(Request $request, SptAssignment $sptAssignment): JsonResponse
    {
        $request->validate([
            'step_id' => ['required', 'string'],
            'value'   => ['nullable'],
        ]);

        $submission = SptSubmission::where('spt_assignment_id', $sptAssignment->id)
            ->where('student_id', Auth::id())
            ->firstOrFail();

        abort_if($submission->status === 'evaluation', 422, 'Simulasi ini sudah selesai.');

        $ringkasan = $sptAssignment->ringkasan;
        $steps = $this->wizard->steps($ringkasan);
        $step = collect($steps)->firstWhere('id', $request->input('step_id'));
        abort_unless($step, 404, 'Langkah tidak ditemukan.');

        $formData = $submission->form_data ?? $this->emptyFormData();

        // Step verifikasi token: generate sekali, cocokkan input siswa.
        if ($step['type'] === 'verify_token') {
            if (empty($formData['verification_token'])) {
                $formData['verification_token'] = $this->wizard->buatTokenVerifikasi();
                $submission->update(['form_data' => $formData]);

                return response()->json([
                    'correct'      => null,
                    'token'        => $formData['verification_token'],
                    'awaiting_input' => true,
                ]);
            }

            $correct = trim((string) $request->input('value')) === $formData['verification_token'];
        } elseif ($step['type'] === 'info' || $step['type'] === 'submit') {
            $correct = true;
        } else {
            $correct = $this->wizard->evaluate($step, $request->input('value'));
        }

        if (! $correct) {
            $formData['wrong_attempts_total'] = ($formData['wrong_attempts_total'] ?? 0) + 1;
        }

        $isGraded = in_array($step['type'], ['confirm', 'choice', 'number', 'verify_token'], true);
        $attemptsForStep = ($formData['answers'][$step['id']]['attempts'] ?? 0) + 1;

        $formData['answers'][$step['id']] = [
            'value'    => $request->input('value'),
            'correct'  => $correct,
            'attempts' => $attemptsForStep,
        ];
        $submission->update(['form_data' => $formData]);

        $response = [
            'correct' => $correct,
            'expected' => $correct ? null : $this->hintFor($step),
        ];

        if ($isGraded) {
            if ($correct) {
                $response['poin_message'] = $attemptsForStep === 1
                    ? 'Poin penuh untuk langkah ini! 🎯'
                    : 'Benar — tapi karena ada percobaan sebelumnya, poin langkah ini sudah berkurang.';
            } else {
                $response['poin_message'] = 'Jawaban belum tepat. Poin langkah ini berkurang 5 poin dari skor akhir. Coba lagi ya!';
            }
        }

        // Step terakhir ("kirim") -> finalisasi.
        if ($step['id'] === 'kirim' && $correct) {
            $result = $this->wizard->finalize($submission, $sptAssignment, $formData['wrong_attempts_total'] ?? 0);
            $response['done'] = true;
            $response['result'] = array_merge($result, [
                'status_akhir' => $ringkasan['status_akhir'],
                'nama_wp'      => $ringkasan['nama_wp'],
                'npwp_simulasi'=> $this->wizard->detectedData($sptAssignment, $ringkasan)['npwp_simulasi'],
                'tahun_pajak'  => $ringkasan['tahun_pajak'],
            ]);
        } else {
            $response['done'] = false;
        }

        return response()->json($response);
    }

    /** Unduh sertifikat BPE dalam bentuk PDF. */
    public function downloadBpe(SptAssignment $sptAssignment)
    {
        $submission = SptSubmission::where('spt_assignment_id', $sptAssignment->id)
            ->where('student_id', Auth::id())
            ->where('status', 'evaluation')
            ->firstOrFail();

        $ringkasan = $sptAssignment->ringkasan;

        $pdf = Pdf::loadView('pdf.bpe', [
            'nama_wp'      => $ringkasan['nama_wp'],
            'npwp_simulasi'=> $this->wizard->detectedData($sptAssignment, $ringkasan)['npwp_simulasi'],
            'tahun_pajak'  => $ringkasan['tahun_pajak'],
            'jenis_spt'    => '1770 S/SS',
            'status_akhir' => $ringkasan['status_akhir'],
            'selisih'      => abs($ringkasan['selisih']),
            'bpe_number'   => $submission->bpe_number,
            'tanggal'      => $submission->updated_at->translatedFormat('d F Y, H:i'),
        ]);

        return $pdf->download("BPE-{$submission->bpe_number}.pdf");
    }

    private function hintFor(array $step): string
    {
        return match ($step['id']) {
            'a1', 'a2', 'a3', 'a4' => 'Sesuai data yang terdeteksi di kasus ini, jawaban yang tepat adalah "Tidak". Baca ulang bagian identitas & profil WP di soal.',
            'ptkp_status' => 'Cek lagi status pernikahan dan jumlah tanggungan Wajib Pajak di deskripsi soal, lalu cocokkan dengan kode PTKP yang sesuai.',
            'pkp' => 'Ingat rumusnya: Penghasilan Kena Pajak = Penghasilan Neto − PTKP (dibulatkan ke bawah ribuan penuh). Cek lagi angka penghasilan neto & PTKP kamu.',
            'pph_terutang' => 'Gunakan tarif progresif Pasal 17: 5% untuk PKP s.d. Rp60 juta, 15% untuk selanjutnya s.d. Rp250 juta, dst. Hitung per lapisan, lalu jumlahkan.',
            'status_akhir' => 'Bandingkan PPh Terutang dengan Kredit Pajak: kalau Kredit Pajak lebih besar → Lebih Bayar, kalau lebih kecil → Kurang Bayar, kalau sama → Nihil.',
            'verifikasi' => 'Kode yang kamu masukkan tidak cocok dengan kode verifikasi yang ditampilkan sistem. Coba salin ulang kodenya dengan teliti.',
            default => 'Coba periksa lagi datanya, lalu jawab sekali lagi.',
        };
    }

    private function emptyFormData(): array
    {
        return [
            'answers' => [],
            'wrong_attempts_total' => 0,
            'verification_token' => null,
        ];
    }
}
