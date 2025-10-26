<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'title',
        'code',
        'school_id',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function courseSections()
    {
        return $this->hasMany(CourseSection::class);
    }
}
