<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CargoType extends Model
{
    protected $fillable = [
        'name',
        'category',
        'density',
        'stowage_factor',
        'notes',
        'status',
    ];

    public function cargoPlanItems(): HasMany
    {
        return $this->hasMany(CargoPlanItem::class);
    }
}