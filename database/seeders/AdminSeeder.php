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
        ];

        // ✅ Assign permissions to the role
        $role->syncPermissions($permissions);

        // 👤 Create or find the school admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@fit.edu'],
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