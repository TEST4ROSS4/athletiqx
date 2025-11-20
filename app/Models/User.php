<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Collection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'school_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // 🔗 Relationships
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function taughtCourseSections()
    {
        return $this->belongsToMany(
            CourseSection::class,
            'professor_course_section',
            'professor_id',
            'course_section_id'
        )->withPivot('school_id')->withTimestamps();
    }

    public function enrolledCourseSections()
    {
        return $this->belongsToMany(
            CourseSection::class,
            'student_course_section',
            'student_id',
            'course_section_id'
        )->withPivot(['school_id', 'final_grade', 'attendance_rate'])->withTimestamps();
    }

    public function coachAssignments()
    {
        return $this->hasMany(CoachAssignment::class, 'coach_id');
    }

    public function sportTeamAssignments()
    {
        return $this->hasMany(StudentSportTeam::class, 'student_id');
    }

    // 🔍 Role Helpers
    public function isAdmin(): bool
    {
        return $this->hasRole('Admin');
    }

    public function scopeAdmin(Builder $query): Builder
    {
        return $query->role('Admin');
    }

    // ✅ Assigned Teams via CoachAssignment (sport or sport_team)
    public function assignedTeams(): Collection
    {
        $directTeamIds = CoachAssignment::where('coach_id', $this->id)
            ->where('school_id', $this->school_id)
            ->whereNotNull('sport_team_id')
            ->pluck('sport_team_id');

        $sportIds = CoachAssignment::where('coach_id', $this->id)
            ->where('school_id', $this->school_id)
            ->whereNotNull('sport_id')
            ->pluck('sport_id');

        $viaSportTeamIds = SportTeam::whereIn('sport_id', $sportIds)->pluck('id');

        $allTeamIds = $directTeamIds->merge($viaSportTeamIds)->unique();

        return SportTeam::whereIn('id', $allTeamIds)->get();
    }

    // ✅ Access Helper: Can manage this team?
    public function canManageTeam(SportTeam $team): bool
    {
        if ($this->hasRole('School Admin')) {
            return true;
        }

        if (! $this->can('student-sport-teams.view')) {
            return false;
        }

        return CoachAssignment::where('coach_id', $this->id)
            ->where('school_id', $this->school_id)
            ->where(function ($q) use ($team) {
                $q->where('sport_team_id', $team->id)
                    ->orWhere('sport_id', $team->sport_id);
            })
            ->exists();
    }

    public function createdPrograms()
    {
        return $this->hasMany(Program::class, 'created_by');
    }

    public function assignedPrograms()
    {
        return $this->hasMany(ProgramAssignment::class, 'assigned_by');
    }

    public function receivedProgramAssignments()
    {
        return $this->hasMany(ProgramAssignment::class, 'student_id');
    }

    public function exerciseLogs()
    {
        return $this->hasMany(ExerciseLog::class, 'student_id');
    }

    public function personalBests()
    {
        return $this->hasMany(PersonalBest::class, 'student_id');
    }

    public function isAssignedToProgram(Program $program)
    {
        return $this->receivedProgramAssignments()
            ->where('program_id', $program->id)
            ->exists();
    }
}
