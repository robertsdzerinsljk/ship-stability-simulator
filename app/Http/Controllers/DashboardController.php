<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\VesselDashboardSummaryService;
use App\Support\ActiveAssignmentSolution;
use App\Support\ActiveVessel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, VesselDashboardSummaryService $summaryService): Response
    {
        $solution = ActiveAssignmentSolution::current($request);

        if ($solution) {
            $vessel = $solution->vessel;
            $cargoPlan = $solution->cargoPlan;
            $ballastTanks = $solution->ballastTanks;

            $workspace = [
                'mode' => 'student_solution',
                'assignment_id' => $solution->assignment_id,
                'solution_id' => $solution->id,
                'status' => $solution->status,
                'scenario_title' => $solution->assignment?->scenario?->title,
            ];
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
            $workspace = null;
        }

        return Inertia::render('Dashboard', [
            'summary' => $summaryService->build($vessel, $cargoPlan, $ballastTanks),
            'workspace' => $workspace,
        ]);
    }
}