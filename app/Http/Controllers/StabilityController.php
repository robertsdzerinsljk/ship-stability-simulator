<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Support\ActiveAssignmentSolution;
use App\Support\ActiveVessel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StabilityController extends Controller
{
    public function __invoke(Request $request, StabilityAnalysisService $analysisService): Response
    {
        $solution = ActiveAssignmentSolution::current($request);

        if ($solution) {
            $vessel = $solution->vessel;
            $cargoPlan = $solution->cargoPlan;
            $ballastTanks = $solution->ballastTanks;
        } else {
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

            $ballastTanks = null;
        }

        return Inertia::render('Stability/Index', [
            'analysis' => $analysisService->build($vessel, $cargoPlan, $ballastTanks),
            'workspace' => $solution ? [
                'assignment_id' => $solution->assignment_id,
                'solution_id' => $solution->id,
                'mode' => 'student_solution',
            ] : null,
        ]);
    }
}