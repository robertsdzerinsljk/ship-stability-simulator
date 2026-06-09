<?php

namespace App\Support;

use App\Models\Assignment;
use App\Models\AssignmentSolution;
use Illuminate\Http\Request;

class ActiveAssignmentSolution
{
    public static function set(Request $request, Assignment $assignment): void
    {
        $request->session()->put('active_assignment_id', $assignment->id);
    }

    public static function clear(Request $request): void
    {
        $request->session()->forget('active_assignment_id');
    }

    public static function current(Request $request): ?AssignmentSolution
    {
        $assignmentId = $request->session()->get('active_assignment_id');
        $user = $request->user();

        if (! $assignmentId || ! $user) {
            return null;
        }

        $query = AssignmentSolution::query()
            ->with([
                'assignment.scenario',
                'vessel.compartments',
                'vessel.limits',
                'cargoPlan.items.cargoType',
                'cargoPlan.items.compartment',
                'ballastTanks',
            ])
            ->where('assignment_id', $assignmentId);

        if (! $user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        return $query->first();
    }
}