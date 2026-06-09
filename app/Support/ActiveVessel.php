<?php

namespace App\Support;

use App\Models\Vessel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ActiveVessel
{
    public static function id(Request $request): ?int
    {
        $sessionVesselId = $request->session()->get('active_vessel_id');

        if ($sessionVesselId) {
            return (int) $sessionVesselId;
        }

        return Vessel::query()
            ->where('status', 'active')
            ->orderBy('type')
            ->orderBy('name')
            ->value('id');
    }

    public static function query(Request $request): Builder
    {
        $activeVesselId = self::id($request);

        return Vessel::query()
            ->where('status', 'active')
            ->when($activeVesselId, fn (Builder $query) => $query->where('id', $activeVesselId));
    }

    public static function set(Request $request, Vessel $vessel): void
    {
        $request->session()->put('active_vessel_id', $vessel->id);
    }
}