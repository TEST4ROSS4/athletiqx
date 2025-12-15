<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Program;
use App\Models\School;
use App\Models\TrainingLog;
use App\Models\KpiCache;
use App\Models\WellnessLog;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class KpiTestDataSeeder extends Seeder
{
    public function run()
    {
        // Get the student user (ID 4 from TestAccountsSeeder)
        $student = User::find(4);
        
        if (!$student) {
            $this->command->error('Student user not found. Please run TestAccountsSeeder first.');
            return;
        }

        $this->command->info('Seeding KPI test data for student: ' . $student->name);

        // Create test programs
        $programs = $this->seedPrograms();

        // Seed training logs for the last 30 days
        $this->seedTrainingLogs($student, $programs);

        // Seed KPI cache data
        $this->seedKpiCache($student);

        // Seed wellness logs
        $this->seedWellnessLogs($student);

        $this->command->info('KPI test data seeded successfully!');
    }

    private function seedPrograms()
    {
        $this->command->line('Creating test programs...');

        $school = School::first();
        $coach = User::where('email', 'coach@test.com')->first();

        if (!$school || !$coach) {
            $this->command->warn('School or Coach not found. Creating with defaults.');
            $school = $school ?? School::first() ?? School::create(['name' => 'Test School']);
            $coach = $coach ?? User::first();
        }

        $programs = [];
        $programNames = ['Strength Training', 'Cardio Program', 'Flexibility & Recovery', 'HIIT Workout'];

        foreach ($programNames as $name) {
            $programs[] = Program::firstOrCreate(
                ['name' => $name, 'school_id' => $school->id],
                [
                    'created_by' => $coach->id,
                    'note' => 'Test program for KPI tracking',
                ]
            );
        }

        $this->command->line('Created ' . count($programs) . ' programs');
        return $programs;
    }

    private function seedTrainingLogs(User $student, $programs)
    {
        $this->command->line('Seeding training logs...');

        $count = 0;
        // Create training logs for the last 30 days
        for ($i = 0; $i < 30; $i++) {
            $date = Carbon::now()->subDays($i);

            // Skip some days to make it realistic (not every day has training)
            if ($i % 3 == 0) {
                continue;
            }

            // Create 1-2 training logs per training day
            $logsPerDay = rand(1, 2);
            for ($j = 0; $j < $logsPerDay; $j++) {
                $program = $programs[array_rand($programs)];
                
                TrainingLog::create([
                    'training_id' => $program->id,
                    'student_id' => $student->id,
                    'sets_assigned' => rand(3, 5),
                    'sets_completed' => rand(2, 5),
                    'reps_assigned' => rand(8, 12),
                    'reps_completed' => rand(6, 12),
                    'weight_assigned' => rand(100, 300),
                    'weight_actual' => rand(90, 300),
                    'duration_assigned' => rand(30, 60),
                    'duration_actual' => rand(25, 65),
                    'compliance_score' => rand(70, 100),
                    'variance_percentage' => rand(-15, 15),
                    'notes' => 'Training session completed',
                    'logged_at' => $date->copy()->addHours(rand(6, 18))->addMinutes(rand(0, 59)),
                ]);
                $count++;
            }
        }

        $this->command->line('Created ' . $count . ' training logs');
    }

    private function seedKpiCache(User $student)
    {
        $this->command->line('Seeding KPI cache data...');

        // Create KPI cache for the last 7 days
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::now()->subDays($i)->toDateString();

            KpiCache::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'date' => $date,
                ],
                [
                    'completion_rate' => rand(75, 98),
                    'compliance_score' => rand(80, 100),
                    'consistency_index' => rand(60, 100),
                    'performance_trend' => rand(-10, 15),
                    'attendance_rate' => rand(85, 100),
                    'avg_session_duration' => rand(35, 55),
                ]
            );
        }

        $this->command->line('Created KPI cache entries');
    }

    private function seedWellnessLogs(User $student)
    {
        $this->command->line('Seeding wellness logs...');

        // Create wellness logs for the last 14 days
        for ($i = 0; $i < 14; $i++) {
            $date = Carbon::now()->subDays($i);

            WellnessLog::create([
                'student_id' => $student->id,
                'sleep_hours' => rand(6, 9),
                'sleep_quality' => rand(5, 10),
                'nutrition_status' => rand(1, 10),
                'hydration_level' => rand(5, 10),
                'injury_status' => 'None',
                'injury_severity' => 0,
                'mood' => rand(1, 10),
                'energy_level' => rand(3, 10),
                'recovery_soreness' => rand(1, 8),
                'readiness_to_train' => rand(5, 10),
                'notes' => 'Daily wellness check-in',
                'logged_at' => $date->copy()->addHours(rand(20, 23))->addMinutes(rand(0, 59)),
            ]);
        }

        $this->command->line('Created ' . WellnessLog::where('student_id', $student->id)->count() . ' wellness logs');
    }
}
