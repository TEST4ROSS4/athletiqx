<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProgramAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'student_id',
        'assigned_by',
        'status',
        'assigned_at',
        'notes',
        'marked_done_at',
    ];

    protected $casts = [
        'program_id' => 'integer',
        'student_id' => 'integer',
        'assigned_by' => 'integer',
        'assigned_at' => 'datetime',
        'marked_done_at' => 'datetime',
    ];

    // 🔗 Relationships

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function logs()
    {
        return $this->hasMany(ExerciseLog::class, 'assignment_id');
    }
}
