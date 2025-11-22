<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarSchedule extends Model
{
    use HasFactory;

    protected $table = 'calendar_schedule';

    protected $fillable = [
        'created_by',
        'title',
        'type',
        'description',
        'date',
        'start_time',
        'end_time',
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments()
    {
        return $this->hasMany(CalendarAssignments::class, 'calendar_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'calendar_assignments', 'calendar_id', 'student_id');
    }
}
