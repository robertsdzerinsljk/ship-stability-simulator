<?php

namespace App\Http\Controllers;

use App\Models\CargoPlanItem;
use App\Support\ActiveAssignmentSolution;
use App\Support\ActiveVessel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CargoPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $solution = ActiveAssignmentSolution::current($request);

        if ($solution) {
            $vessel = $solution->vessel;
            $cargoPlan = $solution->cargoPlan;
        } else {
            $vessel = ActiveVessel::query($request)
                ->with([
                    'compartments',
                    'cargoPlans' => function ($query) {
                        $query->where('status', 'active')->latest();
                    },
                    'cargoPlans.items.cargoType',
                    'cargoPlans.items.compartment',
                ])
                ->firstOrFail();

            $cargoPlan = $vessel->cargoPlans->first();
        }

        $items = $cargoPlan?->items ?? collect();

        $rows = $vessel->compartments->map(function ($compartment) use ($items) {
            $item = $items->firstWhere('vessel_compartment_id', $compartment->id);

            $weight = (float) ($item?->weight_tonnes ?? 0);
            $capacity = max((float) $compartment->capacity_tonnes, 1);
            $loadPercent = ($weight / $capacity) * 100;

            return [
                'id' => $item?->id,
                'compartment_id' => $compartment->id,
                'compartment_name' => $compartment->name,
                'compartment_code' => $compartment->code,
                'cargo_type_name' => $item?->cargoType?->name ?? '-',
                'cargo_name' => $item?->cargo_name ?? '',
                'weight_tonnes' => round($weight, 2),
                'volume_m3' => round((float) ($item?->volume_m3 ?? 0), 2),
                'capacity_tonnes' => round($capacity, 2),
                'load_percent' => round($loadPercent, 1),
                'loading_port' => $item?->loading_port ?? '',
                'discharge_port' => $item?->discharge_port ?? '',
                'priority' => $item?->priority ?? 1,
                'status' => $item?->status ?? 'planned',
                'lcg' => round((float) $compartment->lcg, 2),
                'vcg' => round((float) $compartment->vcg, 2),
                'tcg' => round((float) $compartment->tcg, 2),
            ];
        })->values();

        $totalCargo = (float) $rows->sum('weight_tonnes');
        $totalCapacity = max((float) $rows->sum('capacity_tonnes'), 1);
        $warningsCount = $rows->filter(fn (array $row) => $row['load_percent'] >= 90)->count();

        return Inertia::render('CargoPlan/Index', [
            'cargoPlan' => [
                'id' => $cargoPlan?->id,
                'name' => $cargoPlan?->name ?? 'Nav kravas plāna',
                'mode' => $cargoPlan?->mode ?? 'training',
                'status' => $cargoPlan?->status ?? 'active',
            ],
            'vessel' => [
                'id' => $vessel->id,
                'name' => $vessel->name,
                'type' => $vessel->type,
                'imo_number' => $vessel->imo_number,
            ],
            'summary' => [
                'total_cargo' => round($totalCargo, 2),
                'total_capacity' => round($totalCapacity, 2),
                'load_percent' => round(($totalCargo / $totalCapacity) * 100, 1),
                'holds_count' => $rows->count(),
                'warnings_count' => $warningsCount,
            ],
            'items' => $rows->toArray(),
            'workspace' => $solution ? [
                'assignment_id' => $solution->assignment_id,
                'solution_id' => $solution->id,
                'mode' => 'student_solution',
            ] : null,
        ]);
    }

    public function updateItem(Request $request, CargoPlanItem $cargoPlanItem): RedirectResponse
    {
        $solution = ActiveAssignmentSolution::current($request);

        if ($solution) {
            abort_unless($cargoPlanItem->cargo_plan_id === $solution->solution_cargo_plan_id, 403);
        }

        $validated = $request->validate([
            'cargo_name' => ['required', 'string', 'max:255'],
            'weight_tonnes' => ['required', 'numeric', 'min:0'],
            'loading_port' => ['nullable', 'string', 'max:255'],
            'discharge_port' => ['nullable', 'string', 'max:255'],
        ]);

        $cargoPlanItem->load('cargoType');

        $density = max((float) ($cargoPlanItem->cargoType?->density ?? 1), 0.1);
        $weight = (float) $validated['weight_tonnes'];

        $cargoPlanItem->update([
            'cargo_name' => $validated['cargo_name'],
            'weight_tonnes' => $weight,
            'volume_m3' => round($weight / $density, 2),
            'loading_port' => $validated['loading_port'] ?? null,
            'discharge_port' => $validated['discharge_port'] ?? null,
        ]);

        return back()->with('success', 'Kravas rinda atjaunināta.');
    }
}