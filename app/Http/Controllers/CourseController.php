<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created');

        $courses = Course::query()
            ->where('school_id', Auth::user()->school_id) // 🔐 filter by school
            ->when($sort === 'alpha', fn($q) => $q->orderBy('code'))
            ->when($sort === 'created', fn($q) => $q->orderBy('id'))
            ->get();

        return Inertia::render('CoursesPage/Index', [
            'courses' => $courses,
            'sort' => $sort,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('CoursesPage/Add');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:courses,code',
            'title' => 'required|string|max:255',
        ]);

        Course::create([
            ...$validated,
            'school_id' => Auth::user()->school_id, // 🏫 auto-assign school
        ]);

        return redirect()->route('courses.index')->with('success', 'Course created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        $this->authorizeSchoolAccess($course);

        return Inertia::render('CoursesPage/View', [
            'course' => $course,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        $this->authorizeSchoolAccess($course);

        return Inertia::render('CoursesPage/Edit', [
            'course' => $course,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        $this->authorizeSchoolAccess($course);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:courses,code,' . $course->id,
            'title' => 'required|string|max:255',
        ]);

        $course->update($validated);

        return redirect()->route('courses.index')->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        $this->authorizeSchoolAccess($course);

        $course->delete();

        return redirect()->route('courses.index')->with('success', 'Course deleted successfully.');
    }

    /**
     * Restrict access to courses outside user's school.
     */
    protected function authorizeSchoolAccess(Course $course)
    {
        if ($course->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to course.');
        }
    }
}