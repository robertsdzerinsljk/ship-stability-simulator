<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\VesselDashboardSummaryService;
use App\Models\Vessel;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(VesselDashboardSummaryService $summaryService): Response
    {
        $vessel = Vessel::query()
            ->with([
                'compartments',
                'ballastTanks',
                'limits',
            ])
            ->where('status', 'active')
            ->firstOrFail();

        $cargoPlan = $vessel
            ->cargoPlans()
            ->with([
                'items.cargoType',
                'items.compartment',
            ])
            ->where('status', 'active')
            ->latest()
            ->first();

        return Inertia::render('Dashboard', [
            'summary' => $summaryService->build($vessel, $cargoPlan),
        ]);
    }
}