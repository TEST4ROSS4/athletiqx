<?php

namespace App\Models;

use App\Models\Course;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * App\Models\User
 *
 * @property-read \Illuminate\Support\Collection $roles
 * @method bool hasRole(string|int|array|\Spatie\Permission\Models\Role|\Illuminate\Support\Collection|\BackedEnum $roles, string|null $guard = null)
 * @method \Spatie\Permission\Models\Role assignRole(string|array|\Spatie\Permission\Models\Role $role)
 * @method void syncRoles(array|\Spatie\Permission\Models\Role $roles)
 * @method bool hasPermissionTo(string|\Spatie\Permission\Models\Permission $permission, string|null $guardName = null)
 * @method \Illuminate\Support\Collection getRoleNames()
 * @method \Illuminate\Database\Eloquent\Builder role(string|array|\Spatie\Permission\Models\Role $roles, string|null $guard = null)
 */

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'school_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relationship: User belongs to a School.
     */
    public function school()
    {
        return $this->belongsTo(School::class);
    }


    /**
     * Helper: Check if user has the 'Admin' role.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('Admin');
    }

    /**
     * Scope: Query users with the 'Admin' role.
     */
    public function scopeAdmin(Builder $query): Builder
    {
        return $query->role('Admin');
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

    // COACH ASSIGNMENT SPORT TEAM MERGE LIST
    public function assignedTeams()
    {
        $direct = SportTeam::whereIn('id', function ($query) {
            $query->select('sport_team_id')
                ->from('coach_assignments')
                ->where('coach_id', $this->id)
                ->whereNotNull('sport_team_id');
        })->get();

        $sports = CoachAssignment::where('coach_id', $this->id)
            ->whereNotNull('sport_id')
            ->pluck('sport_id');

        $viaSport = SportTeam::whereIn('sport_id', $sports)->get();

        return $direct->merge($viaSport)->unique('id');
    }

    public function sportTeamAssignments()
    {
        return $this->hasMany(StudentSportTeam::class, 'student_id');
    }
}
