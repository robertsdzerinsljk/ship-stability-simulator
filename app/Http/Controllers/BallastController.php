<?php

namespace App\Http\Controllers;

use App\Models\BallastTank;
use App\Models\Vessel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BallastController extends Controller
{
    public function index(): Response
    {
        $vessel = Vessel::query()
            ->with(['ballastTanks', 'limits'])
            ->where('status', 'active')
            ->firstOrFail();

        $tanks = $vessel->ballastTanks->map(function (BallastTank $tank) {
            $capacity = max((float) $tank->capacity_tonnes, 1);
            $current = (float) $tank->current_tonnes;
            $fillPercent = ($current / $capacity) * 100;

            return [
                'id' => $tank->id,
                'name' => $tank->name,
                'code' => $tank->code,
                'side' => $tank->side,
                'capacity_tonnes' => round($capacity, 2),
                'capacity_m3' => round((float) $tank->capacity_m3, 2),
                'current_tonnes' => round($current, 2),
                'fill_percent' => round($fillPercent, 1),
                'lcg' => round((float) $tank->lcg, 2),
                'vcg' => round((float) $tank->vcg, 2),
                'tcg' => round((float) $tank->tcg, 2),
                'free_surface_coefficient' => round((float) $tank->free_surface_coefficient, 4),
                'free_surface_risk' => $fillPercent > 5 && $fillPercent < 95,
                'status' => $this->statusForFill($fillPercent),
            ];
        })->values();

        $totalCapacity = max($tanks->sum('capacity_tonnes'), 1);
        $totalCurrent = $tanks->sum('current_tonnes');

        $portTonnes = $tanks->where('side', 'port')->sum('current_tonnes');
        $starboardTonnes = $tanks->where('side', 'starboard')->sum('current_tonnes');
        $centerTonnes = $tanks->where('side', 'center')->sum('current_tonnes');

        $imbalance = abs($portTonnes - $starboardTonnes);

        return Inertia::render('Ballast/Index', [
            'vessel' => [
                'id' => $vessel->id,
                'name' => $vessel->name,
                'type' => $vessel->type,
                'imo_number' => $vessel->imo_number,
            ],
            'summary' => [
                'total_ballast' => round($totalCurrent, 2),
                'total_capacity' => round($totalCapacity, 2),
                'fill_percent' => round(($totalCurrent / $totalCapacity) * 100, 1),
                'port_tonnes' => round($portTonnes, 2),
                'starboard_tonnes' => round($starboardTonnes, 2),
                'center_tonnes' => round($centerTonnes, 2),
                'imbalance_tonnes' => round($imbalance, 2),
                'free_surface_count' => $tanks->where('free_surface_risk', true)->count(),
                'tanks_count' => $tanks->count(),
                'balance_status' => $imbalance > 100 ? 'Jāpārbauda' : 'Līdzsvarots',
            ],
            'tanks' => $tanks,
        ]);
    }

    public function updateTank(Request $request, BallastTank $ballastTank): RedirectResponse
    {
        $validated = $request->validate([
            'current_tonnes' => ['required', 'numeric', 'min:0'],
        ]);

        $currentTonnes = (float) $validated['current_tonnes'];
        $capacityTonnes = (float) $ballastTank->capacity_tonnes;

        if ($currentTonnes > $capacityTonnes) {
            return back()->withErrors([
                'current_tonnes' => "Tankā nevar ievadīt vairāk par {$capacityTonnes} t.",
            ]);
        }

        $ballastTank->update([
            'current_tonnes' => $currentTonnes,
        ]);

        return back()->with('success', 'Balasta tvertnes dati atjaunināti.');
    }

    private function statusForFill(float $fillPercent): string
    {
        if ($fillPercent <= 0) {
            return 'Tukšs';
        }

        if ($fillPercent < 5) {
            return 'Gandrīz tukšs';
        }

        if ($fillPercent < 95) {
            return 'Daļēji piepildīts';
        }

        if ($fillPercent <= 100) {
            return 'Pilns';
        }

        return 'Pārsniegts';
    }
}