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
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('semester');
            $table->string('school_year'); 
            $table->string('program'); 
            $table->boolean('status')->default(true); 
            $table->timestamps();

            $table->unique(['code', 'semester', 'school_year', 'program']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
