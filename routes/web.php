<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth
Route::get('/', function () {
    return Inertia::render('Auth/Login');
})->name('login');

// Student routes
Route::prefix('student')->name('student.')->group(function () {
    Route::get('/home', fn() => Inertia::render('Student/Home'))->name('home');
    Route::get('/learn', fn() => Inertia::render('Student/Learn'))->name('learn');
    Route::get('/tasks', fn() => Inertia::render('Student/Tasks'))->name('tasks');
    Route::get('/leaderboard', fn() => Inertia::render('Student/Leaderboard'))->name('leaderboard');
});

// Teacher routes
Route::prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Teacher/Dashboard'))->name('dashboard');
    Route::get('/maker', fn() => Inertia::render('Teacher/Maker'))->name('maker');
    Route::get('/class', fn() => Inertia::render('Teacher/TeacherClass'))->name('class');
    Route::get('/analytics', fn() => Inertia::render('Teacher/Analytics'))->name('analytics');
});
