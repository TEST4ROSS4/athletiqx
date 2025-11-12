<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'school_id',
        'name',
        'note',
    ];

    protected $casts = [
        'school_id' => 'integer',
        'created_by' => 'integer',
    ];

    protected $appends = ['is_assigned'];

    // 🔗 Relationships

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function exercises()
    {
        return $this->hasMany(ProgramExercise::class);
    }

    public function assignments()
    {
        return $this->hasMany(ProgramAssignment::class);
    }

    public function logs()
    {
        return $this->hasMany(ExerciseLog::class);
    }

    // ✅ Accessors

    public function getIsAssignedAttribute()
    {
        return $this->assignments()->exists();
    }

    // ✅ Scopes

    public function scopeLatestUpdated($query)
    {
        return $query->orderByDesc('updated_at');
    }

    public function scopeLatestCreated($query)
    {
        return $query->orderByDesc('created_at');
    }

    public function scopeFilterable($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->when($filters['status'] === 'assigned', fn ($q) => $q->has('assignments'))
                  ->when($filters['status'] === 'unassigned', fn ($q) => $q->doesntHave('assignments'));
        }

        if (isset($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['sort'])) {
            match ($filters['sort']) {
                'latest' => $query->orderByDesc('created_at'),
                'name' => $query->orderBy('name'),
                'exercises' => $query->orderByDesc('exercises_count'),
                default => $query->orderByDesc('created_at'),
            };
        } else {
            $query->orderByDesc('created_at');
        }

        return $query;
    }
}