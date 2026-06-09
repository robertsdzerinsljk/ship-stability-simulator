<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Vessel extends Model
{
    protected $fillable = [
        'name',
        'imo_number',
        'mmsi',
        'type',
        'flag',
        'class',
        'operator',
        'built_year',
        'length_overall',
        'length_between_perpendiculars',
        'breadth',
        'depth',
        'summer_draft',
        'dwt',
        'gt',
        'lightship_weight',
        'km_default',
        'status',
    ];

    public function compartments(): HasMany
    {
        return $this->hasMany(VesselCompartment::class)->orderBy('sort_order');
    }

    public function ballastTanks(): HasMany
    {
        return $this->hasMany(BallastTank::class)->orderBy('sort_order');
    }

    public function limits(): HasOne
    {
        return $this->hasOne(VesselLimit::class);
    }
}