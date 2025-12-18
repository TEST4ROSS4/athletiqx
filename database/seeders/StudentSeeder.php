<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'Student']);

        $permissions = [
            'news.view',
            'student-course-sections.view',
            'programs.assignments.view',
            'exercise-logs.create',
            'exercise-logs.view',
            'exercise-logs.edit',
            'exercise-logs.delete',
            'scholarships.view',
        ];

        $role->syncPermissions($permissions);
    }
}
