<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CargoPlanItem extends Model
{
    protected $fillable = [
        'cargo_plan_id',
        'vessel_compartment_id',
        'cargo_type_id',
        'cargo_name',
        'weight_tonnes',
        'volume_m3',
        'loading_port',
        'discharge_port',
        'priority',
        'status',
    ];

    public function cargoPlan(): BelongsTo
    {
        return $this->belongsTo(CargoPlan::class);
    }

    public function compartment(): BelongsTo
    {
        return $this->belongsTo(VesselCompartment::class, 'vessel_compartment_id');
    }

    public function cargoType(): BelongsTo
    {
        return $this->belongsTo(CargoType::class);
    }
}