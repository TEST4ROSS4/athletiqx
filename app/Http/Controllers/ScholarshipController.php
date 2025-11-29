<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Models\StudentCourseSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScholarshipController extends Controller
{
    /**
     * Entry point: /scholarships
     * Branches to Admin, Professor, or Student view depending on role/permissions.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $schoolId = $user->school_id;

        // Admins → Scholarship Settings form
        if ($user->hasRole('Admin') && $user->can('scholarships.edit')) {
            $setting = Scholarship::where('school_id', $schoolId)->first();

            return inertia('ScholarshipsPage/Index', [
                'setting' => $setting,
            ]);
        }

        // Professors → Eligibility table with their taught course sections
        if ($user->hasRole('Professor') && $user->can('scholarships.view')) {
            $sections = $user->taughtCourseSections()->with('course', 'section')->get();

            return inertia('ScholarshipsPage/Eligibility', [
                'students'       => [],
                'courseSections' => $sections,
                'courseSection'  => null,
            ]);
        }

        // Students → Scholarship status view based on enrolled course sections
        if ($user->hasRole('Student') && $user->can('scholarships.view')) {
            $setting = Scholarship::where('school_id', $schoolId)->first();

            // Get all enrolled course sections with course + section info
            $enrollments = StudentCourseSection::where('student_id', $user->id)
                ->with(['courseSection.course', 'courseSection.section'])
                ->get();

            $results = $enrollments->map(function ($enrollment) use ($setting) {
                $eligible = false;
                if ($setting && $enrollment->final_grade !== null) {
                    $eligible = $enrollment->final_grade >= $setting->min_grade_percentage;
                }

                return [
                    'id'          => $enrollment->id,
                    'course'      => [
                        'title' => $enrollment->courseSection->course->title ?? 'Unknown',
                        'code'  => $enrollment->courseSection->course->code ?? 'Unknown',
                    ],
                    'section'     => ['code' => $enrollment->courseSection->section->code ?? 'Unknown'],
                    'units'       => $enrollment->courseSection->units ?? 0,
                    'final_grade' => $enrollment->final_grade,
                    'eligible'    => $eligible,
                ];
            });

            // Compute GWA (exclude subjects with 0 units)
            $validEnrollments = $enrollments->filter(function ($e) {
                return $e->final_grade !== null && $e->courseSection->units > 0;
            });

            $totalUnits = $validEnrollments->sum(fn($e) => $e->courseSection->units);
            $weightedSum = $validEnrollments->sum(fn($e) => $e->final_grade * $e->courseSection->units);

            $gwa = $totalUnits > 0 ? round($weightedSum / $totalUnits, 2) : null;

            $overallEligible = $gwa !== null && $setting && $gwa >= $setting->min_grade_percentage;

            return inertia('ScholarshipsPage/StudentView', [
                'minGrade'       => $setting?->min_grade_percentage ?? 0,
                'studentName'    => $user->name,
                'enrollments'    => $results,
                'gwa'            => $gwa ?? '—',
                'overallEligible' => $overallEligible,
            ]);
        }

        abort(403, 'Unauthorized');
    }

    /**
     * Admin: Store or update scholarship minimum grade.
     */
    public function save(Request $request)
    {
        $request->validate([
            'min_grade_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $schoolId = Auth::user()->school_id;

        Scholarship::updateOrCreate(
            ['school_id' => $schoolId],
            ['min_grade_percentage' => $request->min_grade_percentage]
        );

        return redirect()
            ->route('scholarships.index')
            ->with('success', 'Scholarship setting saved successfully.');
    }

    /**
     * Professor: Bulk eligibility check for all students in a course_section.
     */
    public function checkEligibilityForCourseSection($courseSectionId)
    {
        $students = StudentCourseSection::where('course_section_id', $courseSectionId)
            ->with('student')
            ->get();

        $schoolId = Auth::user()->school_id;
        $setting = Scholarship::where('school_id', $schoolId)->first();

        $results = $students->map(function ($enrollment) use ($setting) {
            $eligible = false;
            if ($setting && $enrollment->final_grade !== null) {
                $eligible = $enrollment->final_grade >= $setting->min_grade_percentage;
            }

            return [
                'id'          => $enrollment->id, // pivot row id
                'student_id'  => $enrollment->student_id,
                'name'        => $enrollment->student->name ?? 'Unknown',
                'final_grade' => $enrollment->final_grade,
                'eligible'    => $eligible,
            ];
        });

        return inertia('ScholarshipsPage/Eligibility', [
            'students'       => $results,
            'courseSections' => Auth::user()->taughtCourseSections()->with('course', 'section')->get(),
            'courseSection'  => $courseSectionId,
        ]);
    }

    /**
     * Professor: Update a student's final grade.
     */
    public function updateStudentGrade(Request $request, $id)
    {
        $request->validate([
            'final_grade' => 'nullable|numeric|min:0|max:100',
        ]);

        $enrollment = StudentCourseSection::findOrFail($id);
        $enrollment->final_grade = $request->final_grade;
        $enrollment->save();

        return back()->with('success', 'Final grade updated.');
    }
}
