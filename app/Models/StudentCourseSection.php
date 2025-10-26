<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentCourseSection extends Model
{
    use HasFactory;

    protected $table = 'student_course_section';

    protected $fillable = [
        'student_id',
        'course_section_id',
        'school_id',
        'final_grade',
        'attendance_rate',
    ];

    protected $casts = [
        'final_grade' => 'decimal:2',
        'attendance_rate' => 'decimal:2',
        'school_id' => 'integer',
    ];

    // 🔗 Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function courseSection()
    {
        return $this->belongsTo(CourseSection::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}