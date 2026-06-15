<?php

use App\Http\Controllers\BallastController;
use App\Http\Controllers\CargoPlanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScenarioController;
use App\Http\Controllers\StabilityController;
use App\Http\Controllers\StudentTaskController;
use App\Http\Controllers\TeacherAnalyticsController;
use App\Http\Controllers\TeacherSubmissionController;
use App\Http\Controllers\TeacherAssignmentController;
use App\Http\Controllers\VesselController;
use App\Http\Controllers\TeacherStudentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;

use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware(['role.any:student,teacher,admin'])->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('dashboard');

        Route::get('/cargo-plan', [CargoPlanController::class, 'index'])
            ->name('cargo-plan.index');

        Route::patch('/cargo-plan/items/{cargoPlanItem}', [CargoPlanController::class, 'updateItem'])
            ->name('cargo-plan.items.update');

        Route::get('/ballast', [BallastController::class, 'index'])
            ->name('ballast.index');

    Route::patch('/ballast/tanks/{tankId}', [BallastController::class, 'updateTank'])
        ->name('ballast.tanks.update');

        Route::get('/stability', StabilityController::class)
            ->name('stability.index');

        Route::get('/reports', [ReportController::class, 'index'])
            ->name('reports.index');

        Route::get('/reports/stability-summary/pdf', [ReportController::class, 'downloadStabilitySummary'])
            ->name('reports.stability-summary.pdf');
    });

    Route::middleware(['role.any:student,admin'])->group(function () {
        Route::get('/student/tasks', [StudentTaskController::class, 'index'])
            ->name('student.tasks.index');

        Route::get('/student/tasks/{assignment}', [StudentTaskController::class, 'show'])
            ->name('student.tasks.show');

        Route::post('/student/tasks/{assignment}/start', [StudentTaskController::class, 'start'])
            ->name('student.tasks.start');

        Route::post('/student/tasks/{assignment}/submit', [StudentTaskController::class, 'submit'])
            ->name('student.tasks.submit');
    });

    Route::middleware(['role.any:teacher,admin'])->group(function () {
        Route::get('/vessels', [VesselController::class, 'index'])
            ->name('vessels.index');

        Route::post('/vessels/{vessel}/select', [VesselController::class, 'select'])
            ->name('vessels.select');

        Route::get('/scenarios', [ScenarioController::class, 'index'])
            ->name('scenarios.index');

        Route::post('/scenarios', [ScenarioController::class, 'store'])
            ->name('scenarios.store');

        Route::patch('/scenarios/{scenario}/status', [ScenarioController::class, 'updateStatus'])
            ->name('scenarios.status.update');

        Route::get('/teacher/submissions', [TeacherSubmissionController::class, 'index'])
            ->name('teacher.submissions.index');

        Route::get('/teacher/submissions/{submission}', [TeacherSubmissionController::class, 'show'])
            ->name('teacher.submissions.show');

        Route::patch('/teacher/submissions/{submission}/grade', [TeacherSubmissionController::class, 'grade'])
            ->name('teacher.submissions.grade');

        Route::get('/teacher/analytics', [TeacherAnalyticsController::class, 'index'])
            ->name('teacher.analytics.index');

        Route::get('/teacher/assignments', [TeacherAssignmentController::class, 'index'])->name('teacher.assignments.index');
        Route::post('/teacher/assignments', [TeacherAssignmentController::class, 'store'])->name('teacher.assignments.store');

        Route::get('/teacher/students', [TeacherStudentController::class, 'index'])->name('teacher.students.index');
    });

    Route::middleware(['role.any:admin'])->group(function () {
        Route::get('/settings', function () {
            return Inertia::render('Settings/Index');
        })->name('settings.index');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

require __DIR__.'/auth.php';