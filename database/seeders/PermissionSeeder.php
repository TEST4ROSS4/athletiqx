<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
            //USERS
            "users.create",
            "users.view",
            "users.edit",
            "users.delete",

            // ROLES
            "roles.create",
            "roles.view",
            "roles.edit",
            "roles.delete",

            //COURSES
            "courses.create",
            "courses.view",
            "courses.edit",
            "courses.delete",

            // SCHOOLS
            "schools.create",
            "schools.view",
            "schools.edit",
            "schools.delete",

        ];
        foreach ($permissions as $key => $value) {
            Permission::firstOrCreate(["name" => $value]);
        }
    }
}
