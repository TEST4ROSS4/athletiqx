<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $fillable = [
        'name',
        'code',
        'address',
        'active',
    ];


    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function coachAssignments()
    {
        return $this->hasMany(CoachAssignment::class);
    }

    public function studentSportTeamAssignments()
    {
        return $this->hasMany(StudentSportTeam::class);
    }

    public function sportTeams()
    {
        return $this->hasMany(SportTeam::class);
    }

    public function sports()
    {
        return $this->hasMany(Sport::class);
    }

}
