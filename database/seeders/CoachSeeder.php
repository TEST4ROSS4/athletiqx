<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class CoachSeeder extends Seeder
{
    public function run(): void
    {
        // 🎯 Ensure the Coach role exists
        $role = Role::firstOrCreate(['name' => 'Coach']);

        // ✅ Grant team-member management permissions
        $permissions = [
            'news.view',
            'student-sport-teams.view',
            'student-sport-teams.create',
            'student-sport-teams.edit',
            'student-sport-teams.delete',
            // Training programs
            'programs.view',
            'programs.create',
            'programs.edit',
            'programs.delete',
            'programs.assignments.view',
            'programs.assignments.create',
            'programs.assignments.edit',
            'exercise-logs.view',
        ];

        $role->syncPermissions($permissions);
    }
}
