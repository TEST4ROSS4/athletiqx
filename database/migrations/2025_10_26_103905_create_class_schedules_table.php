<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('class_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_section_id')->unique()->constrained('course_section')->cascadeOnDelete(); 
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('days');       
            $table->string('time');       
            $table->string('room');       
            $table->timestamps();

            // Prevent overlapping room assignments
            $table->unique(['days', 'time', 'room'], 'room_schedule_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_schedules');
    }
};