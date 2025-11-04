<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProgramExercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'name',
        'description',
        'order',
    ];

    protected $casts = [
        'program_id' => 'integer',
        'order' => 'integer',
    ];

    // 🔗 Relationships

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function sets()
    {
        return $this->hasMany(ExerciseSet::class);
    }

    public function logs()
    {
        return $this->hasMany(ExerciseLog::class);
    }

    public function personalBests()
    {
        return $this->hasMany(PersonalBest::class);
    }
}
