<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = [
        'code',
        'semester',
        'school_year',
        'program',
        'status',
    ];
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_section');
    }



}
