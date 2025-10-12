<?php

namespace App\Http\Controllers;

use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolController extends Controller
{
    /**
     * Display a listing of the schools.
     */
    public function index()
    {
        $schools = School::orderBy('created_at', 'desc')->get();

        return Inertia::render('SchoolsPage/Index', [
            'schools' => $schools,
        ]);
    }

    /**
     * Show the form for creating a new school.
     */
    public function create()
    {
        return Inertia::render('SchoolsPage/Add');
    }

    /**
     * Store a newly created school in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:schools,name',
            'code' => 'required|string|max:50|unique:schools,code',
            'address' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        School::create($validated);

        return redirect()->route('schools.index')->with('success', 'School created successfully.');
    }

    /**
     * Display the specified school.
     */
    public function show(School $school)
    {
        return Inertia::render('SchoolsPage/View', [
            'school' => $school,
        ]);
    }

    /**
     * Show the form for editing the specified school.
     */
    public function edit(School $school)
    {
        return Inertia::render('SchoolsPage/Edit', [
            'school' => $school,
        ]);
    }

    /**
     * Update the specified school in storage.
     */
    public function update(Request $request, School $school)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:schools,name,' . $school->id,
            'code' => 'required|string|max:50|unique:schools,code,' . $school->id,
            'address' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        $school->update($validated);

        return redirect()->route('schools.index')->with('success', 'School updated successfully.');
    }

    /**
     * Remove the specified school from storage.
     */
    public function destroy(School $school)
    {
        $school->delete();

        return redirect()->route('schools.index')->with('success', 'School deleted successfully.');
    }
}