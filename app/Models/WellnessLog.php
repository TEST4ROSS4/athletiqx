<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WellnessLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'sleep_hours',
        'sleep_quality',
        'nutrition_status',
        'hydration_level',
        'injury_status',
        'injury_severity',
        'mood',
        'energy_level',
        'recovery_soreness',
        'readiness_to_train',
        'notes',
        'logged_at',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
