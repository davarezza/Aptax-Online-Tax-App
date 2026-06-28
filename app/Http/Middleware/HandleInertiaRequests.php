<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        $userData = null;

        if ($user) {
            $classroom = $user->studentClass;
            $stats = $user->level_stats;

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'class_name' => $classroom ? $classroom->class_name : 'Belum Masuk Kelas',
                'level' => $stats['current_level'] ?? 1,
                'total_xp' => $stats['total_xp'] ?? 0,
                'xp_progress' => $stats['xp_progress'] ?? 0,
                'xp_for_next' => $stats['xp_for_next'] ?? 50,
            ];
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $userData,
            ],

            'flash' => [
                'value' => fn () => $request->session()->get('flash'),
            ],
        ]);
    }
}
