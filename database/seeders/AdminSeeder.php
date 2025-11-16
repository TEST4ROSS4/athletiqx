<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // 🎓 Create or find the Admin role
        $role = Role::firstOrCreate(['name' => 'Admin']);

        // 🛡️ Assign only school-level permissions (already created in PermissionSeeder)
        $permissions = [
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            'courses.view',
            'courses.create',
            'courses.edit',
            'courses.delete',

            'sections.view',
            'sections.create',
            'sections.edit',
            'sections.delete',

            'course-sections.view',
            'course-sections.create',
            'course-sections.edit',
            'course-sections.delete',

            'class-schedules.view',
            'class-schedules.create',
            'class-schedules.edit',
            'class-schedules.delete',

            'professor-course-sections.view',
            'professor-course-sections.create',
            'professor-course-sections.edit',
            'professor-course-sections.delete',

            'student-course-sections.view',
            'student-course-sections.create',
            'student-course-sections.edit',
            'student-course-sections.delete',

            // ------------------------------------------------ ATHLETIC SIDE ------------------------------------------

            'sports.view',
            'sports.create',
            'sports.edit',
            'sports.delete',

            'sport-teams.view',
            'sport-teams.create',
            'sport-teams.edit',
            'sport-teams.delete',

            'coach-assignments.view',
            'coach-assignments.create',
            'coach-assignments.edit',
            'coach-assignments.delete',

            'student-sport-teams.create',
            'student-sport-teams.view',
            'student-sport-teams.edit',
            'student-sport-teams.delete',

            'programs.create',
            'programs.view',
            'programs.edit',
            'programs.delete',

            'programs.assignments.create',
            'programs.assignments.view',
            'programs.assignments.edit',

        ];

        // ✅ Assign permissions to the role
        $role->syncPermissions($permissions);

        // 👤 Create or find the school admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@fit.com'],
            [
                'name' => 'School Admin',
                'password' => bcrypt('admin'),
                'school_id' => 1,
            ]
        );

        // ✅ Assign the role to the user
        $user->assignRole($role);
    }
}
