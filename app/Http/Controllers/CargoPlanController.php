<?php

namespace App\Http\Controllers;

use App\Models\CargoPlanItem;
use App\Models\Vessel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Support\ActiveVessel;

class CargoPlanController extends Controller
{
    public function index(): Response
    {
        $vessel = ActiveVessel::query(request())
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

        $items = $vessel->compartments->map(function ($compartment) use ($cargoPlan) {
            $item = $cargoPlan?->items
                ->firstWhere('vessel_compartment_id', $compartment->id);

            $weight = (float) ($item?->weight_tonnes ?? 0);
            $capacity = max((float) $compartment->capacity_tonnes, 1);
            $loadPercent = ($weight / $capacity) * 100;

            return [
                'id' => $item?->id,
                'compartment_id' => $compartment->id,
                'hold_name' => $compartment->name,
                'hold_code' => $compartment->code,
                'cargo_name' => $item?->cargo_name ?? 'Nav kravas',
                'cargo_type' => $item?->cargoType?->name,
                'weight_tonnes' => round($weight, 2),
                'volume_m3' => round((float) ($item?->volume_m3 ?? 0), 2),
                'capacity_tonnes' => round($capacity, 2),
                'capacity_m3' => round((float) $compartment->capacity_m3, 2),
                'load_percent' => round($loadPercent, 1),
                'lcg' => round((float) $compartment->lcg, 2),
                'vcg' => round((float) $compartment->vcg, 2),
                'tcg' => round((float) $compartment->tcg, 2),
                'loading_port' => $item?->loading_port,
                'discharge_port' => $item?->discharge_port,
                'status' => $this->statusForLoad($loadPercent),
            ];
        })->values();

        $totalCargo = $items->sum('weight_tonnes');
        $totalCapacity = max($items->sum('capacity_tonnes'), 1);

        return Inertia::render('CargoPlan/Index', [
            'cargoPlan' => [
                'id' => $cargoPlan?->id,
                'name' => $cargoPlan?->name ?? 'Nav aktīva kravas plāna',
                'mode' => $cargoPlan?->mode ?? 'training',
                'status' => $cargoPlan?->status ?? 'draft',
            ],
            'vessel' => [
                'id' => $vessel->id,
                'name' => $vessel->name,
                'type' => $vessel->type,
                'imo_number' => $vessel->imo_number,
                'dwt' => round((float) $vessel->dwt, 2),
            ],
            'summary' => [
                'total_cargo' => round($totalCargo, 2),
                'total_capacity' => round($totalCapacity, 2),
                'load_percent' => round(($totalCargo / $totalCapacity) * 100, 1),
                'holds_count' => $items->count(),
                'warnings_count' => $items->filter(fn ($item) => $item['load_percent'] >= 90)->count(),
            ],
            'items' => $items,
        ]);
    }

    public function updateItem(Request $request, CargoPlanItem $cargoPlanItem): RedirectResponse
    {
        $validated = $request->validate([
            'weight_tonnes' => ['required', 'numeric', 'min:0'],
            'cargo_name' => ['required', 'string', 'max:255'],
            'loading_port' => ['nullable', 'string', 'max:255'],
            'discharge_port' => ['nullable', 'string', 'max:255'],
        ]);

        $cargoPlanItem->load('cargoType');

        $density = max((float) ($cargoPlanItem->cargoType?->density ?? 1), 0.1);
        $volume = (float) $validated['weight_tonnes'] / $density;

        $cargoPlanItem->update([
            'cargo_name' => $validated['cargo_name'],
            'weight_tonnes' => $validated['weight_tonnes'],
            'volume_m3' => round($volume, 2),
            'loading_port' => $validated['loading_port'] ?? null,
            'discharge_port' => $validated['discharge_port'] ?? null,
        ]);

        return back()->with('success', 'Kravas plāna rinda atjaunināta.');
    }

    private function statusForLoad(float $loadPercent): string
    {
        if ($loadPercent > 100) {
            return 'Pārslogots';
        }

        if ($loadPercent >= 95) {
            return 'Pilns';
        }

        if ($loadPercent >= 85) {
            return 'Brīdinājums';
        }

        if ($loadPercent >= 65) {
            return 'Pieņemams';
        }

        return 'Labi';
    }
}