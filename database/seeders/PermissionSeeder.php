<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // USERS
            ['name' => 'users.create', 'module' => 'school'],
            ['name' => 'users.view', 'module' => 'school'],
            ['name' => 'users.edit', 'module' => 'school'],
            ['name' => 'users.delete', 'module' => 'school'],

            // COURSES
            ['name' => 'courses.create', 'module' => 'school'],
            ['name' => 'courses.view', 'module' => 'school'],
            ['name' => 'courses.edit', 'module' => 'school'],
            ['name' => 'courses.delete', 'module' => 'school'],

            // SECTIONS
            ['name' => 'sections.create', 'module' => 'school'],
            ['name' => 'sections.view', 'module' => 'school'],
            ['name' => 'sections.edit', 'module' => 'school'],
            ['name' => 'sections.delete', 'module' => 'school'],
            // -------------------------------------- SCHOOL ADMIN ONLY --------------------------------------

            // ROLES
            ['name' => 'roles.create', 'module' => 'school-admin'],
            ['name' => 'roles.view', 'module' => 'school-admin'],
            ['name' => 'roles.edit', 'module' => 'school-admin'],
            ['name' => 'roles.delete', 'module' => 'school-admin'],


            // -------------------------------------- SUPER ADMIN ONLY --------------------------------------

            // SCHOOLS 
            ['name' => 'schools.create', 'module' => 'super'],
            ['name' => 'schools.view', 'module' => 'super'],
            ['name' => 'schools.edit', 'module' => 'super'],
            ['name' => 'schools.delete', 'module' => 'super'],

            // SCHOOL ADMINS
            ['name' => 'school-admins.create', 'module' => 'super'],
            ['name' => 'school-admins.view', 'module' => 'super'],
            ['name' => 'school-admins.edit', 'module' => 'super'],
            ['name' => 'school-admins.delete', 'module' => 'super'],
        ];

        foreach ($permissions as $item) {
            Permission::updateOrCreate(
                ['name' => $item['name']],
                ['guard_name' => 'web', 'module' => $item['module']]
            );
        }
    }
}
