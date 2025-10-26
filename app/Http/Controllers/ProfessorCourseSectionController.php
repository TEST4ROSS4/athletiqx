<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\CourseSection;
use Illuminate\Support\Facades\Auth;
use App\Models\ProfessorCourseSection;

class ProfessorCourseSectionController extends Controller
{
    public function index()
    {
        $assignments = ProfessorCourseSection::with(['professor', 'courseSection.course', 'courseSection.section'])
            ->where('school_id', Auth::user()->school_id)
            ->get();

        return Inertia::render('AssignProfessorsPage/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function create()
    {
        $schoolId = Auth::user()->school_id;

        $professors = User::role('professor')
            ->where('school_id', $schoolId)
            ->select('id', 'name', 'email')
            ->get();

        $courseSections = CourseSection::with(['course', 'section'])
            ->where('school_id', $schoolId)
            ->get();

        return Inertia::render('AssignProfessorsPage/Add', [
            'professors' => $professors,
            'courseSections' => $courseSections,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professor_id' => 'required|exists:users,id',
            'course_section_id' => 'required|exists:course_section,id',
        ]);

        $schoolId = Auth::user()->school_id;

        ProfessorCourseSection::firstOrCreate([
            'professor_id' => $validated['professor_id'],
            'course_section_id' => $validated['course_section_id'],
            'school_id' => $schoolId,
        ]);

        return redirect()->route('professor-course-sections.index')->with('success', 'Professor assigned successfully.');
    }

    public function show(ProfessorCourseSection $professorCourseSection)
    {
        $this->authorizeSchoolAccess($professorCourseSection);

        return Inertia::render('AssignProfessorsPage/View', [
            'assignment' => $professorCourseSection->load(['professor', 'courseSection.course', 'courseSection.section']),
        ]);
    }

    public function edit(ProfessorCourseSection $professorCourseSection)
    {
        $this->authorizeSchoolAccess($professorCourseSection);

        $schoolId = Auth::user()->school_id;

        $professors = User::role('professor')
            ->where('school_id', $schoolId)
            ->select('id', 'name', 'email')
            ->get();

        $courseSections = CourseSection::with(['course', 'section'])
            ->where('school_id', $schoolId)
            ->get();

        return Inertia::render('AssignProfessorsPage/Edit', [
            'assignment' => $professorCourseSection,
            'professors' => $professors,
            'courseSections' => $courseSections,
        ]);
    }

    public function update(Request $request, ProfessorCourseSection $professorCourseSection)
    {
        $this->authorizeSchoolAccess($professorCourseSection);

        $validated = $request->validate([
            'professor_id' => 'required|exists:users,id',
            'course_section_id' => 'required|exists:course_section,id',
        ]);

        $professorCourseSection->update($validated);

        return redirect()->route('professor-course-sections.index')->with('success', 'Assignment updated successfully.');
    }

    public function destroy(ProfessorCourseSection $professorCourseSection)
    {
        $this->authorizeSchoolAccess($professorCourseSection);

        $professorCourseSection->delete();

        return redirect()->route('professor-course-sections.index')->with('success', 'Assignment removed successfully.');
    }

    protected function authorizeSchoolAccess(ProfessorCourseSection $assignment)
    {
        if ($assignment->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to assignment.');
        }
    }
}