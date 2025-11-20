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
        'inputs',
        'notes',
        'marked_as_done',
    ];

    protected $casts = [
        'assignment_id' => 'integer',
        'exercise_id' => 'integer',
        'set_id' => 'integer',
        'inputs' => 'array',
        'marked_as_done' => 'boolean',
    ];

    //Relationships

    public function assignment()
    {
        return $this->belongsTo(ProgramAssignment::class, 'assignment_id');
    }

    public function exercise()
    {
        return $this->belongsTo(ProgramExercise::class, 'exercise_id');
    }

    public function set()
    {
        return $this->belongsTo(ExerciseSet::class, 'set_id');
    }

    public function student()
    {
        return $this->assignment->student();
    }

    public function personalBest()
    {
        return $this->hasOne(PersonalBest::class, 'source_log_id');
    }
}
