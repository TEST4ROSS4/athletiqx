<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TrainingLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'training_id',
        'student_id',
        'sets_assigned',
        'sets_completed',
        'reps_assigned',
        'reps_completed',
        'weight_assigned',
        'weight_actual',
        'duration_assigned',
        'duration_actual',
        'compliance_score',
        'variance_percentage',
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

    public function training()
    {
        return $this->belongsTo(Program::class, 'training_id');
    }
}
