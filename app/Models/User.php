<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * App\Models\User
 *
 * @method bool hasRole(string|int|array|\Spatie\Permission\Models\Role|\Illuminate\Support\Collection|\BackedEnum $roles, string|null $guard = null)
 * @method void assignRole(string|array|\Spatie\Permission\Models\Role $role)
 * @method void syncRoles(array|\Spatie\Permission\Models\Role $roles)
 * @method bool hasPermissionTo(string|\Spatie\Permission\Models\Permission $permission, string|null $guardName = null)
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

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
     * Relationship: User is enrolled in many courses.
     */
    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'course_student');
    }

    /**
     * Relationship: User teaches many courses.
     */
    public function taughtCourses()
    {
        return $this->belongsToMany(Course::class, 'course_professor');
    }
}