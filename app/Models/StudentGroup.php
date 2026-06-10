<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentGroup extends Model
{
    protected $fillable = [
        'created_by_user_id',
        'name',
        'code',
        'academic_year',
        'type',
        'external_source',
        'external_id',
        'description',
        'status',
        'synced_at',
    ];

    protected $casts = [
        'synced_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_group_user')
            ->withPivot([
                'member_role',
                'status',
                'external_source',
                'external_membership_id',
                'joined_at',
                'synced_at',
            ])
            ->withTimestamps()
            ->wherePivot('member_role', 'student')
            ->wherePivot('status', 'active');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_group_user')
            ->withPivot([
                'member_role',
                'status',
                'external_source',
                'external_membership_id',
                'joined_at',
                'synced_at',
            ])
            ->withTimestamps();
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }
}