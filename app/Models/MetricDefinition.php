<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MetricDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'comparison',
        'unit',
    ];

    protected $casts = [
        'name' => 'string',
        'comparison' => 'string',
        'unit' => 'string',
    ];

    // 🔗 Relationships

    public function personalBests()
    {
        return $this->hasMany(PersonalBest::class);
    }
}