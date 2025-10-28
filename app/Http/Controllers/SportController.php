<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created');

        $sports = Sport::query()
            ->where('school_id', Auth::user()->school_id) // 🔐 filter by school
            ->when($sort === 'alpha', fn($q) => $q->orderBy('name'))
            ->when($sort === 'created', fn($q) => $q->orderBy('id'))
            ->get();

        return Inertia::render('SportsPage/Index', [
            'sports' => $sports,
            'sort' => $sort,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SportsPage/Add');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:sports,name',
            'category' => 'nullable|string|max:50',
            'gender' => 'required|in:male,female,mixed',
            'division' => 'required|in:junior,senior',
            'is_active' => 'boolean',
        ]);

        Sport::create([
            ...$validated,
            'school_id' => Auth::user()->school_id, // 🏫 auto-assign school
        ]);

        return redirect()->route('sports.index')->with('success', 'Sport created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sport $sport)
    {
        $this->authorizeSchoolAccess($sport);

        return Inertia::render('SportsPage/View', [
            'sport' => $sport,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sport $sport)
    {
        $this->authorizeSchoolAccess($sport);

        return Inertia::render('SportsPage/Edit', [
            'sport' => $sport,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sport $sport)
    {
        $this->authorizeSchoolAccess($sport);

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:sports,name,' . $sport->id,
            'category' => 'nullable|string|max:50',
            'gender' => 'required|in:male,female,mixed',
            'division' => 'required|in:junior,senior',
            'is_active' => 'boolean',
        ]);

        $sport->update($validated);

        return redirect()->route('sports.index')->with('success', 'Sport updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sport $sport)
    {
        $this->authorizeSchoolAccess($sport);

        $sport->delete();

        return redirect()->route('sports.index')->with('success', 'Sport deleted successfully.');
    }

    /**
     * Restrict access to sports outside user's school.
     */
    protected function authorizeSchoolAccess(Sport $sport)
    {
        if ($sport->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to sport.');
        }
    }
}