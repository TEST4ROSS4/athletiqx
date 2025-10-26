<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProfessorCourseSection extends Model
{
    use HasFactory;

    protected $table = 'professor_course_section';

    protected $fillable = [
        'professor_id',
        'course_section_id',
        'school_id',
    ];

    protected $casts = [
        'school_id' => 'integer',
    ];

    // 🔗 Relationships
    public function professor()
    {
        return $this->belongsTo(User::class, 'professor_id');
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