<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BallastTank extends Model
{
    protected $fillable = [
        'vessel_id',
        'name',
        'code',
        'side',
        'capacity_tonnes',
        'capacity_m3',
        'current_tonnes',
        'lcg',
        'vcg',
        'tcg',
        'max_fill_percent',
        'free_surface_coefficient',
        'sort_order',
        'status',
    ];

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }
}