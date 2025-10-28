<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\SportTeam;
use App\Models\Sport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SportTeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created');

        $teams = SportTeam::query()
            ->with('sport') // eager load sport name
            ->where('school_id', Auth::user()->school_id)
            ->when($sort === 'alpha', fn($q) => $q->orderBy('name'))
            ->when($sort === 'created', fn($q) => $q->orderBy('id'))
            ->get();

        return Inertia::render('SportTeamsPage/Index', [
            'teams' => $teams,
            'sort' => $sort,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $sports = Sport::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        return Inertia::render('SportTeamsPage/Add', [
            'sports' => $sports,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'season' => 'required|string|max:20',
            'is_official' => 'boolean',
            'sport_id' => 'required|exists:sports,id',
        ]);

        SportTeam::create([
            ...$validated,
            'school_id' => Auth::user()->school_id,
        ]);

        return redirect()->route('sport-teams.index')->with('success', 'Team created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SportTeam $sportTeam)
    {
        $this->authorizeSchoolAccess($sportTeam);

        return Inertia::render('SportTeamsPage/View', [
            'team' => $sportTeam->load('sport'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SportTeam $sportTeam)
    {
        $this->authorizeSchoolAccess($sportTeam);

        $sports = Sport::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        return Inertia::render('SportTeamsPage/Edit', [
            'team' => $sportTeam,
            'sports' => $sports,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SportTeam $sportTeam)
    {
        $this->authorizeSchoolAccess($sportTeam);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'season' => 'required|string|max:20',
            'is_official' => 'boolean',
            'sport_id' => 'required|exists:sports,id',
        ]);

        $sportTeam->update($validated);

        return redirect()->route('sport-teams.index')->with('success', 'Team updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SportTeam $sportTeam)
    {
        $this->authorizeSchoolAccess($sportTeam);

        $sportTeam->delete();

        return redirect()->route('sport-teams.index')->with('success', 'Team deleted successfully.');
    }

    /**
     * Restrict access to teams outside user's school.
     */
    protected function authorizeSchoolAccess(SportTeam $sportTeam)
    {
        if ($sportTeam->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to team.');
        }
    }
}