<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('student_sport_team', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('sport_team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('status')->nullable();
            $table->string('position')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'sport_team_id'], 'student_sport_team_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_sport_team');
    }
};