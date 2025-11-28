<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarAssignments extends Model
{
    use HasFactory;

    protected $table = 'calendar_assignments';

    protected $fillable = [
        'calendar_id',
        'student_id',
    ];

    // Relationships
    public function calendar()
    {
        return $this->belongsTo(CalendarSchedule::class, 'calendar_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

}
