<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExerciseSet extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_exercise_id',
        'order',
        'fields',
        'suggested_values',
    ];

    protected $casts = [
        'program_exercise_id' => 'integer',
        'order' => 'integer',
        'fields' => 'array',
        'suggested_values' => 'array',
    ];

    // 🔗 Relationships

    public function exercise()
    {
        return $this->belongsTo(ProgramExercise::class, 'program_exercise_id');
    }

    public function logs()
    {
        return $this->hasMany(ExerciseLog::class);
    }
}