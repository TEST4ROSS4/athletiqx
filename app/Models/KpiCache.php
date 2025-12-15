<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class KpiCache extends Model
{
    use HasUuids;

    protected $table = 'kpi_cache';

    protected $fillable = [
        'student_id',
        'date',
        'completion_rate',
        'compliance_score',
        'consistency_index',
        'performance_trend',
        'attendance_rate',
        'avg_session_duration',
    ];

    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
