<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExerciseLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_assignment_id',
        'program_exercise_id',
        'exercise_set_id',
        'student_id',
        'logged_at',
        'metrics',
        'notes',
    ];

    protected $casts = [
        'program_assignment_id' => 'integer',
        'program_exercise_id' => 'integer',
        'exercise_set_id' => 'integer',
        'student_id' => 'integer',
        'logged_at' => 'datetime',
        'metrics' => 'array',
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
