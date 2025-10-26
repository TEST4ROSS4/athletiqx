<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\CourseSection;
use App\Models\Course;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseSectionController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created');

        $courseSections = CourseSection::with(['course', 'section', 'classSchedule']) // ✅ include schedule
            ->where('school_id', Auth::user()->school_id)
            ->when($sort === 'alpha', fn($q) => $q->orderBy('term'))
            ->when($sort === 'created', fn($q) => $q->orderBy('id'))
            ->get();

        return Inertia::render('CourseSectionPage/Index', [
            'courseSections' => $courseSections,
            'sort' => $sort,
        ]);
    }

    public function create()
    {
        $courses = Course::where('school_id', Auth::user()->school_id)->get();
        $sections = Section::where('school_id', Auth::user()->school_id)->get();

        return Inertia::render('CourseSectionPage/Add', [
            'courses' => $courses,
            'sections' => $sections,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'section_id' => 'required|exists:sections,id',
            'term' => 'required|string|max:100',
            'units' => 'required|integer|min:0|max:10', 
        ]);

        CourseSection::create([
            ...$validated,
            'school_id' => Auth::user()->school_id,
            'status' => 'upcoming',
        ]);

        return redirect()->route('course-sections.index')->with('success', 'Course section created successfully.');
    }

    public function show(CourseSection $courseSection)
    {
        $this->authorizeSchoolAccess($courseSection);

        return Inertia::render('CourseSectionPage/View', [
            'courseSection' => $courseSection->load(['course', 'section', 'classSchedule']), 
        ]);
    }

    public function edit(CourseSection $courseSection)
    {
        $this->authorizeSchoolAccess($courseSection);

        $courses = Course::where('school_id', Auth::user()->school_id)->get();
        $sections = Section::where('school_id', Auth::user()->school_id)->get();

        return Inertia::render('CourseSectionPage/Edit', [
            'courseSection' => $courseSection->load('classSchedule'), 
            'courses' => $courses,
            'sections' => $sections,
        ]);
    }

    public function update(Request $request, CourseSection $courseSection)
    {
        $this->authorizeSchoolAccess($courseSection);

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'section_id' => 'required|exists:sections,id',
            'term' => 'required|string|max:100',
            'status' => 'required|in:upcoming,ongoing,completed',
            'units' => 'required|integer|min:0|max:10', 
        ]);

        $courseSection->update($validated);

        return redirect()->route('course-sections.index')->with('success', 'Course section updated successfully.');
    }

    public function destroy(CourseSection $courseSection)
    {
        $this->authorizeSchoolAccess($courseSection);

        $courseSection->delete();

        return redirect()->route('course-sections.index')->with('success', 'Course section deleted successfully.');
    }

    protected function authorizeSchoolAccess(CourseSection $courseSection)
    {
        if ($courseSection->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to course section.');
        }
    }
}