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

    public function update(Request $request, StudentSportTeam $studentSportTeam)
    {
        $validated = $request->validate([
            'status' => 'required|string|max:255',
            'position' => 'required|string|max:255',
        ]);

        $studentSportTeam->update([
            'status' => $validated['status'],
            'position' => $validated['position'],
        ]);

        return response()->json([
            'message' => 'Team member updated successfully.',
            'data' => $studentSportTeam,
        ], 200);
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
        $duplicates = [];

        foreach ($validated['members'] as $member) {
            $exists = StudentSportTeam::where('student_id', $member['student_id'])
                ->where('sport_team_id', $sportTeam->id)
                ->exists();

            if ($exists) {
                $student = User::find($member['student_id']);
                $duplicates[] = [
                    'student_id' => $member['student_id'],
                    'name' => $student?->name,
                    'message' => 'Already assigned to this team.',
                ];
            }
        }

        if (!empty($duplicates)) {
            return response()->json([
                'message' => 'Submission failed due to duplicate entries.',
                'duplicates' => $duplicates,
            ], 409); // 409 Conflict
        }

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

    public function destroy(StudentSportTeam $studentSportTeam)
    {
        $studentSportTeam->delete();

        return response()->json([
            'message' => 'Team member removed.',
            'team_id' => $studentSportTeam->sport_team_id,
        ], 200);
    }
}
