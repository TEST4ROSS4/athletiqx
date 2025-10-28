<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SportTeam extends Model
{
    protected $fillable = [
        'name',
        'season',
        'is_official',
        'sport_id',
        'school_id',
    ];

    public function sport()
    {
        return $this->belongsTo(Sport::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}