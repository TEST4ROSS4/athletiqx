<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class KpiLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'training_id',
        'sets_assigned',
        'sets_completed',
        'reps_assigned',
        'reps_completed',
        'weight_assigned',
        'weight_actual',
        'duration_assigned',
        'duration_actual',
        'compliance_score',
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
