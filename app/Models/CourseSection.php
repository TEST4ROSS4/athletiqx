<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CourseSection extends Model
{
    use HasFactory;

    protected $table = 'course_section';

    protected $fillable = [
        'course_id',
        'section_id',
        'term',
        'units',
        'school_id',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
        'school_id' => 'integer',
    ];

    // 🔗 Relationships

    /**
     * @return BelongsTo<Course,CourseSection>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @return BelongsTo<Section,CourseSection>
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * @return HasOne<ClassSchedule>
     */
    public function classSchedule(): HasOne
    {
        return $this->hasOne(ClassSchedule::class);
    }

    /**
     * @return BelongsTo<School,CourseSection>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return HasMany<ProfessorCourseSection>
     */
    public function professorAssignments(): HasMany
    {
        return $this->hasMany(ProfessorCourseSection::class);
    }

    /**
     * @return HasMany<StudentCourseSection>
     */
    public function studentEnrollments(): HasMany
    {
        return $this->hasMany(StudentCourseSection::class);
    }

    /**
     * Professors assigned to this course section.
     *
     * @return BelongsToMany<User>
     */
    public function professors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'professor_course_section', 'course_section_id', 'professor_id')
            ->withPivot('school_id')
            ->withTimestamps();
    }

    /**
     * Students enrolled in this course section.
     *
     * @return BelongsToMany<User>
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_course_section', 'course_section_id', 'student_id')
            ->withPivot(['school_id', 'final_grade', 'attendance_rate'])
            ->withTimestamps();
    }

    // 🔍 Scopes for lifecycle filtering

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
}