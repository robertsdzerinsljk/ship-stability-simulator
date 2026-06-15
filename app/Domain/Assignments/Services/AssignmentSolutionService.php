<?php

namespace App\Domain\Assignments\Services;

use App\Models\Assignment;
use App\Models\AssignmentSolution;
use App\Models\CargoPlan;
use App\Models\CargoPlanItem;
use App\Models\SolutionBallastTank;
use Illuminate\Support\Facades\DB;

class AssignmentSolutionService
{
    public function startOrGet(Assignment $assignment): AssignmentSolution
    {
        $assignment->loadMissing([
            'student',
            'solution.cargoPlan.items',
            'solution.ballastTanks',
            'scenario.vessel.ballastTanks',
            'scenario.cargoPlan.items.cargoType',
            'scenario.cargoPlan.items.compartment',
        ]);

        if ($assignment->solution) {
            return $assignment->solution->load([
                'vessel.compartments',
                'vessel.limits',
                'cargoPlan.items.cargoType',
                'cargoPlan.items.compartment',
                'ballastTanks',
            ]);
        }

        return DB::transaction(function () use ($assignment) {
            $scenario = $assignment->scenario;
            $vessel = $scenario->vessel;

            $sourceCargoPlan = $scenario->cargoPlan
                ?? CargoPlan::query()
                    ->with(['items.cargoType', 'items.compartment'])
                    ->where('vessel_id', $vessel->id)
                    ->where('status', 'active')
                    ->latest('id')
                    ->first();

            if (! $sourceCargoPlan) {
                throw new \RuntimeException('Assignment cannot be started because scenario has no cargo plan and vessel has no active cargo plan.');
            }

            $sourceCargoPlan->loadMissing(['items.cargoType', 'items.compartment']);

            $solution = AssignmentSolution::create([
                'assignment_id' => $assignment->id,
                'scenario_id' => $scenario->id,
                'user_id' => $assignment->user_id,
                'vessel_id' => $vessel->id,
                'source_cargo_plan_id' => $sourceCargoPlan?->id,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);

            if ($sourceCargoPlan) {
                $solutionCargoPlan = CargoPlan::create([
                    'vessel_id' => $vessel->id,
                    'created_by_user_id' => $assignment->user_id,
                    'name' => $sourceCargoPlan->name . ' · ' . ($assignment->student?->name ?? 'Student solution'),
                    'mode' => $scenario->mode,
                    'status' => 'solution',
                    'notes' => 'Private student solution copy for assignment #' . $assignment->id,
                ]);

                foreach ($sourceCargoPlan->items as $item) {
                    CargoPlanItem::create([
                        'cargo_plan_id' => $solutionCargoPlan->id,
                        'vessel_compartment_id' => $item->vessel_compartment_id,
                        'cargo_type_id' => $item->cargo_type_id,
                        'cargo_name' => $item->cargo_name,
                        'weight_tonnes' => $item->weight_tonnes,
                        'volume_m3' => $item->volume_m3,
                        'loading_port' => $item->loading_port,
                        'discharge_port' => $item->discharge_port,
                        'priority' => $item->priority,
                        'status' => $item->status,
                    ]);
                }

                $solution->update([
                    'solution_cargo_plan_id' => $solutionCargoPlan->id,
                ]);
            }

            foreach ($vessel->ballastTanks as $tank) {
                SolutionBallastTank::create([
                    'assignment_solution_id' => $solution->id,
                    'original_ballast_tank_id' => $tank->id,
                    'vessel_id' => $vessel->id,
                    'name' => $tank->name,
                    'code' => $tank->code,
                    'side' => $tank->side,
                    'capacity_tonnes' => $tank->capacity_tonnes,
                    'capacity_m3' => $tank->capacity_m3,
                    'current_tonnes' => $tank->current_tonnes,
                    'lcg' => $tank->lcg,
                    'vcg' => $tank->vcg,
                    'tcg' => $tank->tcg,
                    'max_fill_percent' => $tank->max_fill_percent,
                    'free_surface_coefficient' => $tank->free_surface_coefficient,
                    'sort_order' => $tank->sort_order,
                    'status' => $tank->status,
                ]);
            }

            return $solution->fresh([
                'vessel.compartments',
                'vessel.limits',
                'cargoPlan.items.cargoType',
                'cargoPlan.items.compartment',
                'ballastTanks',
            ]);
        });
    }
}