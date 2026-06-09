<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Models\Vessel;
use Inertia\Inertia;
use Inertia\Response;

class StabilityController extends Controller
{
    public function __invoke(StabilityAnalysisService $analysisService): Response
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

        return Inertia::render('Stability/Index', [
            'analysis' => $analysisService->build($vessel, $cargoPlan),
        ]);
    }
}