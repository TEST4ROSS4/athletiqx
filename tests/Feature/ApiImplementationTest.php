<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\FileUpload;
use App\Models\EmailSubscription;
use App\Models\WellnessLog;
use App\Models\TrainingLog;
use App\Models\ComplianceAlert;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiImplementationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    // File Upload Tests
    public function test_file_upload_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->post('/api/trainings/test-id/proof', [
                'file' => 'test',
                'file_type' => 'image',
            ]);

        // Should fail validation but endpoint should exist
        $this->assertNotEquals(404, $response->status());
    }

    public function test_get_proofs_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->get('/api/trainings/test-id/proofs');

        $this->assertNotEquals(404, $response->status());
    }

    // Email Subscription Tests
    public function test_email_subscribe_endpoint_exists()
    {
        $response = $this->post('/api/newsletter/subscribe', [
            'email' => 'test@example.com',
        ]);

        $this->assertNotEquals(404, $response->status());
    }

    public function test_get_email_preferences_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->get('/api/newsletter/preferences');

        $this->assertNotEquals(404, $response->status());
    }

    // KPI Tests
    public function test_get_kpi_summary_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->get('/api/students/' . $this->user->id . '/kpis');

        $this->assertNotEquals(404, $response->status());
    }

    public function test_get_kpi_trends_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->get('/api/students/' . $this->user->id . '/kpis/trends');

        $this->assertNotEquals(404, $response->status());
    }

    // Wellness Tests
    public function test_log_wellness_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->post('/api/wellness/log', [
                'sleep_hours' => 8,
                'sleep_quality' => 8,
                'hydration_level' => 8,
                'mood' => 7,
                'energy_level' => 8,
                'recovery_soreness' => 3,
                'readiness_to_train' => 8,
            ]);

        $this->assertNotEquals(404, $response->status());
    }

    public function test_get_wellness_history_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->get('/api/wellness/history');

        $this->assertNotEquals(404, $response->status());
    }

    // Training Compliance Tests
    public function test_log_training_completion_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->post('/api/trainings/test-id/log-completion', [
                'sets_completed' => 3,
                'reps_completed' => 10,
                'weight_actual' => 185,
                'duration_actual' => 45,
            ]);

        $this->assertNotEquals(404, $response->status());
    }

    public function test_get_training_compliance_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->get('/api/trainings/test-id/compliance');

        $this->assertNotEquals(404, $response->status());
    }

    public function test_get_compliance_report_endpoint_exists()
    {
        $response = $this->actingAs($this->user)
            ->get('/api/students/' . $this->user->id . '/compliance-report');

        $this->assertNotEquals(404, $response->status());
    }

    // Database Migration Tests
    public function test_file_uploads_table_exists()
    {
        $this->assertTrue(\Schema::hasTable('file_uploads'));
    }

    public function test_email_subscriptions_table_exists()
    {
        $this->assertTrue(\Schema::hasTable('email_subscriptions'));
    }

    public function test_email_logs_table_exists()
    {
        $this->assertTrue(\Schema::hasTable('email_logs'));
    }

    public function test_kpi_logs_table_exists()
    {
        $this->assertTrue(\Schema::hasTable('kpi_logs'));
    }

    public function test_kpi_cache_table_exists()
    {
        $this->assertTrue(\Schema::hasTable('kpi_cache'));
    }

    public function test_wellness_logs_table_exists()
    {
        $this->assertTrue(\Schema::hasTable('wellness_logs'));
    }

    public function test_training_logs_table_exists()
    {
        $this->assertTrue(\Schema::hasTable('training_logs'));
    }

    public function test_compliance_alerts_table_exists()
    {
        $this->assertTrue(\Schema::hasTable('compliance_alerts'));
    }

    // Model Tests
    public function test_file_upload_model_can_be_created()
    {
        $fileUpload = FileUpload::create([
            'student_id' => $this->user->id,
            'file_url' => 'https://example.com/file.jpg',
            'file_type' => 'image',
            'file_size' => 1024,
            'file_name' => 'test.jpg',
        ]);

        $this->assertNotNull($fileUpload->id);
    }

    public function test_email_subscription_model_can_be_created()
    {
        $subscription = EmailSubscription::create([
            'email' => 'test@example.com',
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);

        $this->assertNotNull($subscription->id);
    }

    public function test_wellness_log_model_can_be_created()
    {
        $wellness = WellnessLog::create([
            'student_id' => $this->user->id,
            'sleep_hours' => 8,
            'sleep_quality' => 8,
            'hydration_level' => 8,
            'mood' => 7,
            'energy_level' => 8,
            'recovery_soreness' => 3,
            'readiness_to_train' => 8,
        ]);

        $this->assertNotNull($wellness->id);
    }

    public function test_training_log_model_can_be_created()
    {
        $trainingLog = TrainingLog::create([
            'training_id' => 'test-id',
            'student_id' => $this->user->id,
            'sets_assigned' => 3,
            'sets_completed' => 3,
            'reps_assigned' => 12,
            'reps_completed' => 10,
            'weight_assigned' => 185,
            'weight_actual' => 185,
            'duration_assigned' => 60,
            'duration_actual' => 45,
            'compliance_score' => 94.2,
        ]);

        $this->assertNotNull($trainingLog->id);
    }

    public function test_compliance_alert_model_can_be_created()
    {
        $alert = ComplianceAlert::create([
            'student_id' => $this->user->id,
            'training_id' => 'test-id',
            'alert_type' => 'low_compliance',
            'severity' => 'high',
            'message' => 'Test alert',
        ]);

        $this->assertNotNull($alert->id);
    }
}
