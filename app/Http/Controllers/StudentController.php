<?php

namespace App\Http\Controllers;

use App\Models\Teacher\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{

    public function submitTask(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'submitted_answer' => 'required|string',
        ]);

        $user = Auth::user();
        $task = Task::findOrFail($request->task_id);
        $cleanUserAnswer = preg_replace('/[^0-9]/', '', $request->submitted_answer);
        $cleanCorrectAnswer = preg_replace('/[^0-9]/', '', $task->correct_answer);

        $isCorrect = $cleanUserAnswer === $cleanCorrectAnswer;
        $xpChange = 0;

        if ($isCorrect) {
            $xpChange = $task->xp_reward;
            \App\Models\User::where('id', $user->id)->increment('total_exp', $xpChange);
        } else {
            $xpReduction = (int) round($task->xp_reward * 0.20);
            $xpChange = -$xpReduction;

            $newXp = max(0, $user->total_exp - $xpReduction);
            \App\Models\User::where('id', $user->id)->update(['total_exp' => $newXp]);
        }

        return back()->with([
            'flash' => [
                'isCorrect' => $isCorrect,
                'xpChange' => $xpChange,
                'correctAnswer' => $task->correct_answer
            ]
        ]);
    }

    public function home()
    {
        $user = Auth::user();
        $classroom = $user->studentClass;

        $latestTask = null;
        if ($classroom) {
            $latestTask = Task::where('class_id', $classroom->id)
                ->where('is_released', 1)
                ->latest()
                ->first();
        }

        return Inertia::render('Student/Home', [
            'latestTask' => $latestTask ? [
                'id' => $latestTask->id,
                'title' => $latestTask->title,
                'description' => $latestTask->description,
                'difficulty' => $latestTask->difficulty,
                'tax_topic' => $latestTask->tax_topic,
                'correct_answer' => $latestTask->correct_answer,
                'xp_reward' => $latestTask->xp_reward,
            ] : null
        ]);
    }

    public function tasks()
    {
        return Inertia::render('Student/Tasks');
    }
}
