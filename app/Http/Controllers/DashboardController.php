<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\VesselDashboardSummaryService;
use App\Support\ActiveVessel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, VesselDashboardSummaryService $summaryService): Response
    {
        $vessel = ActiveVessel::query($request)
            ->with([
                'compartments',
                'ballastTanks',
                'limits',
            ])
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