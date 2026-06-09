<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolutionBallastTank extends Model
{
    protected $fillable = [
        'assignment_solution_id',
        'original_ballast_tank_id',
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

    public function assignmentSolution(): BelongsTo
    {
        return $this->belongsTo(AssignmentSolution::class);
    }

    public function originalBallastTank(): BelongsTo
    {
        return $this->belongsTo(BallastTank::class, 'original_ballast_tank_id');
    }

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }
}