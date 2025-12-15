<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TeamKpiCache extends Model
{
    use HasUuids;

    protected $table = 'team_kpi_cache';

    protected $fillable = [
        'sport_team_id',
        'date',
        'completion_rate',
        'compliance_score',
        'consistency_index',
        'performance_trend',
        'attendance_rate',
        'avg_session_duration',
        'total_members',
    ];

    protected $casts = [
        'date' => 'date',
        'updated_at' => 'datetime',
    ];

    public function sportTeam()
    {
        return $this->belongsTo(SportTeam::class, 'sport_team_id');
    }
}
