<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CargoPlanController;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/scenarios', function () {
        return Inertia::render('Scenarios/Index');
    })->name('scenarios.index');

    Route::get('/vessels', function () {
        return Inertia::render('Vessels/Index');
    })->name('vessels.index');

    Route::get('/cargo-plan', [CargoPlanController::class, 'index'])->name('cargo-plan.index');

    Route::get('/ballast', function () {
        return Inertia::render('Ballast/Index');
    })->name('ballast.index');

    Route::get('/stability', function () {
        return Inertia::render('Stability/Index');
    })->name('stability.index');

    Route::get('/reports', function () {
        return Inertia::render('Reports/Index');
    })->name('reports.index');

    Route::get('/settings', function () {
        return Inertia::render('Settings/Index');
    })->name('settings.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';