<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'auth_provider',
        'avatar',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function assignments(): HasMany
    {
    return $this->hasMany(Assignment::class);
    }

    public function submissions(): HasMany
    {
    return $this->hasMany(Submission::class);
    }
    public function studentGroups(): BelongsToMany
{
    return $this->belongsToMany(StudentGroup::class, 'student_group_user')
        ->withPivot([
            'member_role',
            'status',
            'external_source',
            'external_membership_id',
            'joined_at',
            'synced_at',
        ])
        ->withTimestamps()
        ->wherePivot('status', 'active');
}
}