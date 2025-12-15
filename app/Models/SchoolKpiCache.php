<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SchoolKpiCache extends Model
{
    use HasUuids;

    protected $table = 'school_kpi_cache';

    protected $fillable = [
        'school_id',
        'date',
        'completion_rate',
        'compliance_score',
        'consistency_index',
        'performance_trend',
        'attendance_rate',
        'avg_session_duration',
        'total_students',
        'total_teams',
    ];

    protected $casts = [
        'date' => 'date',
        'updated_at' => 'datetime',
    ];

    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }
}
