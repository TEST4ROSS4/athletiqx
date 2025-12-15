<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_kpi_cache', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('sport_team_id');
            $table->date('date');
            $table->decimal('completion_rate', 5, 2)->nullable();
            $table->decimal('compliance_score', 5, 2)->nullable();
            $table->decimal('consistency_index', 5, 2)->nullable();
            $table->decimal('performance_trend', 5, 2)->nullable();
            $table->decimal('attendance_rate', 5, 2)->nullable();
            $table->integer('avg_session_duration')->nullable();
            $table->integer('total_members')->default(0);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->unique(['sport_team_id', 'date']);

            $table->foreign('sport_team_id')->references('id')->on('sport_teams')->onDelete('cascade');
            $table->index('sport_team_id');
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_kpi_cache');
    }
};
