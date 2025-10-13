<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // 🎓 Create or find the school-admin role
        $role = Role::firstOrCreate(['name' => 'school-admin']);

        // 🛡️ Define permissions for school admins
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
            // Add more as needed
        ];

        foreach ($permissions as $name) {
            $permission = Permission::firstOrCreate(['name' => $name]);
            $role->givePermissionTo($permission);
        }

        // 👤 Optionally create a school admin user (if needed)
        $user = User::firstOrCreate(
            ['email' => 'admin@school.edu'],
            [
                'name' => 'School Admin',
                'password' => bcrypt('securepassword'),
                'school_id' => 1, // or dynamically assign
            ]
        );

        $user->assignRole($role);
    }
}