<?php

namespace App\Http\Controllers\Mobile;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\CoachAssignment;
use Illuminate\Support\Facades\Auth;

class MobileSportsController extends Controller
{
    public function getAssignedSportsToCoach()
    {
        $user = Auth::user();
        $coachId = $user->id;

        $courses = CoachAssignment::with([
            'coach:id,name,email',
            'sport.sportsTeams'
        ])
            ->where('coach_id', $coachId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $courses,
            'token' => request()->bearerToken(),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'coach_id' => $coachId,
            ],
        ]);
    }
}
