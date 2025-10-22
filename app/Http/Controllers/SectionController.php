<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created');

        $sections = Section::query()
            ->where('school_id', Auth::user()->school_id) // 🔐 filter by school
            ->when($sort === 'alpha', fn($q) => $q->orderBy('code'))
            ->when($sort === 'created', fn($q) => $q->orderBy('id'))
            ->get();

        return Inertia::render('SectionsPage/Index', [
            'sections' => $sections,
            'sort' => $sort,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SectionsPage/Add');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:sections,code',
            'program' => 'required|string|max:255',
        ]);

        Section::create([
            ...$validated,
            'school_id' => Auth::user()->school_id, // 🏫 auto-assign school
        ]);

        return redirect()->route('sections.index')->with('success', 'Section created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Section $section)
    {
        $this->authorizeSchoolAccess($section);

        return Inertia::render('SectionsPage/View', [
            'section' => $section,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Section $section)
    {
        $this->authorizeSchoolAccess($section);

        return Inertia::render('SectionsPage/Edit', [
            'section' => $section,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Section $section)
    {
        $this->authorizeSchoolAccess($section);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:sections,code,' . $section->id,
            'program' => 'required|string|max:255',
        ]);

        $section->update($validated);

        return redirect()->route('sections.index')->with('success', 'Section updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section)
    {
        $this->authorizeSchoolAccess($section);

        $section->delete();

        return redirect()->route('sections.index')->with('success', 'Section deleted successfully.');
    }

    /**
     * Restrict access to sections outside user's school.
     */
    protected function authorizeSchoolAccess(Section $section)
    {
        if ($section->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to section.');
        }
    }
}