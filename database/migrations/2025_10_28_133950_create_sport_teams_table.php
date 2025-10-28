<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sport_teams', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('season'); 
            $table->boolean('is_official')->default(true);
            $table->foreignId('sport_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sport_teams');
    }
};