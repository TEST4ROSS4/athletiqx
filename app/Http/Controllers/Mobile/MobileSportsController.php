<?php

namespace App\Http\Controllers\Mobile;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\CoachAssignment;
use App\Models\SportTeam;
use App\Models\StudentSportTeam;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class MobileSportsController extends Controller
{
    public function getAssignedSportsToCoach()
    {

        $user = Auth::user();

        // Get direct team assignments
        $directTeamIds = CoachAssignment::where('coach_id', $user->id)
            ->where('school_id', $user->school_id)
            ->whereNotNull('sport_team_id')
            ->pluck('sport_team_id');

        // Get sport-based assignments
        $sportIds = CoachAssignment::where('coach_id', $user->id)
            ->where('school_id', $user->school_id)
            ->whereNotNull('sport_id')
            ->pluck('sport_id');

        // Get teams via sport
        $viaSportTeamIds = SportTeam::whereIn('sport_id', $sportIds)->pluck('id');

        // Merge and deduplicate
        $allTeamIds = $directTeamIds->merge($viaSportTeamIds)->unique();

        // Fetch teams with sport relationship
        $teams = SportTeam::with('sport')
            ->whereIn('id', $allTeamIds)
            ->get();

        return response()->json([
            'data' => $teams,
        ]);
    }

    public function getPlayers(SportTeam $sportTeam)
    {
        $players = StudentSportTeam::with('student')
            ->where('sport_team_id', $sportTeam->id)
            ->get();

        return response()->json([
            'data' => $players
        ]);
    }

    public function fetchTeamMembersCreate(SportTeam $sportTeam)
    {
        $students = User::role('student')
            ->where('school_id', Auth::user()->school_id)
            ->get();

        return response()->json([
            'sportTeam' => $sportTeam,
            'students' => $students,
        ]);
    }

    public function store(Request $request, SportTeam $sportTeam)
    {
        $validated = $request->validate([
            'members' => 'required|array|min:1',
            'members.*.student_id' => 'required|exists:users,id',
            'members.*.status' => 'required|string',
            'members.*.position' => 'required|string',
        ]);

        $schoolId = Auth::user()->school_id;

        $createdMembers = [];

        foreach ($validated['members'] as $member) {
            $created = StudentSportTeam::create([
                'student_id' => $member['student_id'],
                'sport_team_id' => $sportTeam->id,
                'school_id' => $schoolId,
                'status' => $member['status'],
                'position' => $member['position'],
            ]);

            $createdMembers[] = $created;
        }

        return response()->json([
            'message' => 'Team members added successfully.',
            'sport_team_id' => $sportTeam->id,
            'members' => $createdMembers,
        ], 201);
    }
}
