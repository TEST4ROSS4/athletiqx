<?php

namespace App\Http\Controllers;

use App\Models\CoachAssignment;
use App\Models\NewsPost;
use App\Models\Program;
use App\Models\StudentSportTeam;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CoachDashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user || (!$user->hasRole('Coach') && !$user->hasRole('Admin') && !$user->hasRole('super_admin'))) {
            abort(403);
        }

        $schoolId = $user->school_id;

        $assignments = CoachAssignment::with('sportTeam:id,name')
            ->where('coach_id', $user->id)
            ->when($schoolId, fn($q) => $q->where('school_id', $schoolId))
            ->get();

        $teamIds = $assignments->pluck('sport_team_id')->filter()->unique()->values();

        $teamAthleteCounts = StudentSportTeam::select('sport_team_id', DB::raw('COUNT(*) as count'))
            ->whereIn('sport_team_id', $teamIds)
            ->groupBy('sport_team_id')
            ->pluck('count', 'sport_team_id');

        $teamActivityWeek = StudentSportTeam::select(DB::raw('COUNT(*) as count'))
            ->whereIn('sport_team_id', $teamIds)
            ->whereBetween('updated_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->value('count') ?? 0;

        $teams = $assignments->map(function ($assignment) use ($teamAthleteCounts) {
            return [
                'id' => $assignment->sport_team_id,
                'name' => $assignment->sportTeam->name ?? 'Team',
                'athletes' => $teamAthleteCounts[$assignment->sport_team_id] ?? 0,
            ];
        })->unique('id')->values();

        $totalTeams = $teams->count();
        $totalAthletes = $teamAthleteCounts->sum() ?? 0;

        // Training programs created by this coach (within school)
        $programBaseQuery = Program::where('school_id', $schoolId)
            ->where('created_by', $user->id);

        $programSummary = [
            'total'      => (clone $programBaseQuery)->count(),
            'assigned'   => (clone $programBaseQuery)->has('assignments')->count(),
            'unassigned' => (clone $programBaseQuery)->doesntHave('assignments')->count(),
            'recent'     => (clone $programBaseQuery)
                ->withCount('assignments')
                ->orderByDesc('updated_at')
                ->take(3)
                ->get(['id', 'name', 'updated_at']),
        ];

        $recentNews = NewsPost::with('user:id,name')
            ->when($schoolId, function ($q) use ($schoolId) {
                $q->where(function ($inner) use ($schoolId) {
                    $inner->where('school_id', $schoolId)->orWhere('is_global', true);
                });
            })
            ->orderByDesc('created_at')
            ->take(5)
            ->get(['id', 'title', 'created_at', 'is_global', 'school_id', 'user_id'])
            ->map(fn($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'created_at' => $post->created_at,
                'is_global' => $post->is_global,
                'author' => $post->user->name ?? 'Unknown',
            ]);

        return Inertia::render('CoachDashboard', [
            'schoolName'       => $user->school->name ?? 'Your School',
            'totalTeams'       => $totalTeams,
            'totalAthletes'    => $totalAthletes,
            'teamActivityWeek' => $teamActivityWeek,
            'teams'            => $teams,
            'programSummary'   => $programSummary,
            'recentNews'       => $recentNews,
        ]);
    }
}
