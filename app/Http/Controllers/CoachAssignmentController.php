<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Sport;
use App\Models\SportTeam;
use App\Models\CoachAssignment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CoachAssignmentController extends Controller
{
    public function index()
    {
        $assignments = CoachAssignment::with(['coach', 'sport', 'sportTeam'])
            ->where('school_id', Auth::user()->school_id)
            ->get();

        return Inertia::render('AssignCoachesPage/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function create()
    {
        $schoolId = Auth::user()->school_id;

        $coaches = User::role('coach')
            ->where('school_id', $schoolId)
            ->select('id', 'name', 'email')
            ->get();

        $sports = Sport::where('school_id', $schoolId)
            ->select('id', 'name')
            ->get();

        $sportTeams = SportTeam::with('sport')
            ->where('school_id', $schoolId)
            ->get();

        return Inertia::render('AssignCoachesPage/Add', [
            'coaches' => $coaches,
            'sports' => $sports,
            'sportTeams' => $sportTeams,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'coach_id' => 'required|exists:users,id',
            'sport_id' => 'nullable|exists:sports,id',
            'sport_team_id' => 'nullable|exists:sport_teams,id',
        ]);

        if (!$validated['sport_id'] && !$validated['sport_team_id']) {
            throw ValidationException::withMessages([
                'sport_id' => 'You must assign either a sport or a team.',
                'sport_team_id' => 'You must assign either a sport or a team.',
            ]);
        }

        if ($validated['sport_id'] && $validated['sport_team_id']) {
            throw ValidationException::withMessages([
                'sport_id' => 'You cannot assign both a sport and a team.',
                'sport_team_id' => 'You cannot assign both a sport and a team.',
            ]);
        }

        CoachAssignment::firstOrCreate([
            'coach_id' => $validated['coach_id'],
            'sport_id' => $validated['sport_id'],
            'sport_team_id' => $validated['sport_team_id'],
            'school_id' => Auth::user()->school_id,
        ]);

        return redirect()->route('coach-assignments.index')->with('success', 'Coach assigned successfully.');
    }

    public function show(CoachAssignment $coachAssignment)
    {
        $this->authorizeSchoolAccess($coachAssignment);

        $coachAssignment->load(['coach', 'sport', 'sportTeam.sport']);

        if ($coachAssignment->sport_team_id) {
            // Assigned to specific team — show that team + others
            $allTeams = $coachAssignment->coach->assignedTeams()->load('sport');
        } elseif ($coachAssignment->sport_id) {
            // Assigned to sport — show all teams under that sport
            $allTeams = $coachAssignment->sport->sportsTeams()->with('sport')->get();
        } else {
            $allTeams = collect(); // fallback
        }

        return Inertia::render('AssignCoachesPage/View', [
            'assignment' => $coachAssignment,
            'allTeams' => $allTeams,
        ]);
    }

    public function edit(CoachAssignment $coachAssignment)
    {
        $this->authorizeSchoolAccess($coachAssignment);

        $schoolId = Auth::user()->school_id;

        $coaches = User::role('coach')
            ->where('school_id', $schoolId)
            ->select('id', 'name', 'email')
            ->get();

        $sports = Sport::where('school_id', $schoolId)
            ->select('id', 'name')
            ->get();

        $sportTeams = SportTeam::with('sport')
            ->where('school_id', $schoolId)
            ->get();

        return Inertia::render('AssignCoachesPage/Edit', [
            'assignment' => $coachAssignment,
            'coaches' => $coaches,
            'sports' => $sports,
            'sportTeams' => $sportTeams,
        ]);
    }

    public function update(Request $request, CoachAssignment $coachAssignment)
    {
        $this->authorizeSchoolAccess($coachAssignment);

        $validated = $request->validate([
            'coach_id' => 'required|exists:users,id',
            'sport_id' => 'nullable|exists:sports,id',
            'sport_team_id' => 'nullable|exists:sport_teams,id',
        ]);

        if (!$validated['sport_id'] && !$validated['sport_team_id']) {
            throw ValidationException::withMessages([
                'sport_id' => 'You must assign either a sport or a team.',
                'sport_team_id' => 'You must assign either a sport or a team.',
            ]);
        }

        if ($validated['sport_id'] && $validated['sport_team_id']) {
            throw ValidationException::withMessages([
                'sport_id' => 'You cannot assign both a sport and a team.',
                'sport_team_id' => 'You cannot assign both a sport and a team.',
            ]);
        }

        $coachAssignment->update($validated);

        return redirect()->route('coach-assignments.index')->with('success', 'Assignment updated successfully.');
    }

    public function destroy(CoachAssignment $coachAssignment)
    {
        $this->authorizeSchoolAccess($coachAssignment);

        $coachAssignment->delete();

        return redirect()->route('coach-assignments.index')->with('success', 'Assignment removed successfully.');
    }

    protected function authorizeSchoolAccess(CoachAssignment $assignment)
    {
        if ($assignment->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to assignment.');
        }
    }
}