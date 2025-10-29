<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('coach_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('sport_id')->nullable()->constrained('sports')->cascadeOnDelete();
            $table->foreignId('sport_team_id')->nullable()->constrained('sport_teams')->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            // Enforce mutual exclusivity at application level
            $table->unique(['coach_id', 'sport_id'], 'coach_sport_unique');
            $table->unique(['coach_id', 'sport_team_id'], 'coach_team_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coach_assignments');
    }
};