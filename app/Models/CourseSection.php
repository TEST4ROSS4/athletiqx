<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseSection extends Model
{
    use HasFactory;

    protected $table = 'course_section';

    protected $fillable = [
        'course_id',
        'section_id',
        'term',
        'units',
        'school_id',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
        'school_id' => 'integer',
    ];

    // 🔗 Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function classSchedule()
    {
        return $this->hasOne(ClassSchedule::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function professorAssignments()
    {
        return $this->hasMany(ProfessorCourseSection::class);
    }

    public function studentEnrollments()
    {
        return $this->hasMany(StudentCourseSection::class);
    }

    public function professors()
    {
        return $this->belongsToMany(User::class, 'professor_course_section', 'course_section_id', 'professor_id')
            ->withPivot('school_id')
            ->withTimestamps();
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'student_course_section', 'course_section_id', 'student_id')
            ->withPivot(['school_id', 'final_grade', 'attendance_rate'])
            ->withTimestamps();
    }

    // 🔍 Scopes for lifecycle filtering
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
}
