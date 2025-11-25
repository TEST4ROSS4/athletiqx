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
            $table->foreignId('assignment_id')->constrained('program_assignments')->cascadeOnDelete();
            $table->foreignId('set_id')->constrained('exercise_sets')->cascadeOnDelete();
            $table->json('inputs')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('marked_as_done')->default(false);
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
