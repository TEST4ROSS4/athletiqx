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
        Schema::create('metric_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. 'weight', 'duration'
            $table->enum('comparison', ['higher_is_better', 'lower_is_better']);
            $table->string('unit')->nullable(); // e.g. 'kg', 'seconds'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metric_definitions');
    }
};
