<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kpi_cache', function (Blueprint $table) {
            if (!Schema::hasColumn('kpi_cache', 'created_at')) {
                $table->timestamp('created_at')->nullable()->after('avg_session_duration');
            }
        });
    }

    public function down(): void
    {
        Schema::table('kpi_cache', function (Blueprint $table) {
            if (Schema::hasColumn('kpi_cache', 'created_at')) {
                $table->dropColumn('created_at');
            }
        });
    }
};
