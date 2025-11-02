<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exercise_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('program_exercise_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_set_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('logged_at')->nullable();
            $table->json('metrics'); // e.g. { "reps": 10, "weight": 60 }
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercise_logs');
    }
};
