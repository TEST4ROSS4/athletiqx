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
        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@fit.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('admin'), // Change this as needed
            ]
        );

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Assign all existing permissions to admin role
        $adminRole->syncPermissions(Permission::all());

        // Assign role to user
        $admin->assignRole($adminRole);
    }
}