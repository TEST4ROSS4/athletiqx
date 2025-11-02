<?php

namespace App\Http\Controllers\Mobile;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\CoachAssignment;
use App\Models\SportTeam;
use App\Models\StudentSportTeam;
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
}
