<?php

namespace App\Http\Controllers;

use App\Models\WellnessLog;
use App\Models\StudentSportTeam;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CoachWellnessController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Coach can only see students from teams they're assigned to
        $teamIds = $user->assignedTeams()->pluck('id');
        $studentIds = StudentSportTeam::whereIn('sport_team_id', $teamIds)->pluck('student_id')->unique();

        $perPage = $request->get('per_page', 50);
        $days = $request->get('days', 30);

        $logs = WellnessLog::with(['student:id,name,email,school_id', 'student.school:id,name'])
            ->whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', now()->subDays($days))
            ->orderByDesc('logged_at')
            ->paginate($perPage);

        return Inertia::render('Admin/WellnessLogs', [
            'logs' => $logs,
            'days' => $days,
        ]);
    }
}
