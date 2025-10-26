<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\CourseSection;
use Illuminate\Support\Facades\Auth;
use App\Models\StudentCourseSection;

class StudentCourseSectionController extends Controller
{
    public function index()
    {
        $assignments = StudentCourseSection::with(['student', 'courseSection.course', 'courseSection.section'])
            ->where('school_id', Auth::user()->school_id)
            ->get();

        return Inertia::render('EnrollStudentsPage/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function create()
    {
        $schoolId = Auth::user()->school_id;

        $students = User::role('student')
            ->where('school_id', $schoolId)
            ->select('id', 'name', 'email')
            ->get();

        $courseSections = CourseSection::with(['course', 'section'])
            ->where('school_id', $schoolId)
            ->get();

        return Inertia::render('EnrollStudentsPage/Add', [
            'students' => $students,
            'courseSections' => $courseSections,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_section_id' => 'required|exists:course_section,id',
        ]);

        $schoolId = Auth::user()->school_id;

        StudentCourseSection::firstOrCreate([
            'student_id' => $validated['student_id'],
            'course_section_id' => $validated['course_section_id'],
            'school_id' => $schoolId,
        ]);

        return redirect()->route('student-course-sections.index')->with('success', 'Student assigned successfully.');
    }

    public function show(StudentCourseSection $studentCourseSection)
    {
        $this->authorizeSchoolAccess($studentCourseSection);

        return Inertia::render('EnrollStudentsPage/View', [
            'assignment' => $studentCourseSection->load(['student', 'courseSection.course', 'courseSection.section']),
        ]);
    }

    public function edit(StudentCourseSection $studentCourseSection)
    {
        $this->authorizeSchoolAccess($studentCourseSection);

        $schoolId = Auth::user()->school_id;

        $students = User::role('student')
            ->where('school_id', $schoolId)
            ->select('id', 'name', 'email')
            ->get();

        $courseSections = CourseSection::with(['course', 'section'])
            ->where('school_id', $schoolId)
            ->get();

        return Inertia::render('EnrollStudentsPage/Edit', [
            'assignment' => $studentCourseSection,
            'students' => $students,
            'courseSections' => $courseSections,
        ]);
    }

    public function update(Request $request, StudentCourseSection $studentCourseSection)
    {
        $this->authorizeSchoolAccess($studentCourseSection);

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_section_id' => 'required|exists:course_section,id',
        ]);

        $studentCourseSection->update($validated);

        return redirect()->route('student-course-sections.index')->with('success', 'Assignment updated successfully.');
    }

    public function destroy(StudentCourseSection $studentCourseSection)
    {
        $this->authorizeSchoolAccess($studentCourseSection);

        $studentCourseSection->delete();

        return redirect()->route('student-course-sections.index')->with('success', 'Assignment removed successfully.');
    }

    protected function authorizeSchoolAccess(StudentCourseSection $assignment)
    {
        if ($assignment->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to assignment.');
        }
    }
}