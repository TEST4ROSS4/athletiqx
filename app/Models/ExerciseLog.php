<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExerciseLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'exercise_id',
        'set_id',
        'values',
        'notes',
        'completed',
        'performed_at',
    ];

    protected $casts = [
        'assignment_id' => 'integer',
        'exercise_id' => 'integer',
        'set_id' => 'integer',
        'values' => 'array',
        'completed' => 'boolean',
        'performed_at' => 'datetime',
    ];

    // 🔗 Relationships

    public function assignment()
    {
        return $this->belongsTo(ProgramAssignment::class, 'program_assignment_id');
    }

    public function exercise()
    {
        return $this->belongsTo(ProgramExercise::class, 'program_exercise_id');
    }

    public function set()
    {
        return $this->belongsTo(ExerciseSet::class, 'exercise_set_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function personalBest()
    {
        return $this->hasOne(PersonalBest::class, 'source_log_id');
    }
}
