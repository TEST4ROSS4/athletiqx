<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ClassSchedule extends Model
{
    use HasFactory;

    protected $table = 'class_schedules';

    protected $fillable = [
        'course_section_id',
        'school_id',
        'days',    
        'time',   
        'room',     
    ];

    protected $casts = [
        'school_id' => 'integer',
    ];

    // 🔗 Relationships
    public function courseSection()
    {
        return $this->belongsTo(CourseSection::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}