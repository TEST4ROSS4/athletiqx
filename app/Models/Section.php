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


    public function courseSections()
    {
        return $this->hasMany(CourseSection::class);
    }
}