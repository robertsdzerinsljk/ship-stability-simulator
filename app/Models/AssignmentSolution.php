<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssignmentSolution extends Model
{
    protected $fillable = [
        'assignment_id',
        'scenario_id',
        'user_id',
        'vessel_id',
        'source_cargo_plan_id',
        'solution_cargo_plan_id',
        'status',
        'started_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(Scenario::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }

    public function sourceCargoPlan(): BelongsTo
    {
        return $this->belongsTo(CargoPlan::class, 'source_cargo_plan_id');
    }

    public function cargoPlan(): BelongsTo
    {
        return $this->belongsTo(CargoPlan::class, 'solution_cargo_plan_id');
    }

    public function ballastTanks(): HasMany
    {
        return $this->hasMany(SolutionBallastTank::class)->orderBy('sort_order');
    }
}