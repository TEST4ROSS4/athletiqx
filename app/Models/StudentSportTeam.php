<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentSportTeam extends Model
{
    use HasFactory;

    protected $table = 'student_sport_team';

    protected $fillable = [
        'student_id',
        'sport_team_id',
        'school_id',
        'status',
        'position',
    ];

    protected $casts = [
        'school_id' => 'integer',
    ];

    // 🔗 Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
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