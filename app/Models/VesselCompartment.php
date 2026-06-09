<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VesselCompartment extends Model
{
    protected $fillable = [
        'vessel_id',
        'name',
        'code',
        'type',
        'capacity_tonnes',
        'capacity_m3',
        'lcg',
        'vcg',
        'tcg',
        'max_load_percent',
        'allowed_cargo_type',
        'sort_order',
        'status',
    ];

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }
}