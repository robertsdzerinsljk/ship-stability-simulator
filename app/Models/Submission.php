<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    protected $fillable = [
        'assignment_id',
        'scenario_id',
        'user_id',
        'cargo_plan_id',
        'status',
        'stability_snapshot',
        'student_comment',
        'teacher_comment',
        'score',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'stability_snapshot' => 'array',
            'submitted_at' => 'datetime',
            'score' => 'decimal:2',
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

    public function cargoPlan(): BelongsTo
    {
        return $this->belongsTo(CargoPlan::class);
    }
}