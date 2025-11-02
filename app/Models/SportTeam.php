<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class SportTeam extends Model
{
    protected $fillable = [
        'name',
        'season',
        'is_official',
        'sport_id',
        'school_id',
    ];

    // 🔗 Relationships
    public function sport()
    {
        return $this->belongsTo(Sport::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function coachAssignments()
    {
        return $this->hasMany(CoachAssignment::class);
    }

    public function studentAssignments()
    {
        return $this->hasMany(StudentSportTeam::class);
    }

    // 🔍 Scope: Filter teams assigned to a user
    public function scopeAssignedToUser(Builder $query, User $user): Builder
    {
        return $query->whereIn('id', $user->assignedTeams()->pluck('id'));
    }

    // ✅ Helper: Check if a user is assigned to this team
    public function isAssignedTo(User $user): bool
    {
        return CoachAssignment::forUser($user)
            ->includesTeam($this)
            ->exists();
    }
}