<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('professor_course_section', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_section_id')->constrained('course_section')->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['professor_id', 'course_section_id'], 'prof_course_section_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professor_course_section');
    }
};