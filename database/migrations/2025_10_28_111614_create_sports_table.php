<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sports', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. Basketball
            $table->string('category')->nullable(); // e.g. Team, Individual
            $table->enum('gender', ['male', 'female', 'mixed'])->default('mixed');
            $table->boolean('is_active')->default(true);
            $table->enum('division', ['junior', 'senior'])->default('senior');
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sports');
    }
};