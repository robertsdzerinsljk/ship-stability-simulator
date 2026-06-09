<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VesselLimit extends Model
{
    protected $fillable = [
        'vessel_id',
        'min_gm',
        'max_draft',
        'max_trim',
        'max_heel',
        'max_compartment_load_percent',
        'max_sf_percent',
        'max_bm_percent',
        'load_line_note',
    ];

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }
}