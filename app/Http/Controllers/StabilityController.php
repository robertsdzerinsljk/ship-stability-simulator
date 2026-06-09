<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Support\ActiveVessel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StabilityController extends Controller
{
    public function __invoke(Request $request, StabilityAnalysisService $analysisService): Response
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

        return Inertia::render('Stability/Index', [
            'analysis' => $analysisService->build($vessel, $cargoPlan),
        ]);
    }
}