<?php

namespace App\Http\Controllers;

use App\Models\SportTeam;
use App\Models\StudentSportTeam;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentSportTeamController extends Controller
{
    public function landing()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $teams = $user->hasRole('Admin')
            ? SportTeam::with('sport')->where('school_id', $user->school_id)->get()
            : SportTeam::with('sport')->whereIn('id', $user->assignedTeams()->pluck('id'))->get();

        $groupedTeams = $teams->groupBy('sport.name');

        return Inertia::render('ManageTeamMembersPage/Landing', [
            'groupedTeams' => $groupedTeams,
        ]);
    }

    public function index(SportTeam $sportTeam)
    {
        $this->authorizeTeamAccess($sportTeam, 'student-sport-teams.view');

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
        $this->authorizeTeamAccess($sportTeam, 'student-sport-teams.create');

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
        $this->authorizeTeamAccess($sportTeam, 'student-sport-teams.create');

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
        $this->authorizeAssignmentAccess($studentSportTeam, 'student-sport-teams.edit');

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
        $this->authorizeAssignmentAccess($studentSportTeam, 'student-sport-teams.edit');

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
        $this->authorizeAssignmentAccess($studentSportTeam, 'student-sport-teams.view');

        return Inertia::render('ManageTeamMembersPage/View', [
            'assignment' => $studentSportTeam->load('student', 'sportTeam.sport')->only([
                'id',
                'student_id',
                'position',
                'status',
                'sport_team_id',
                'student',
                'sportTeam',
            ]),
        ]);
    }

    public function destroy(StudentSportTeam $studentSportTeam)
    {
        $this->authorizeAssignmentAccess($studentSportTeam, 'student-sport-teams.delete');

        $studentSportTeam->delete();

        return redirect()->route('student-sport-teams.index', $studentSportTeam->sport_team_id)
            ->with('success', 'Team member removed.');
    }

    // 🔐 Centralized access logic
    protected function authorizeTeamAccess(SportTeam $team, string $permission)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (
            $team->school_id !== $user->school_id ||
            ! $user->can($permission) ||
            (! $user->hasRole('Admin') && ! $team->isAssignedTo($user))
        ) {
            abort(403, 'Unauthorized access to this team.');
        }
    }

    protected function authorizeAssignmentAccess(StudentSportTeam $assignment, string $permission)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (
            $assignment->school_id !== $user->school_id ||
            ! $user->can($permission) ||
            (! $user->hasRole('Admin') && ! $assignment->sportTeam->isAssignedTo($user))
        ) {
            abort(403, 'Unauthorized access to this assignment.');
        }
    }
}
