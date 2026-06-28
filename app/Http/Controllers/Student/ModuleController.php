<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        $modules = Module::orderBy('order_position', 'asc')->get();
        $completedModuleIds = $request->user()->completed_modules ?? [];

        return Inertia::render('Student/Modules', [
            'modules' => $modules,
            'completedModuleIds' => array_values(array_map('intval', (array) $completedModuleIds)),
        ]);
    }

    public function show(Request $request, int $id)
    {
        $modules = Module::orderBy('order_position', 'asc')->get();
        $module = Module::findOrFail($id);
        $completedModuleIds = array_values(array_map('intval', (array) ($request->user()->completed_modules ?? [])));

        $moduleIndex = $modules->search(fn($m) => $m->id === $id);
        $isLocked = false;
        if ($moduleIndex > 0) {
            $previousModule = $modules[$moduleIndex - 1];
            $isLocked = !in_array((int) $previousModule->id, $completedModuleIds);
        }

        if ($isLocked) {
            return redirect()->route('student.modules');
        }

        $isCompleted = in_array($id, $completedModuleIds);
        $nextModule = $modules->firstWhere('order_position', '>', $module->order_position);

        return Inertia::render('Student/ModuleDetail', [
            'module' => $module,
            'isCompleted' => $isCompleted,
            'completedModuleIds' => $completedModuleIds,
            'nextModuleId' => $nextModule?->id,
        ]);
    }

    public function complete(Request $request, int $id)
    {
        $user = $request->user();
        $completed = (array) ($user->completed_modules ?? []);
        $moduleId = (int) $id;

        if (!in_array($moduleId, $completed)) {
            $completed[] = $moduleId;
        } else {
            $completed = array_values(array_diff($completed, [$moduleId]));
        }

        $user->update(['completed_modules' => array_values($completed)]);

        return redirect()->back();
    }
}
