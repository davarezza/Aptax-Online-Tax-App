<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LeaderboardController extends Controller
{
    public function index()
    {
        $currentUser = Auth::user();

        $students = User::with('studentClass')
            ->where('role', 'siswa')
            ->orderBy('total_exp', 'desc')
            ->get();

        $rankCounter = 1;
        $leaderboardGlobal = $students->map(function ($student) use (&$rankCounter, $currentUser) {
            $classroom = $student->studentClass;
            $className = $classroom ? $classroom->class_name : 'Tanpa Kelas';

            $words = explode(' ', $student->name);
            $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));

            return [
                'id' => $student->id,
                'name' => $student->name . ($student->id === $currentUser->id ? ' (Anda)' : ''),
                'rank' => $rankCounter++,
                'xp' => $student->total_exp,
                'level' => $student->level_stats['current_level'],
                'initials' => $initials ?: 'S',
                'titleLevel' => "Siswa Kelas " . $className,
                'isSelf' => $student->id === $currentUser->id,
                'badgeColor' => $student->id === $currentUser->id ? 'bg-[#00C48C]' : 'bg-[#3B82F6]',
                'textColor' => $student->id === $currentUser->id ? 'text-[#1A6B3C]' : 'text-slate-700'
            ];
        });

        $currentStudentData = $leaderboardGlobal->firstWhere('isSelf', true);

        return Inertia::render('Student/Leaderboard', [
            'currentUserStats' => $currentStudentData,
            'leaderboardData' => [
                'global' => $leaderboardGlobal,
                'weekly' => $leaderboardGlobal
            ]
        ]);
    }
}
