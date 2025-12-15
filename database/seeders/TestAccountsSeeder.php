<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Sport;
use App\Models\SportTeam;
use App\Models\CoachAssignment;
use App\Models\StudentSportTeam;
use Spatie\Permission\Models\Role;

class TestAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $schoolId = 1;

        // Get or create roles
        $studentRole = Role::firstOrCreate(['name' => 'Student']);
        $coachRole = Role::firstOrCreate(['name' => 'Coach']);
        $professorRole = Role::firstOrCreate(['name' => 'Professor']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);

        // 1. Student Account
        $student = User::firstOrCreate(
            ['email' => 'student@test.com'],
            [
                'name' => 'John Athlete',
                'password' => bcrypt('password'),
                'school_id' => $schoolId,
            ]
        );
        $student->assignRole($studentRole);

        // 1b. Second Student Account (team member)
        $student2 = User::firstOrCreate(
            ['email' => 'athlete2@test.com'],
            [
                'name' => 'Jane Teammate',
                'password' => bcrypt('password'),
                'school_id' => $schoolId,
            ]
        );
        $student2->assignRole($studentRole);

        // 2. Coach Account
        $coach = User::firstOrCreate(
            ['email' => 'coach@test.com'],
            [
                'name' => 'Sarah Coach',
                'password' => bcrypt('password'),
                'school_id' => $schoolId,
            ]
        );
        $coach->assignRole($coachRole);

        // 3. Professor Account
        $professor = User::firstOrCreate(
            ['email' => 'professor@test.com'],
            [
                'name' => 'Dr. Academic',
                'password' => bcrypt('password'),
                'school_id' => $schoolId,
            ]
        );
        $professor->assignRole($professorRole);

        // 4. School Admin Account
        $schoolAdmin = User::firstOrCreate(
            ['email' => 'schooladmin@test.com'],
            [
                'name' => 'Admin School',
                'password' => bcrypt('password'),
                'school_id' => $schoolId,
            ]
        );
        $schoolAdmin->assignRole($adminRole);

        // 5. Super Admin (already exists, but ensure it's set up)
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@athletiqx.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('admin'),
                'school_id' => null,
            ]
        );
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->assignRole($superAdminRole);

        // 🏀 Sport, Team, and Assignments
        $basketball = Sport::firstOrCreate(
            ['name' => 'Basketball'],
            [
                'category' => 'Team',
                'gender' => 'male',
                'is_active' => true,
                'division' => 'senior',
                'school_id' => $schoolId,
            ]
        );

        $team = SportTeam::firstOrCreate(
            [
                'name' => 'Tamaraws Basketball',
                'sport_id' => $basketball->id,
                'school_id' => $schoolId,
            ],
            [
                'season' => '2025',
                'is_official' => true,
            ]
        );

        CoachAssignment::firstOrCreate(
            [
                'coach_id' => $coach->id,
                'sport_team_id' => $team->id,
            ],
            [
                'sport_id' => $basketball->id,
                'school_id' => $schoolId,
            ]
        );

        StudentSportTeam::firstOrCreate(
            [
                'student_id' => $student->id,
                'sport_team_id' => $team->id,
            ],
            [
                'school_id' => $schoolId,
                'status' => 'active',
                'position' => 'Guard',
            ]
        );

        StudentSportTeam::firstOrCreate(
            [
                'student_id' => $student2->id,
                'sport_team_id' => $team->id,
            ],
            [
                'school_id' => $schoolId,
                'status' => 'active',
                'position' => 'Forward',
            ]
        );
    }
}
