<?php

namespace App\Http\Controllers;

use App\Models\BallastTank;
use App\Models\SolutionBallastTank;
use App\Support\ActiveAssignmentSolution;
use App\Support\ActiveVessel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BallastController extends Controller
{
    public function index(Request $request): Response
    {
        $solution = ActiveAssignmentSolution::current($request);

        if ($solution) {
            $vessel = $solution->vessel;
            $ballastTanks = $solution->ballastTanks;
        } else {
            $vessel = ActiveVessel::query($request)
                ->with(['ballastTanks', 'limits'])
                ->firstOrFail();

            $ballastTanks = $vessel->ballastTanks;
        }

        $tanks = $ballastTanks->map(function ($tank) {
            $capacity = max((float) $tank->capacity_tonnes, 1);
            $current = (float) $tank->current_tonnes;
            $fillPercent = ($current / $capacity) * 100;

            return [
                'id' => $tank->id,
                'name' => $tank->name,
                'code' => $tank->code,
                'side' => $tank->side,
                'capacity_tonnes' => round($capacity, 2),
                'current_tonnes' => round($current, 2),
                'fill_percent' => round($fillPercent, 1),
                'lcg' => round((float) $tank->lcg, 2),
                'vcg' => round((float) $tank->vcg, 2),
                'tcg' => round((float) $tank->tcg, 2),
                'free_surface_coefficient' => round((float) $tank->free_surface_coefficient, 5),
                'free_surface_risk' => $fillPercent > 5 && $fillPercent < 95,
                'status' => $this->statusForFill($fillPercent),
            ];
        })->values();

        $totalBallast = (float) $ballastTanks->sum('current_tonnes');
        $totalCapacity = max((float) $ballastTanks->sum('capacity_tonnes'), 1);

        $portTonnes = (float) $ballastTanks
            ->where('side', 'port')
            ->sum('current_tonnes');

        $starboardTonnes = (float) $ballastTanks
            ->where('side', 'starboard')
            ->sum('current_tonnes');

        $centerTonnes = (float) $ballastTanks
            ->where('side', 'center')
            ->sum('current_tonnes');

        $freeSurfaceCount = $tanks
            ->filter(fn (array $tank) => $tank['free_surface_risk'])
            ->count();

        $imbalance = abs($portTonnes - $starboardTonnes);

        return Inertia::render('Ballast/Index', [
            'vessel' => [
                'id' => $vessel->id,
                'name' => $vessel->name,
                'type' => $vessel->type,
                'imo_number' => $vessel->imo_number,
            ],
            'summary' => [
                'total_ballast' => round($totalBallast, 2),
                'total_capacity' => round($totalCapacity, 2),
                'fill_percent' => round(($totalBallast / $totalCapacity) * 100, 1),
                'port_tonnes' => round($portTonnes, 2),
                'starboard_tonnes' => round($starboardTonnes, 2),
                'center_tonnes' => round($centerTonnes, 2),
                'imbalance_tonnes' => round($imbalance, 2),
                'free_surface_count' => $freeSurfaceCount,
                'tanks_count' => $ballastTanks->count(),
                'balance_status' => $imbalance > 100 ? 'Jāpārbauda' : 'Līdzsvarots',
            ],
            'tanks' => $tanks->toArray(),
            'workspace' => $solution ? [
                'assignment_id' => $solution->assignment_id,
                'solution_id' => $solution->id,
                'mode' => 'student_solution',
            ] : null,
        ]);
    }

    public function updateTank(Request $request, int $tankId): RedirectResponse
    {
        $solution = ActiveAssignmentSolution::current($request);

        $tank = $solution
            ? SolutionBallastTank::query()
                ->where('assignment_solution_id', $solution->id)
                ->where('id', $tankId)
                ->firstOrFail()
            : BallastTank::query()
                ->where('id', $tankId)
                ->firstOrFail();

        $validated = $request->validate([
            'current_tonnes' => ['required', 'numeric', 'min:0'],
        ]);

        $capacity = (float) $tank->capacity_tonnes;
        $current = (float) $validated['current_tonnes'];

        if ($current > $capacity) {
            return back()->withErrors([
                'current_tonnes' => 'Balasta daudzums nedrīkst pārsniegt tanka kapacitāti.',
            ]);
        }

        $tank->update([
            'current_tonnes' => $current,
        ]);

        return back()->with('success', 'Balasta tanks atjaunināts.');
    }

    private function statusForFill(float $fillPercent): string
    {
        if ($fillPercent <= 5) {
            return 'empty';
        }

        if ($fillPercent >= 95) {
            return 'full';
        }

        return 'partial';
    }
}