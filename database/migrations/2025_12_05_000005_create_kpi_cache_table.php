<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpi_cache', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('student_id');
            $table->date('date');
            $table->decimal('completion_rate', 5, 2)->nullable();
            $table->decimal('compliance_score', 5, 2)->nullable();
            $table->decimal('consistency_index', 5, 2)->nullable();
            $table->decimal('performance_trend', 5, 2)->nullable();
            $table->decimal('attendance_rate', 5, 2)->nullable();
            $table->integer('avg_session_duration')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'date']);

            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('student_id');
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_cache');
    }
};
