<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

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

        // ✅ Define School module permissions
        $permissions = [
            'schools.view',
            'schools.create',
            'schools.edit',
            'schools.delete',
        ];

        $role->syncPermissions($permissions);

    }
}
