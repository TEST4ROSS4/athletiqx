<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\User;
use App\Models\ExerciseLog;
use App\Models\WellnessLog;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class SuperAdminDashboardController extends Controller
{
    public function index()
    {
        // Total schools registered
        $totalSchools = School::count();

        // Recently added schools (last 5)
        $recentSchools = School::orderByDesc('created_at')
            ->take(5)
            ->get(['name', 'code', 'created_at']);

        // ✅ Dynamic role distribution
        $roles = Role::all()->pluck('name');
        $roleDistribution = $roles->mapWithKeys(function ($role) {
            return [$role => User::role($role)->count()];
        });

        // Active users snapshot (approx via updated_at)
        $activeUsersToday = User::whereDate('updated_at', now()->toDateString())->count();
        $activeUsersWeek  = User::whereBetween('updated_at', [now()->startOfWeek(), now()->endOfWeek()])->count();

        // Top active schools (ranked by number of users updated this week)
        $topActiveSchools = User::select('school_id', DB::raw('COUNT(*) as users_count'))
            ->whereBetween('updated_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->groupBy('school_id')
            ->orderByDesc('users_count')
            ->take(5)
            ->with('school:id,name')
            ->get()
            ->map(fn($row) => [
                'name'   => $row->school->name ?? 'Unknown',
                'logins' => $row->users_count,
            ]);

        // Performance & Wellness KPIs (platform-level, last 7 days vs previous 7 days)
        $now = now();
        $weekStart = $now->copy()->subDays(6)->startOfDay();
        $prevWeekStart = $now->copy()->subDays(13)->startOfDay();
        $prevWeekEnd = $weekStart->copy()->subSecond();

        $exerciseWeek = $this->exerciseStats($weekStart, $now);
        $exercisePrev = $this->exerciseStats($prevWeekStart, $prevWeekEnd);
        $exerciseDaily = $this->exerciseDaily($weekStart, $now);

        $wellnessWeek = $this->wellnessStats($weekStart, $now);
        $wellnessPrev = $this->wellnessStats($prevWeekStart, $prevWeekEnd);
        $wellnessDaily = $this->wellnessDaily($weekStart, $now);

        $lastWellness = WellnessLog::orderByDesc('logged_at')->first();
        $recencyDays = $lastWellness ? $lastWellness->logged_at->diffInDays($now) : null;

        return Inertia::render('SuperAdminDashboard', [
            'totalSchools'     => $totalSchools,
            'recentSchools'    => $recentSchools,
            'roleDistribution' => $roleDistribution, // dynamic roles
            'activeUsersToday' => $activeUsersToday,
            'activeUsersWeek'  => $activeUsersWeek,
            'topActiveSchools' => $topActiveSchools,
            'kpi' => [
                'exercise' => [
                    'week' => $exerciseWeek,
                    'previous' => $exercisePrev,
                    'daily' => $exerciseDaily,
                ],
                'wellness' => [
                    'week' => $wellnessWeek,
                    'previous' => $wellnessPrev,
                    'daily' => $wellnessDaily,
                ],
                'recency' => [
                    'last_log_at' => optional($lastWellness?->logged_at)->toIso8601String(),
                    'days_since_last' => $recencyDays,
                ],
                'window' => [
                    'current_start' => $weekStart->toDateString(),
                    'current_end' => $now->toDateString(),
                ],
            ],
        ]);
    }

    private function exerciseStats(Carbon $start, Carbon $end): array
    {
        $row = ExerciseLog::join('program_assignments', 'program_assignments.id', '=', 'exercise_logs.assignment_id')
            ->whereBetween('exercise_logs.created_at', [$start, $end])
            ->selectRaw('
                COUNT(*) as total_logs,
                SUM(CASE WHEN marked_as_done THEN 1 ELSE 0 END) as completed_logs,
                SUM(CASE WHEN proof_url IS NOT NULL THEN 1 ELSE 0 END) as proof_logs,
                COUNT(DISTINCT program_assignments.student_id) as active_athletes
            ')
            ->first();

        $total = (int) ($row->total_logs ?? 0);
        $completed = (int) ($row->completed_logs ?? 0);
        $proof = (int) ($row->proof_logs ?? 0);
        $athletes = (int) ($row->active_athletes ?? 0);

        return [
            'total_logs' => $total,
            'completed_logs' => $completed,
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
            'proof_logs' => $proof,
            'proof_rate' => $total > 0 ? round(($proof / $total) * 100, 1) : 0,
            'active_athletes' => $athletes,
            'session_density' => $athletes > 0 ? round($completed / $athletes, 1) : 0,
        ];
    }

    private function exerciseDaily(Carbon $start, Carbon $end): array
    {
        $rows = ExerciseLog::whereBetween('exercise_logs.created_at', [$start, $end])
            ->selectRaw("
                DATE(exercise_logs.created_at) as day,
                SUM(CASE WHEN marked_as_done THEN 1 ELSE 0 END) as completed,
                COUNT(*) as total
            ")
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $labels = [];
        $completion = [];

        foreach ($rows as $row) {
            $labels[] = $row->day;
            $rate = $row->total > 0 ? round(($row->completed / $row->total) * 100, 1) : 0;
            $completion[] = $rate;
        }

        return [
            'labels' => $labels,
            'completion_rate' => $completion,
        ];
    }

    private function wellnessStats(Carbon $start, Carbon $end): array
    {
        $row = WellnessLog::whereBetween('logged_at', [$start, $end])
            ->selectRaw('
                AVG(readiness_to_train) as readiness_avg,
                AVG(energy_level) as energy_avg,
                AVG(mood) as mood_avg,
                AVG(recovery_soreness) as soreness_avg,
                AVG(sleep_hours) as sleep_hours_avg,
                AVG(sleep_quality) as sleep_quality_avg,
                AVG(hydration_level) as hydration_avg,
                SUM(CASE WHEN injury_status IS NOT NULL AND injury_status != "" AND injury_status != "none" THEN 1 ELSE 0 END) as injury_flags,
                COUNT(DISTINCT student_id) as active_athletes
            ')
            ->first();

        return [
            'readiness_avg' => round((float) ($row->readiness_avg ?? 0), 1),
            'energy_avg' => round((float) ($row->energy_avg ?? 0), 1),
            'mood_avg' => round((float) ($row->mood_avg ?? 0), 1),
            'soreness_avg' => round((float) ($row->soreness_avg ?? 0), 1),
            'sleep_hours_avg' => round((float) ($row->sleep_hours_avg ?? 0), 1),
            'sleep_quality_avg' => round((float) ($row->sleep_quality_avg ?? 0), 1),
            'hydration_avg' => round((float) ($row->hydration_avg ?? 0), 1),
            'injury_flags' => (int) ($row->injury_flags ?? 0),
            'active_athletes' => (int) ($row->active_athletes ?? 0),
        ];
    }

    private function wellnessDaily(Carbon $start, Carbon $end): array
    {
        $rows = WellnessLog::whereBetween('logged_at', [$start, $end])
            ->selectRaw('
                DATE(logged_at) as day,
                AVG(readiness_to_train) as readiness_avg,
                AVG(energy_level) as energy_avg,
                AVG(recovery_soreness) as soreness_avg
            ')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $labels = [];
        $readiness = [];
        $energy = [];
        $soreness = [];

        foreach ($rows as $row) {
            $labels[] = $row->day;
            $readiness[] = round((float) ($row->readiness_avg ?? 0), 1);
            $energy[] = round((float) ($row->energy_avg ?? 0), 1);
            $soreness[] = round((float) ($row->soreness_avg ?? 0), 1);
        }

        return [
            'labels' => $labels,
            'readiness' => $readiness,
            'energy' => $energy,
            'soreness' => $soreness,
        ];
    }
}