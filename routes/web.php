<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Student\LeaderboardController;
use App\Http\Controllers\Student\ModuleController;
use App\Http\Controllers\Student\SPTSimulationController;
use App\Http\Controllers\Student\TaskController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\Teacher\AnalyticController;
use App\Http\Controllers\Teacher\MakerController;
use App\Http\Controllers\Teacher\SPTMakerController;
use App\Http\Controllers\Teacher\TeacherClassController;
use App\Http\Controllers\TeacherController;

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

    Route::get('/spt-simulation', [SPTSimulationController::class, 'index'])->name('spt-simulation');
    Route::post('/spt-simulation/{sptAssignment}/start', [SPTSimulationController::class, 'start'])->name('spt-simulation.start');
    Route::get('/spt-simulation/{sptAssignment}/wizard', [SPTSimulationController::class, 'wizard'])->name('spt-simulation.wizard');
    Route::post('/spt-simulation/{sptAssignment}/answer', [SPTSimulationController::class, 'answer'])->name('spt-simulation.answer');
    Route::get('/spt-simulation/{sptAssignment}/bpe.pdf', [SPTSimulationController::class, 'downloadBpe'])->name('spt-simulation.bpe-pdf');

    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks');
    Route::post('/tasks/{taskId}/submit', [TaskController::class, 'submitAnswer'])->name('tasks.submit');
    Route::post('/tasks/chat/{submissionId}', [TaskController::class, 'storeChatFeedback'])->name('tasks.chat');
    Route::post('/task/submit', [StudentController::class, 'submitTask'])->name('task.submit');

    Route::get('/modules', [ModuleController::class, 'index'])->name('modules');
    Route::get('/modules/{id}', [ModuleController::class, 'show'])->name('modules.show');
    Route::post('/modules/{id}/complete', [ModuleController::class, 'complete'])->name('modules.complete');

    Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');

});


Route::prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', [TeacherController::class, 'dashboard'])->name('dashboard');

    Route::get('/spt-maker', [SPTMakerController::class, 'index'])->name('spt-maker.index');
    Route::get('/spt-maker/create', [SPTMakerController::class, 'create'])->name('spt-maker.create');
    Route::post('/spt-maker', [SPTMakerController::class, 'store'])->name('spt-maker.store');
    Route::post('/spt-maker/preview', [SPTMakerController::class, 'preview'])->name('spt-maker.preview');
    Route::patch('/spt-maker/{sptAssignment}/toggle-release', [SPTMakerController::class, 'toggleRelease'])->name('spt-maker.toggle-release');
    Route::delete('/spt-maker/{sptAssignment}', [SPTMakerController::class, 'destroy'])->name('spt-maker.destroy');

    Route::get('/maker', [MakerController::class, 'index'])->name('maker');
    Route::post('/maker/generate-ai', [MakerController::class, 'generateAiCase'])->name('maker.generateAi');
    Route::post('/maker/store-manual', [MakerController::class, 'storeManualCase'])->name('maker.storeManual');
    Route::post('/maker/{task}/toggle-release', [MakerController::class, 'toggleRelease'])->name('maker.toggleRelease');

    Route::get('/class', [TeacherClassController::class, 'index'])
        ->name('class');
    Route::get('/class/student/{studentId}', [TeacherClassController::class, 'showStudentDetail'])
        ->name('class.student');
    Route::post('/class/message/{submissionId}', [TeacherClassController::class, 'storeTeacherMessage'])
        ->name('class.message');

    Route::get('/analytics', [AnalyticController::class, 'index'])
        ->name('analytics');
    Route::post('/analytics/refresh-diagnostic', [AnalyticController::class, 'refreshDiagnostic'])
        ->name('analytics.refreshDiagnostic');
});
