<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sport extends Model
{
    protected $fillable = [
        'name',
        'category',
        'gender',
        'is_active',
        'division',
        'school_id',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function sportsTeams()
    {
        return $this->hasMany(SportTeam::class);
    }
}