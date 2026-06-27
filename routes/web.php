<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\StudentController;

Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return redirect()->route('login');
    });

    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::post('register', [AuthenticatedSessionController::class, 'registerStore'])->name('register');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

Route::middleware(['auth'])->prefix('student')->name('student.')->group(function () {
    Route::get('/home', [StudentController::class, 'home'])->name('home');
    Route::get('/learn', [StudentController::class, 'learn'])->name('learn');
    Route::get('/tasks', [StudentController::class, 'tasks'])->name('tasks');
    Route::get('/leaderboard', [StudentController::class, 'leaderboard'])->name('leaderboard');

    Route::post('/task/submit', [StudentController::class, 'submitTask'])->name('task.submit');
});


Route::prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Teacher/Dashboard'))->name('dashboard');
    Route::get('/maker', fn() => Inertia::render('Teacher/Maker'))->name('maker');
    Route::get('/class', fn() => Inertia::render('Teacher/TeacherClass'))->name('class');
    Route::get('/analytics', fn() => Inertia::render('Teacher/Analytics'))->name('analytics');
});
