<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = [
        'code',
        'program',
        'school_id',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_section')
                    ->withPivot('term')
                    ->withTimestamps();
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'student_section')
                    ->withPivot(['grade', 'attendance', 'status', 'enrolled_at'])
                    ->withTimestamps();
    }

    public function professors()
    {
        return $this->belongsToMany(User::class, 'professor_section')
                    ->withTimestamps();
    }
}