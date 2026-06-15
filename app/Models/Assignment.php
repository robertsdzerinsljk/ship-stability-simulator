<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Assignment extends Model
{
    protected $fillable = [
        'scenario_id',
        'user_id',
        'assigned_by_user_id',
        'status',
        'assigned_at',
        'started_at',
        'submitted_at',
        'due_at',
        'student_group_id',
        'due_soon_notified_at',
        'overdue_notified_at',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'due_at' => 'datetime',
            'due_soon_notified_at' => 'datetime',
            'overdue_notified_at' => 'datetime',
        ];
    }

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(Scenario::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id');
    }

    public function submission(): HasOne
    {
        return $this->hasOne(Submission::class);
    }
    public function solution(): HasOne
    {
    return $this->hasOne(AssignmentSolution::class);
    }
    public function studentGroup(): BelongsTo
{
    return $this->belongsTo(StudentGroup::class);
}
}