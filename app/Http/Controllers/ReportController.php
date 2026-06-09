<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Models\CargoPlan;
use App\Models\Vessel;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ReportController extends Controller
{
    public function index(StabilityAnalysisService $analysisService): Response
    {
        [$vessel, $cargoPlan, $data] = $this->buildReportData($analysisService);

        return Inertia::render('Reports/Index', [
            'report' => [
                'title' => 'Stabilitātes un kravas plāna pārskats',
                'vessel_name' => $vessel->name,
                'cargo_plan_name' => $cargoPlan?->name ?? 'Nav aktīva kravas plāna',
                'generated_at' => now()->format('d.m.Y H:i'),
                'download_url' => route('reports.stability-summary.pdf'),
                'metrics' => $data['analysis']['metrics'],
                'criteria' => $data['analysis']['criteria'],
                'cargo_rows' => $data['cargo_rows'],
                'ballast_rows' => $data['ballast_rows'],
            ],
        ]);
    }

    public function downloadStabilitySummary(StabilityAnalysisService $analysisService): SymfonyResponse
    {
        [$vessel, $cargoPlan, $data] = $this->buildReportData($analysisService);

        $pdf = Pdf::loadView('reports.stability-summary', [
            'vessel' => $vessel,
            'cargoPlan' => $cargoPlan,
            'analysis' => $data['analysis'],
            'cargoRows' => $data['cargo_rows'],
            'ballastRows' => $data['ballast_rows'],
            'generatedAt' => now()->format('d.m.Y H:i'),
        ])->setPaper('a4');

        $fileName = 'ship-stability-report-' . now()->format('Y-m-d-H-i') . '.pdf';

        return $pdf->download($fileName);
    }

    private function buildReportData(StabilityAnalysisService $analysisService): array
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

        $analysis = $analysisService->build($vessel, $cargoPlan);

        $cargoRows = $this->buildCargoRows($vessel, $cargoPlan);
        $ballastRows = $this->buildBallastRows($vessel);

        return [
            $vessel,
            $cargoPlan,
            [
                'analysis' => $analysis,
                'cargo_rows' => $cargoRows,
                'ballast_rows' => $ballastRows,
            ],
        ];
    }

    private function buildCargoRows(Vessel $vessel, ?CargoPlan $cargoPlan): array
    {
        $items = $cargoPlan?->items ?? collect();

        return $vessel->compartments->map(function ($compartment) use ($items) {
            $item = $items->firstWhere('vessel_compartment_id', $compartment->id);

            $weight = (float) ($item?->weight_tonnes ?? 0);
            $capacity = max((float) $compartment->capacity_tonnes, 1);
            $loadPercent = ($weight / $capacity) * 100;

            return [
                'hold' => $compartment->code,
                'name' => $compartment->name,
                'cargo_name' => $item?->cargo_name ?? 'Nav kravas',
                'cargo_type' => $item?->cargoType?->name ?? '-',
                'weight_tonnes' => round($weight, 2),
                'volume_m3' => round((float) ($item?->volume_m3 ?? 0), 2),
                'capacity_tonnes' => round($capacity, 2),
                'load_percent' => round($loadPercent, 1),
                'loading_port' => $item?->loading_port ?? '-',
                'discharge_port' => $item?->discharge_port ?? '-',
            ];
        })->values()->toArray();
    }

    private function buildBallastRows(Vessel $vessel): array
    {
        return $vessel->ballastTanks->map(function ($tank) {
            $capacity = max((float) $tank->capacity_tonnes, 1);
            $current = (float) $tank->current_tonnes;
            $fillPercent = ($current / $capacity) * 100;

            return [
                'code' => $tank->code,
                'name' => $tank->name,
                'side' => $tank->side,
                'current_tonnes' => round($current, 2),
                'capacity_tonnes' => round($capacity, 2),
                'fill_percent' => round($fillPercent, 1),
                'free_surface_risk' => $fillPercent > 5 && $fillPercent < 95,
            ];
        })->values()->toArray();
    }
}