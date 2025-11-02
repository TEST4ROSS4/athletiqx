<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class CoachAssignment extends Model
{
    use HasFactory;

    protected $table = 'coach_assignments';

    protected $fillable = [
        'coach_id',
        'sport_id',
        'sport_team_id',
        'school_id',
    ];

    protected $casts = [
        'school_id' => 'integer',
    ];

    // 🔗 Relationships
    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function sport()
    {
        return $this->belongsTo(Sport::class);
    }

    public function sportTeam()
    {
        return $this->belongsTo(SportTeam::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    // 🔍 Scope: Assignments for a given user
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('coach_id', $user->id)
                     ->where('school_id', $user->school_id);
    }

    // 🔍 Scope: Includes a specific team (via sport or sport_team)
    public function scopeIncludesTeam(Builder $query, SportTeam $team): Builder
    {
        return $query->where(function ($q) use ($team) {
            $q->where('sport_team_id', $team->id)
              ->orWhere('sport_id', $team->sport_id);
        });
    }

    // ✅ Helper: Check if user is assigned to a team
    public static function userAssignedToTeam(User $user, SportTeam $team): bool
    {
        return self::forUser($user)
            ->includesTeam($team)
            ->exists();
    }
}