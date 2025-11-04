<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'school_id',
        'name',
        'note',
    ];

    protected $casts = [
        'school_id' => 'integer',
        'created_by' => 'integer',
    ];

    // 🔗 Relationships

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function exercises()
    {
        return $this->hasMany(ProgramExercise::class);
    }

    public function assignments()
    {
        return $this->hasMany(ProgramAssignment::class);
    }

    public function logs()
    {
        return $this->hasMany(ExerciseLog::class);
    }
}