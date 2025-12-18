<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class ProfessorSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'Professor']);

        $permissions = [
            'news.view',
            'professor-course-sections.view',
            'student-course-sections.view',
            'scholarships.create',
            'scholarships.view',
            'scholarships.edit',
        ];

        $role->syncPermissions($permissions);
    }
}
