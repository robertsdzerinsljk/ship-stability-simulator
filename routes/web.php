<?php

use App\Http\Controllers\BallastController;
use App\Http\Controllers\CargoPlanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScenarioController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StabilityController;
use App\Http\Controllers\StudentOnboardingController;
use App\Http\Controllers\StudentTaskController;
use App\Http\Controllers\TeacherAnalyticsController;
use App\Http\Controllers\TeacherAssignmentController;
use App\Http\Controllers\TeacherStudentController;
use App\Http\Controllers\TeacherSubmissionController;
use App\Http\Controllers\VesselController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/onboarding/student-group', [StudentOnboardingController::class, 'edit'])
        ->name('onboarding.student-group');
    Route::post('/onboarding/student-group', [StudentOnboardingController::class, 'update'])
        ->name('onboarding.student-group.update');
});

Route::middleware(['auth', 'verified', 'student.onboarded'])->group(function () {
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

        Route::get('/reports/stability-summary/csv', [ReportController::class, 'downloadStabilitySummaryCsv'])
            ->name('reports.stability-summary.csv');

        Route::get('/reports/stability-summary/xlsx', [ReportController::class, 'downloadStabilitySummaryXlsx'])
            ->name('reports.stability-summary.xlsx');
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
        Route::get('/teacher/students/{student}', [TeacherStudentController::class, 'show'])
            ->name('teacher.students.show');
    });

    Route::middleware(['role.any:admin'])->group(function () {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('/settings/users', [SettingsController::class, 'storeUser'])
            ->name('settings.users.store');
        Route::patch('/settings/users/{user}/roles', [SettingsController::class, 'updateUserRoles'])
            ->name('settings.users.roles.update');
        Route::patch('/settings/users/{user}/group', [SettingsController::class, 'updateUserGroup'])
            ->name('settings.users.group.update');
        Route::delete('/settings/users/{user}', [SettingsController::class, 'destroyUser'])
            ->name('settings.users.destroy');
        Route::post('/settings/student-groups', [SettingsController::class, 'storeStudentGroup'])
            ->name('settings.student-groups.store');
        Route::patch('/settings/vessel-limits/{vesselLimit}', [SettingsController::class, 'updateVesselLimit'])
            ->name('settings.vessel-limits.update');
        Route::patch('/settings/cargo-types/{cargoType}', [SettingsController::class, 'updateCargoType'])
            ->name('settings.cargo-types.update');
    });
});

Route::middleware(['auth', 'student.onboarded'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

    Route::post('/notifications/{id}/read', [NotificationController::class, 'read'])
        ->name('notifications.read');

    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])
        ->name('notifications.read-all');
});

require __DIR__.'/auth.php';
