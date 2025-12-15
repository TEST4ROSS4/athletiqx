<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpi_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('student_id');
            $table->uuid('training_id')->nullable();
            $table->integer('sets_assigned');
            $table->integer('sets_completed');
            $table->integer('reps_assigned');
            $table->integer('reps_completed');
            $table->decimal('weight_assigned', 8, 2);
            $table->decimal('weight_actual', 8, 2);
            $table->integer('duration_assigned');
            $table->integer('duration_actual');
            $table->decimal('compliance_score', 5, 2);
            $table->timestamp('logged_at')->useCurrent();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('student_id');
            $table->index('training_id');
            $table->index('logged_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_logs');
    }
};
