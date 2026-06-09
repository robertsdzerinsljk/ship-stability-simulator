<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Support\ActiveAssignmentSolution;
use App\Support\ActiveVessel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ReportController extends Controller
{
    public function index(Request $request, StabilityAnalysisService $analysisService): Response
    {
        return Inertia::render('Reports/Index', [
            'reportData' => $this->buildReportData($request, $analysisService),
        ]);
    }

    public function downloadStabilitySummary(
        Request $request,
        StabilityAnalysisService $analysisService,
    ): SymfonyResponse {
        $reportData = $this->buildReportData($request, $analysisService);

        $pdf = Pdf::loadView('reports.stability-summary', [
            'reportData' => $reportData,
        ])->setPaper('a4');

        $vesselName = str($reportData['vessel']['name'] ?? 'vessel')
            ->lower()
            ->replace([' ', '/', '\\'], '-')
            ->toString();

        $prefix = $reportData['workspace']
            ? 'student-solution'
            : 'stability-summary';

        return $pdf->download($prefix . '-' . $vesselName . '.pdf');
    }

    private function buildReportData(Request $request, StabilityAnalysisService $analysisService): array
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
                'student_name' => $solution->student?->name,
                'student_email' => $solution->student?->email,
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

            $ballastTanks = $vessel->ballastTanks;
            $workspace = null;
        }

        $analysis = $analysisService->build($vessel, $cargoPlan, $ballastTanks);

        $cargoItems = ($cargoPlan?->items ?? collect())
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'compartment' => $item->compartment?->name ?? '-',
                    'compartment_code' => $item->compartment?->code ?? '-',
                    'cargo_type' => $item->cargoType?->name ?? '-',
                    'cargo_name' => $item->cargo_name,
                    'weight_tonnes' => round((float) $item->weight_tonnes, 2),
                    'volume_m3' => round((float) $item->volume_m3, 2),
                    'loading_port' => $item->loading_port,
                    'discharge_port' => $item->discharge_port,
                    'status' => $item->status,
                ];
            })
            ->values()
            ->toArray();

        $ballastRows = collect($ballastTanks)
            ->map(function ($tank) {
                $capacity = max((float) $tank->capacity_tonnes, 1);
                $current = (float) $tank->current_tonnes;
                $fillPercent = ($current / $capacity) * 100;

                return [
                    'id' => $tank->id,
                    'code' => $tank->code,
                    'name' => $tank->name,
                    'side' => $tank->side,
                    'capacity_tonnes' => round($capacity, 2),
                    'current_tonnes' => round($current, 2),
                    'fill_percent' => round($fillPercent, 1),
                    'free_surface_risk' => $fillPercent > 5 && $fillPercent < 95,
                ];
            })
            ->values()
            ->toArray();

        return [
            'generated_at' => now()->format('d.m.Y H:i'),
            'workspace' => $workspace,
            'vessel' => $analysis['vessel'],
            'condition' => $analysis['condition'],
            'metrics' => $analysis['metrics'],
            'criteria' => $analysis['criteria'],
            'hold_loads' => $analysis['hold_loads'],
            'charts' => $analysis['charts'],
            'cargo_items' => $cargoItems,
            'ballast_tanks' => $ballastRows,
        ];
    }
}