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

    public function index(): Response
    {
        $teacherId = Auth::id();

        $classes = ClassModel::where('teacher_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Teacher/SptMaker', [
            'classes' => $classes,
        ]);
    }

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
        $teacherId = Auth::id();
        $validated = $request->validated();
        $caseJson = $this->caseGenerator->generate($validated);

        SptAssignment::create([
            'teacher_id'   => $teacherId,
            'class_id'     => $validated['class_id'],
            'title'        => $validated['title'],
            'description'  => "Simulasi SPT Tahunan Orang Pribadi (1770 S/SS) atas nama {$validated['nama_wp']}, tahun pajak {$validated['tahun_pajak']}.",
            'case_json'    => $caseJson,
            'xp_reward'    => $validated['xp_reward'],
            'deadline'     => $validated['deadline'],
            'is_released'  => $validated['is_released'] ?? false,
        ]);

        return redirect()
            ->route('teacher.spt-maker.index')
            ->with('success', 'Soal SPT berhasil dibuat.');
    }
}
