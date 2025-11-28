<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Scholarship extends Model
{
    use HasFactory;

    protected $fillable = ['school_id', 'min_grade_percentage'];

    protected $casts = [
        'min_grade_percentage' => 'decimal:2',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}

