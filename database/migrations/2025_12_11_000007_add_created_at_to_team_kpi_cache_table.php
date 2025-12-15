<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('team_kpi_cache', function (Blueprint $table) {
            $table->timestamp('created_at')->useCurrent()->after('date');
        });
    }

    public function down(): void
    {
        Schema::table('team_kpi_cache', function (Blueprint $table) {
            $table->dropColumn('created_at');
        });
    }
};
