<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PersonalBest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'program_exercise_id',
        'metric',
        'value',
        'logged_at',
        'source_log_id',
    ];

    protected $casts = [
        'student_id' => 'integer',
        'program_exercise_id' => 'integer',
        'value' => 'float',
        'logged_at' => 'datetime',
        'source_log_id' => 'integer',
    ];

    // 🔗 Relationships

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function exercise()
    {
        return $this->belongsTo(ProgramExercise::class, 'program_exercise_id');
    }

    public function sourceLog()
    {
        return $this->belongsTo(ExerciseLog::class, 'source_log_id');
    }
}