<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class StudentSportTeam extends Model
{
    use HasFactory;

    protected $table = 'student_sport_team';

    protected $fillable = [
        'student_id',
        'sport_team_id',
        'school_id',
        'status',
        'position',
    ];

    protected $casts = [
        'school_id' => 'integer',
    ];

    // 🔗 Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function sportTeam()
    {
        return $this->belongsTo(SportTeam::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    // 🔍 Scope: Filter assignments visible to a user
    public function scopeVisibleToUser(Builder $query, User $user): Builder
    {
        if ($user->hasRole('School Admin')) {
            return $query->where('school_id', $user->school_id);
        }

        if ($user->can('student-sport-teams.view')) {
            return $query->whereIn('sport_team_id', $user->assignedTeams()->pluck('id'));
        }

        return $query->whereRaw('1 = 0'); // deny access
    }

    // ✅ Helper: Can view this assignment?
    public function canView(User $user): bool
    {
        if ($user->hasRole('School Admin')) {
            return true;
        }

        return $user->can('student-sport-teams.view') &&
               $this->sportTeam &&
               $this->sportTeam->isAssignedTo($user);
    }

    // ✅ Helper: Can create assignment for this team?
    public function canCreate(User $user): bool
    {
        if ($user->hasRole('School Admin')) {
            return true;
        }

        return $user->can('student-sport-teams.create') &&
               $this->sportTeam &&
               $this->sportTeam->isAssignedTo($user);
    }

    // ✅ Helper: Can edit this assignment?
    public function canEdit(User $user): bool
    {
        if ($user->hasRole('School Admin')) {
            return true;
        }

        return $user->can('student-sport-teams.edit') &&
               $this->sportTeam &&
               $this->sportTeam->isAssignedTo($user);
    }

    // ✅ Helper: Can delete this assignment?
    public function canDelete(User $user): bool
    {
        if ($user->hasRole('School Admin')) {
            return true;
        }

        return $user->can('student-sport-teams.delete') &&
               $this->sportTeam &&
               $this->sportTeam->isAssignedTo($user);
    }

    // ✅ Legacy compatibility: isManageableBy
    public function isManageableBy(User $user): bool
    {
        return $this->canEdit($user);
    }
}