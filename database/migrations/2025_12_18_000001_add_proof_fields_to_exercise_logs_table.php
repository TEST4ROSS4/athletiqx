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
        Schema::table('exercise_logs', function (Blueprint $table) {
            $table->string('proof_url')->nullable()->after('inputs');
            $table->string('proof_name')->nullable()->after('proof_url');
            $table->unsignedBigInteger('proof_size')->nullable()->after('proof_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exercise_logs', function (Blueprint $table) {
            $table->dropColumn(['proof_url', 'proof_name', 'proof_size']);
        });
    }
};
