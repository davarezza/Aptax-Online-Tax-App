<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        return redirect()->intended(
            $user->role === 'guru'
                ? route('teacher.dashboard', absolute: false)
                : route('student.home', absolute: false)
        );
    }

    /**
     * Handle registration from the unified login/register page.
     */
    public function registerStore(Request $request): RedirectResponse
    {
        $role = $request->input('role', 'siswa');

        // Validasi dasar untuk semua pendaftar
        $rules = [
            'role'     => ['required', 'in:siswa,guru'],
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];

        // Aturan validasi kondisional berdasarkan Role
        if ($role === 'siswa') {
            $rules['class_code'] = ['required', 'string'];
        } else {
            $rules['access_token'] = ['required', 'string'];
        }

        $validated = $request->validate($rules);

        // Eksekusi Transaksi Database agar aman jika terjadi kegagalan di salah satu tabel
        return DB::transaction(function () use ($validated, $role, $request) {

            if ($role === 'siswa') {
                $class = DB::table('classes')->where('class_code', $validated['class_code'])->first();

                if (!$class) {
                    return back()->withErrors([
                        'class_code' => 'Kode kelas unik tidak ditemukan. Pastikan kode dari guru benar.',
                    ])->withInput();
                }

                // 2. Buat akun Siswa baru
                $user = User::create([
                    'name'      => $validated['name'],
                    'email'     => $validated['email'],
                    'password'  => Hash::make($validated['password']),
                    'role'      => 'siswa',
                    'total_exp' => 0,
                ]);

                // 3. Daftarkan siswa ke tabel jembatan class_students
                DB::table('class_students')->insert([
                    'class_id'   => $class->id,
                    'student_id' => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            } else {
                // 1. Cek validitas token admin guru yang belum terpakai (is_used = 0)
                $token = DB::table('admin_access_tokens')
                    ->where('token_code', $validated['access_token'])
                    ->where('is_used', 0)
                    ->first();

                if (!$token) {
                    return back()->withErrors([
                        'access_token' => 'Kode akses token tidak valid atau sudah pernah digunakan.',
                    ])->withInput();
                }

                // 2. Buat akun Guru baru
                $user = User::create([
                    'name'      => $validated['name'],
                    'email'     => $validated['email'],
                    'password'  => Hash::make($validated['password']),
                    'role'      => 'guru',
                    'total_exp' => 0,
                ]);

                // 3. Tautkan ID Guru baru ke kelas yang dirujuk oleh token admin tersebut
                if (!empty($token->class_id)) {
                    DB::table('classes')
                        ->where('id', $token->class_id)
                        ->update([
                            'teacher_id' => $user->id,
                            'updated_at' => now()
                        ]);
                }

                // 4. Perbarui status token admin agar tidak bisa dipakai lagi
                DB::table('admin_access_tokens')
                    ->where('id', $token->id)
                    ->update([
                        'is_used'    => 1,
                        'updated_at' => now()
                    ]);
            }

            // Login otomatis dan arahkan ke dashboard/home masing-masing
            Auth::login($user);
            $request->session()->regenerate();

            return redirect()->intended(
                $user->role === 'guru'
                    ? route('teacher.dashboard', absolute: false)
                    : route('student.home', absolute: false)
            );
        });
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
