<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ Create or find the super_admin role
        $role = Role::firstOrCreate(['name' => 'super_admin']);

        // ✅ Create or find the super admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@athletiqx.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('admin'),
                'school_id' => null,
            ]
        );

        // ✅ Assign the role to the user
        $user->assignRole($role);

        // ✅ Define all permissions for super_admin
        $permissions = [
            // School module
            'schools.view',
            'schools.create',
            'schools.edit',
            'schools.delete',

            // School Admin module
            'school-admins.view',
            'school-admins.create',
            'school-admins.edit',
            'school-admins.delete',
        ];

        // ✅ Assign permissions to the role
        $role->syncPermissions($permissions);
    }
}