<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scenario extends Model
{
    protected $fillable = [
        'vessel_id',
        'cargo_plan_id',
        'created_by_user_id',
        'title',
        'short_description',
        'task_text',
        'course',
        'difficulty',
        'mode',
        'status',
        'due_at',
        'estimated_minutes',
        'final_requirements',
        'teacher_notes',
        'student_hints',
        'show_hints',
        'allow_solution_comparison',
    ];

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
            'show_hints' => 'boolean',
            'allow_solution_comparison' => 'boolean',
        ];
    }

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }

    public function cargoPlan(): BelongsTo
    {
        return $this->belongsTo(CargoPlan::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
    public function assignments(): HasMany
    {
    return $this->hasMany(Assignment::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}