<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreSptAssignmentRequest;
use App\Models\Teacher\ClassModel;
use App\Models\Teacher\SptAssignment;
use App\Services\SptCaseGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SPTMakerController extends Controller
{
    public function __construct(private readonly SptCaseGeneratorService $caseGenerator)
    {
    }

    /**
     * Bank Soal SPT — daftar semua soal yang pernah dibuat guru ini.
     * Aksi yang tersedia dari sini: lihat detail (modal), toggle rilis,
     * hapus. TIDAK ada edit — soal yang sudah dibuat bersifat final supaya
     * case_json yang sudah dipakai/dikerjakan siswa tidak berubah-ubah.
     */
    public function index(): Response
    {
        $assignments = SptAssignment::query()
            ->where('teacher_id', Auth::id())
            ->withCount('submissions')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (SptAssignment $a) {
                return [
                    'id'                => $a->id,
                    'title'             => $a->title,
                    'description'       => $a->description,
                    'xp_reward'         => $a->xp_reward,
                    'deadline'          => optional($a->deadline)->toIso8601String(),
                    'deadline_label'    => optional($a->deadline)->translatedFormat('d F Y, H:i') . ' WIB',
                    'is_released'       => $a->is_released,
                    'created_at_human'  => $a->created_at->diffForHumans(),
                    'submissions_count' => $a->submissions_count,
                    'ringkasan'         => $a->ringkasan,
                ];
            });

        return Inertia::render('Teacher/SptBank', [
            'kelasAktif'  => $this->kelasAktif(),
            'assignments' => $assignments,
        ]);
    }

    /** Halaman wizard pembuatan soal baru (step-by-step). */
    public function create(): Response
    {
        return Inertia::render('Teacher/SptMakerWizard', [
            'kelasAktif' => $this->kelasAktif(),
        ]);
    }

    /**
     * Dipanggil dari frontend wizard setiap input berubah untuk mengisi Live
     * Preview Card. Opsional — frontend saat ini juga menghitung sendiri di
     * client untuk kecepatan, tapi endpoint ini tetap jadi sumber kebenaran
     * cadangan.
     */
    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'penghasilan_neto' => ['required', 'numeric', 'min:0'],
            'status_ptkp'      => ['required', 'string', 'in:TK/0,TK/1,TK/2,TK/3,K/0,K/1,K/2,K/3'],
            'kredit_pajak'     => ['nullable', 'numeric', 'min:0'],
        ]);

        return response()->json(
            $this->caseGenerator->preview($validated)
        );
    }

    public function store(StoreSptAssignmentRequest $request): RedirectResponse
    {
        // Kelas TIDAK diambil dari input form. Guru hanya bisa membuat soal
        // untuk kelas yang benar-benar ia ampu (relasi teacher_id di DB).
        $kelas = ClassModel::where('teacher_id', Auth::id())->first();
        abort_unless($kelas, 403, 'Anda belum memiliki kelas yang diampu.');

        $validated   = $request->validated();
        $caseJson    = $this->caseGenerator->generate($validated);
        $deskripsi   = $this->caseGenerator->deskripsiSoal($validated);

        SptAssignment::create([
            'teacher_id'  => Auth::id(),
            'class_id'    => $kelas->id,
            'title'       => $validated['title'],
            'description' => $deskripsi,
            'case_json'   => $caseJson,
            'xp_reward'   => $validated['xp_reward'],
            'deadline'    => $validated['deadline'],
            'is_released' => $validated['is_released'] ?? false,
        ]);

        return redirect()
            ->route('teacher.spt-maker.index')
            ->with('success', 'Soal SPT berhasil dibuat.');
    }

    /** Toggle rilis/sembunyikan soal ke siswa langsung dari Bank Soal. */
    public function toggleRelease(SptAssignment $sptAssignment): RedirectResponse
    {
        abort_unless($sptAssignment->teacher_id === Auth::id(), 403);

        $sptAssignment->update(['is_released' => ! $sptAssignment->is_released]);

        return back();
    }

    /**
     * Hapus soal. Ditolak kalau sudah ada siswa yang mengerjakan, supaya
     * tidak ada submission siswa yang jadi yatim (orphan).
     */
    public function destroy(SptAssignment $sptAssignment): RedirectResponse
    {
        abort_unless($sptAssignment->teacher_id === Auth::id(), 403);

        if ($sptAssignment->submissions()->exists()) {
            return back()->withErrors([
                'delete' => 'Soal ini tidak bisa dihapus karena sudah ada siswa yang mengerjakannya.',
            ]);
        }

        $sptAssignment->delete();

        return back()->with('success', 'Soal berhasil dihapus.');
    }

    private function kelasAktif(): ?array
    {
        $kelas = ClassModel::where('teacher_id', Auth::id())->first();

        return $kelas ? [
            'id'         => $kelas->id,
            'class_name' => $kelas->class_name,
            'class_code' => $kelas->class_code,
        ] : null;
    }
}
