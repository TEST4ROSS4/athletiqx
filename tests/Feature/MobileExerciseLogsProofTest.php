<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Program;
use App\Models\ProgramExercise;
use App\Models\ExerciseSet;
use App\Models\ProgramAssignment;
use App\Models\ExerciseLog;
use App\Models\School;

class MobileExerciseLogsProofTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_store_persists_proof_fields_without_overwriting_when_missing()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $school = School::create([
            'name' => 'Test School',
            'code' => 'TEST',
            'address' => '123',
            'active' => true,
        ]);

        $program = Program::create([
            'created_by' => $user->id,
            'school_id' => $school->id,
            'name' => 'Test Program',
        ]);

        $exercise = ProgramExercise::create([
            'program_id' => $program->id,
            'name' => 'Squat',
            'order' => 1,
        ]);

        $set = ExerciseSet::create([
            'program_exercise_id' => $exercise->id,
            'order' => 1,
            'fields' => [['name' => 'reps'], ['name' => 'weight']],
            'suggested_values' => [['value' => '10', 'unit' => ''], ['value' => '60', 'unit' => 'kg']],
        ]);

        $assignment = ProgramAssignment::create([
            'program_id' => $program->id,
            'student_id' => $user->id,
            'assigned_by' => $user->id,
            'status' => 'Assigned',
            'assigned_at' => now(),
        ]);

        $payload = [
            'logs' => [[
                'set_id' => $set->id,
                'inputs' => ['reps' => '12', 'weight' => '70'],
                'marked_as_done' => true,
                'proof_url' => 'http://example.com/proofs/test.jpg',
                'proof_name' => 'test.jpg',
                'proof_size' => 123456,
            ]],
        ];

        $response = $this->postJson("/api/exercise-logs/{$assignment->id}", $payload);
        $response->assertStatus(200);

        $log = ExerciseLog::where('assignment_id', $assignment->id)
            ->where('set_id', $set->id)
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals('http://example.com/proofs/test.jpg', $log->proof_url);
        $this->assertEquals('test.jpg', $log->proof_name);
        $this->assertEquals(123456, $log->proof_size);
        $this->assertTrue($log->marked_as_done);

        $payloadWithoutProof = [
            'logs' => [[
                'set_id' => $set->id,
                'inputs' => ['reps' => '15', 'weight' => '75'],
                'marked_as_done' => true,
            ]],
        ];

        $response2 = $this->postJson("/api/exercise-logs/{$assignment->id}", $payloadWithoutProof);
        $response2->assertStatus(200);

        $log->refresh();
        $this->assertEquals('http://example.com/proofs/test.jpg', $log->proof_url);
        $this->assertEquals('test.jpg', $log->proof_name);
        $this->assertEquals(123456, $log->proof_size);
    }
}
