<?php

namespace App\Http\Controllers;

use App\Models\StudentSportTeam;
use App\Models\SportTeam;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentSportTeamController extends Controller
{
    public function landing()
    {
        $schoolId = Auth::user()->school_id;

        $sportTeams = SportTeam::with('sport')
            ->where('school_id', $schoolId)
            ->get()
            ->groupBy('sport.name');

        return Inertia::render('ManageTeamMembersPage/Landing', [
            'groupedTeams' => $sportTeams,
        ]);
    }

    public function index(SportTeam $sportTeam)
    {
        $this->authorizeSchoolAccess($sportTeam);

        $assignments = StudentSportTeam::with('student')
            ->where('sport_team_id', $sportTeam->id)
            ->get();

        return Inertia::render('ManageTeamMembersPage/Index', [
            'sportTeam' => $sportTeam,
            'assignments' => $assignments,
        ]);
    }

    public function create(SportTeam $sportTeam)
    {
        $this->authorizeSchoolAccess($sportTeam);

        $students = User::role('student')
            ->where('school_id', Auth::user()->school_id)
            ->get();

        return Inertia::render('ManageTeamMembersPage/Add', [
            'sportTeam' => $sportTeam,
            'students' => $students,
        ]);
    }

    public function store(Request $request, SportTeam $sportTeam)
    {
        $this->authorizeSchoolAccess($sportTeam);

        $validated = $request->validate([
            'members' => 'required|array|min:1',
            'members.*.student_id' => 'required|exists:users,id',
            'members.*.status' => 'required|string',
            'members.*.position' => 'required|string',
        ]);

        $schoolId = Auth::user()->school_id;

        foreach ($validated['members'] as $member) {
            StudentSportTeam::create([
                'student_id' => $member['student_id'],
                'sport_team_id' => $sportTeam->id,
                'school_id' => $schoolId,
                'status' => $member['status'],
                'position' => $member['position'],
            ]);
        }

        return redirect()->route('student-sport-teams.index', $sportTeam->id)
            ->with('success', 'Team members added successfully.');
    }

    public function edit(StudentSportTeam $studentSportTeam)
    {
        $this->authorizeSchoolAccess($studentSportTeam);

        $students = User::role('student')
            ->where('school_id', Auth::user()->school_id)
            ->get();

        return Inertia::render('ManageTeamMembersPage/Edit', [
            'sportTeam' => $studentSportTeam->sportTeam,
            'assignment' => $studentSportTeam,
            'students' => $students,
        ]);
    }

    public function update(Request $request, StudentSportTeam $studentSportTeam)
    {
        $this->authorizeSchoolAccess($studentSportTeam);

        $validated = $request->validate([
            'members.0.student_id' => 'required|exists:users,id',
            'members.0.status' => 'required|string',
            'members.0.position' => 'required|string',
        ]);

        $member = $validated['members'][0];

        $studentSportTeam->update([
            'student_id' => $member['student_id'],
            'status' => $member['status'],
            'position' => $member['position'],
        ]);

        return redirect()->route('student-sport-teams.index', $studentSportTeam->sport_team_id)
            ->with('success', 'Team member updated successfully.');
    }

    public function show(StudentSportTeam $studentSportTeam)
    {
        $this->authorizeSchoolAccess($studentSportTeam);

        return Inertia::render('ManageTeamMembersPage/View', [
            'assignment' => $studentSportTeam->load('student', 'sportTeam.sport'),
        ]);
    }

    public function destroy(StudentSportTeam $studentSportTeam)
    {
        $this->authorizeSchoolAccess($studentSportTeam);

        $studentSportTeam->delete();

        return redirect()->route('student-sport-teams.index', $studentSportTeam->sport_team_id)
            ->with('success', 'Team member removed.');
    }

    protected function authorizeSchoolAccess($model)
    {
        if ($model->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}