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
        Schema::create('personal_bests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('program_exercise_id')->constrained()->cascadeOnDelete();
            $table->string('metric'); // e.g. 'weight', 'reps'
            $table->float('value');
            $table->timestamp('logged_at')->nullable();
            $table->foreignId('source_log_id')->nullable()->constrained('exercise_logs')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_bests');
    }
};
