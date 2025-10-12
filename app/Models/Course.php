<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'title',
        'code',
    ];

    public function sections()
    {
        return $this->belongsToMany(Section::class, 'course_section');
    }

}

