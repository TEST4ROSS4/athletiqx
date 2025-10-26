<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('student_course_section', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_section_id')->constrained('course_section')->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->decimal('final_grade', 5, 2)->nullable();
            $table->decimal('attendance_rate', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'course_section_id'], 'student_course_section_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_course_section');
    }
};