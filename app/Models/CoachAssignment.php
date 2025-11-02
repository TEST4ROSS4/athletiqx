<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CoachAssignment extends Model
{
    use HasFactory;

    protected $table = 'coach_assignments';

    protected $fillable = [
        'coach_id',
        'sport_id',
        'sport_team_id',
        'school_id',
    ];

    protected $casts = [
        'school_id' => 'integer',
    ];

    // 🔗 Relationships
    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function sport()
    {
        return $this->belongsTo(Sport::class);
    }

    public function sportTeam()
    {
        return $this->belongsTo(SportTeam::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}