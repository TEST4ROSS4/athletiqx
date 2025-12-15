<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wellness_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('student_id');
            $table->decimal('sleep_hours', 3, 1);
            $table->integer('sleep_quality');
            $table->string('nutrition_status', 50)->nullable();
            $table->integer('hydration_level');
            $table->string('injury_status', 255)->nullable();
            $table->integer('injury_severity')->nullable();
            $table->integer('mood');
            $table->integer('energy_level');
            $table->integer('recovery_soreness');
            $table->integer('readiness_to_train');
            $table->text('notes')->nullable();
            $table->timestamp('logged_at')->useCurrent();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('student_id');
            $table->index('logged_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wellness_logs');
    }
};
