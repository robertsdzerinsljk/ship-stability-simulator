<?php

namespace App\Http\Controllers;

use App\Models\Vessel;
use Inertia\Inertia;
use Inertia\Response;

class VesselController extends Controller
{
    public function index(): Response
    {
        $vessels = Vessel::query()
            ->withCount([
                'compartments',
                'ballastTanks',
                'cargoPlans',
                'scenarios',
            ])
            ->where('status', 'active')
            ->orderBy('type')
            ->orderBy('name')
            ->get()
            ->map(fn (Vessel $vessel) => [
                'id' => $vessel->id,
                'name' => $vessel->name,
                'imo_number' => $vessel->imo_number,
                'mmsi' => $vessel->mmsi,
                'type' => $vessel->type,
                'flag' => $vessel->flag,
                'class' => $vessel->class,
                'operator' => $vessel->operator,
                'built_year' => $vessel->built_year,
                'length_overall' => (float) $vessel->length_overall,
                'length_between_perpendiculars' => (float) $vessel->length_between_perpendiculars,
                'breadth' => (float) $vessel->breadth,
                'depth' => (float) $vessel->depth,
                'summer_draft' => (float) $vessel->summer_draft,
                'dwt' => (float) $vessel->dwt,
                'gt' => (float) $vessel->gt,
                'lightship_weight' => (float) $vessel->lightship_weight,
                'km_default' => (float) $vessel->km_default,
                'is_real_vessel' => $vessel->is_real_vessel,
                'data_source_name' => $vessel->data_source_name,
                'data_source_url' => $vessel->data_source_url,
                'data_confidence' => $vessel->data_confidence,
                'data_notes' => $vessel->data_notes,
                'hydrostatic_notes' => $vessel->hydrostatic_notes,
                'compartments_count' => $vessel->compartments_count,
                'ballast_tanks_count' => $vessel->ballast_tanks_count,
                'cargo_plans_count' => $vessel->cargo_plans_count,
                'scenarios_count' => $vessel->scenarios_count,
            ]);

        $typeSummary = $vessels
            ->groupBy('type')
            ->map(fn ($items, $type) => [
                'type' => $type,
                'count' => $items->count(),
            ])
            ->values();

        return Inertia::render('Vessels/Index', [
            'vessels' => $vessels,
            'typeSummary' => $typeSummary,
        ]);
    }
}