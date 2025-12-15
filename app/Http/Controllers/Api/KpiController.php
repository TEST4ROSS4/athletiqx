<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KpiLog;
use App\Models\KpiCache;
use App\Models\TeamKpiCache;
use App\Models\SchoolKpiCache;
use App\Models\TrainingLog;
use App\Models\SportTeam;
use App\Models\User;
use App\Models\School;
use Illuminate\Http\Request;

class KpiController extends Controller
{
    public function getKpiSummary($studentId)
    {
        // Authorization check - allow viewing own data or admin/coach
        $user = auth()->user();
        $isOwnData = (int)auth()->id() === (int)$studentId;
        $isAdmin = $user && $user->hasRole(['Admin', 'admin', 'Coach', 'coach', 'super_admin']);
        
        if (!$isOwnData && !$isAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $kpiCache = KpiCache::where('student_id', $studentId)
            ->where('date', now()->toDateString())
            ->first();

        if (!$kpiCache) {
            $kpiCache = $this->calculateKpis($studentId);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => [
                    'trainingCompletionRate' => $kpiCache->completion_rate ?? 0,
                    'complianceScore' => $kpiCache->compliance_score ?? 0,
                    'consistencyIndex' => $kpiCache->consistency_index ?? 0,
                    'performanceTrend' => $kpiCache->performance_trend ?? 0,
                    'attendanceRate' => $kpiCache->attendance_rate ?? 0,
                    'averageSessionDuration' => $kpiCache->avg_session_duration ?? 0,
                    'personalRecords' => [
                        'maxWeight' => $this->getMaxWeight($studentId),
                        'maxTime' => $this->getMaxDuration($studentId),
                    ],
                    'recoveryMetrics' => [
                        'sleepQuality' => $this->getAvgSleepQuality($studentId),
                        'soreness' => $this->getAvgSoreness($studentId),
                    ],
                ],
                'lastUpdated' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Lightweight lists to drive KPI filters (mobile/web)
     */
    public function listSchools()
    {
        $user = auth()->user();
        $isSuperAdmin = $user && $user->hasRole('super_admin');
        $isAdmin = $user && $user->hasRole('Admin');

        if (!$isSuperAdmin && !$isAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $schools = $isSuperAdmin
            ? School::select('id', 'name')->orderBy('name')->get()
            : School::select('id', 'name')->where('id', $user->school_id)->get();

        return response()->json([
            'success' => true,
            'data' => $schools,
        ]);
    }

    public function listTeams(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user && $user->hasRole('super_admin');
        $isAdmin = $user && $user->hasRole('Admin');
        $isCoach = $user && $user->hasRole('Coach');

        if (!$isSuperAdmin && !$isAdmin && !$isCoach) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $query = SportTeam::select('id', 'name', 'school_id');

        if ($isCoach && method_exists($user, 'assignedTeams')) {
            $query->whereIn('id', $user->assignedTeams()->pluck('id'));
        }

        if ($isAdmin && !$isSuperAdmin) {
            $query->where('school_id', $user->school_id);
        }

        if ($isSuperAdmin && $request->filled('school_id')) {
            $query->where('school_id', $request->get('school_id'));
        }

        $teams = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $teams,
        ]);
    }

    public function listTeamStudents($teamId)
    {
        $user = auth()->user();
        $team = SportTeam::find($teamId);

        if (!$team) {
            return response()->json(['success' => false, 'message' => 'Team not found'], 404);
        }

        $isCoachOfTeam = method_exists($user, 'canManageTeam') ? $user->canManageTeam($team) : false;
        $isAdmin = $user && $user->hasRole(['Admin', 'super_admin']);
        $sameSchool = $isAdmin && ($user->hasRole('super_admin') || $user->school_id === $team->school_id);

        if (!($isCoachOfTeam || $sameSchool)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $students = $team->studentAssignments()
            ->with('student:id,name,email')
            ->get()
            ->map(fn($assignment) => [
                'id' => $assignment->student_id,
                'name' => $assignment->student?->name ?? 'Unknown',
                'email' => $assignment->student?->email ?? '',
            ]);

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    public function getKpiTrends(Request $request, $studentId)
    {
        $user = auth()->user();
        $isOwnData = (int)auth()->id() === (int)$studentId;
        $isAdmin = $user && $user->hasRole(['Admin', 'admin', 'Coach', 'coach', 'super_admin']);
        
        if (!$isOwnData && !$isAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $days = $request->get('days', 7);
        $startDate = now()->subDays($days);

        $logs = TrainingLog::where('student_id', $studentId)
            ->where('logged_at', '>=', $startDate)
            ->orderBy('logged_at')
            ->get()
            ->groupBy(fn($log) => $log->logged_at->format('D'));

        $labels = [];
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $labels[] = $date->format('D');
            
            $dayLogs = $logs[$date->format('D')] ?? collect();
            $avgCompliance = $dayLogs->isEmpty() ? 0 : $dayLogs->avg('compliance_score');
            $data[] = round($avgCompliance, 2);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Completion Rate',
                        'data' => $data,
                    ],
                ],
            ],
        ]);
    }

    public function getKpiComparison(Request $request, $studentId)
    {
        $user = auth()->user();
        $isOwnData = (int)auth()->id() === (int)$studentId;
        $isAdmin = $user && $user->hasRole(['Admin', 'admin', 'Coach', 'coach', 'super_admin']);
        
        if (!$isOwnData && !$isAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $compareType = $request->get('compare_to', 'target');
        $current = KpiCache::where('student_id', $studentId)
            ->where('date', now()->toDateString())
            ->first();

        if (!$current) {
            $current = $this->calculateKpis($studentId);
        }

        $target = [
            'trainingCompletionRate' => 90.0,
            'complianceScore' => 95.0,
        ];

        $variance = [
            'trainingCompletionRate' => ($current->completion_rate ?? 0) - $target['trainingCompletionRate'],
            'complianceScore' => ($current->compliance_score ?? 0) - $target['complianceScore'],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'current' => [
                    'trainingCompletionRate' => $current->completion_rate ?? 0,
                    'complianceScore' => $current->compliance_score ?? 0,
                ],
                'target' => $target,
                'variance' => $variance,
            ],
        ]);
    }

    public function getTeamAnalytics(Request $request, $teamId)
    {
        $user = auth()->user();
        $team = SportTeam::find($teamId);

        if (!$team) {
            return response()->json(['success' => false, 'message' => 'Team not found'], 404);
        }

        // Authorization: coaches assigned to the team, admins of same school, or super admin
        $isCoachOfTeam = method_exists($user, 'canManageTeam') ? $user->canManageTeam($team) : false;
        $isAdmin = $user && $user->hasRole(['Admin', 'super_admin']);
        $sameSchool = $isAdmin && ($user->hasRole('super_admin') || $user->school_id === $team->school_id);

        if (!($isCoachOfTeam || $sameSchool)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $perPage = $request->get('per_page', 20);
        $studentIds = $team->studentAssignments()->pluck('student_id');

        $studentMetrics = KpiCache::where('date', now()->toDateString())
            ->whereIn('student_id', $studentIds)
            ->with('student:id,name')
            ->orderByDesc('compliance_score')
            ->paginate($perPage);

        $avgCompletion = $studentMetrics->avg('completion_rate') ?? 0;
        $avgCompliance = $studentMetrics->avg('compliance_score') ?? 0;
        $avgConsistency = $studentMetrics->avg('consistency_index') ?? 0;
        $avgAttendance = $studentMetrics->avg('attendance_rate') ?? 0;

        // Team cache (ensure cached values available for lastUpdated)
        $teamKpiCache = TeamKpiCache::where('sport_team_id', $teamId)
            ->where('date', now()->toDateString())
            ->first();

        if (!$teamKpiCache) {
            $teamKpiCache = $this->calculateTeamKpis($teamId);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => [
                    'trainingCompletionRate' => round($avgCompletion, 2),
                    'complianceScore' => round($avgCompliance, 2),
                    'consistencyIndex' => round($avgConsistency, 2),
                    'performanceTrend' => $teamKpiCache->performance_trend ?? 0,
                    'attendanceRate' => round($avgAttendance, 2),
                    'averageSessionDuration' => $teamKpiCache->avg_session_duration ?? 0,
                    'totalMembers' => $teamKpiCache->total_members ?? $studentIds->count(),
                ],
                'studentMetrics' => $studentMetrics->map(fn($metric) => [
                    'student_id' => $metric->student_id,
                    'name' => $metric->student?->name ?? 'Unknown',
                    'completionRate' => $metric->completion_rate ?? 0,
                    'complianceScore' => $metric->compliance_score ?? 0,
                    'consistencyIndex' => $metric->consistency_index ?? 0,
                    'attendanceRate' => $metric->attendance_rate ?? 0,
                    'trend' => $metric->performance_trend ?? 0,
                ])->toArray(),
                'pagination' => [
                    'total' => $studentMetrics->total(),
                    'per_page' => $studentMetrics->perPage(),
                    'current_page' => $studentMetrics->currentPage(),
                ],
                'lastUpdated' => $teamKpiCache->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function getSchoolKpis(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user && $user->hasRole('super_admin');
        $isAdmin = $user && $user->hasRole('Admin');

        if (!$isAdmin && !$isSuperAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $schoolId = $request->get('school_id') ?? $user->school_id;

        if (!$schoolId) {
            return response()->json(['success' => false, 'message' => 'School ID is required'], 400);
        }

        if ($isAdmin && $user->school_id !== $schoolId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $school = School::find($schoolId);
        if (!$school) {
            return response()->json(['success' => false, 'message' => 'School not found'], 404);
        }

        $schoolKpiCache = SchoolKpiCache::where('school_id', $schoolId)
            ->where('date', now()->toDateString())
            ->first();

        if (!$schoolKpiCache) {
            $schoolKpiCache = $this->calculateSchoolKpis($schoolId);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => [
                    'trainingCompletionRate' => $schoolKpiCache->completion_rate ?? 0,
                    'complianceScore' => $schoolKpiCache->compliance_score ?? 0,
                    'consistencyIndex' => $schoolKpiCache->consistency_index ?? 0,
                    'performanceTrend' => $schoolKpiCache->performance_trend ?? 0,
                    'attendanceRate' => $schoolKpiCache->attendance_rate ?? 0,
                    'averageSessionDuration' => $schoolKpiCache->avg_session_duration ?? 0,
                    'totalStudents' => $schoolKpiCache->total_students ?? 0,
                    'totalTeams' => $schoolKpiCache->total_teams ?? 0,
                ],
                'lastUpdated' => $schoolKpiCache->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function getSchoolKpiTrends(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user && $user->hasRole('super_admin');
        $isAdmin = $user && $user->hasRole('Admin');

        if (!$isAdmin && !$isSuperAdmin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $schoolId = $request->get('school_id') ?? $user->school_id;

        if (!$schoolId) {
            return response()->json(['success' => false, 'message' => 'School ID is required'], 400);
        }

        if ($isAdmin && $user->school_id !== $schoolId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $days = $request->get('days', 7);
        $startDate = now()->subDays($days);

        $studentIds = User::where('school_id', $schoolId)->pluck('id');
        $logs = TrainingLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', $startDate)
            ->orderBy('logged_at')
            ->get()
            ->groupBy(fn($log) => $log->logged_at->format('D'));

        $labels = [];
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $labels[] = $date->format('D');

            $dayLogs = $logs[$date->format('D')] ?? collect();
            $avgCompliance = $dayLogs->isEmpty() ? 0 : $dayLogs->avg('compliance_score');
            $data[] = round($avgCompliance, 2);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'School Compliance',
                        'data' => $data,
                    ],
                ],
            ],
        ]);
    }

    private function calculateKpis($studentId)
    {
        $today = now()->toDateString();
        $completionRate = $this->calculateCompletionRate($studentId);
        $complianceScore = $this->calculateComplianceScore($studentId);
        $consistencyIndex = $this->calculateConsistencyIndex($studentId);
        $performanceTrend = $this->calculatePerformanceTrend($studentId);
        $attendanceRate = $this->calculateAttendanceRate($studentId);
        $avgDuration = $this->calculateAvgSessionDuration($studentId);

        return KpiCache::updateOrCreate(
            ['student_id' => $studentId, 'date' => $today],
            [
                'completion_rate' => $completionRate,
                'compliance_score' => $complianceScore,
                'consistency_index' => $consistencyIndex,
                'performance_trend' => $performanceTrend,
                'attendance_rate' => $attendanceRate,
                'avg_session_duration' => $avgDuration,
            ]
        );
    }

    private function calculateCompletionRate($studentId)
    {
        $assigned = TrainingLog::where('student_id', $studentId)->count();
        $completed = TrainingLog::where('student_id', $studentId)
            ->where('sets_completed', '>', 0)
            ->count();

        return $assigned > 0 ? round(($completed / $assigned) * 100, 2) : 0;
    }

    private function calculateComplianceScore($studentId)
    {
        $logs = TrainingLog::where('student_id', $studentId)->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('compliance_score'), 2);
    }

    private function calculateConsistencyIndex($studentId)
    {
        $sessionsThisWeek = TrainingLog::where('student_id', $studentId)
            ->where('logged_at', '>=', now()->startOfWeek())
            ->distinct('training_id')
            ->count();

        $targetSessions = 4;
        return round(($sessionsThisWeek / $targetSessions) * 100, 2);
    }

    private function calculatePerformanceTrend($studentId)
    {
        $thisWeekAvg = TrainingLog::where('student_id', $studentId)
            ->where('logged_at', '>=', now()->subWeek())
            ->avg('compliance_score') ?? 0;

        $lastWeekAvg = TrainingLog::where('student_id', $studentId)
            ->where('logged_at', '>=', now()->subWeeks(2))
            ->where('logged_at', '<', now()->subWeek())
            ->avg('compliance_score') ?? 0;

        if ($lastWeekAvg == 0) return 0;
        return round((($thisWeekAvg - $lastWeekAvg) / $lastWeekAvg) * 100, 2);
    }

    private function calculateAttendanceRate($studentId)
    {
        return 88.0; // Placeholder - implement based on schedule attendance
    }

    private function calculateAvgSessionDuration($studentId)
    {
        $logs = TrainingLog::where('student_id', $studentId)->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('duration_actual'), 0);
    }

    private function getMaxWeight($studentId)
    {
        return TrainingLog::where('student_id', $studentId)->max('weight_actual') ?? 0;
    }

    private function getMaxDuration($studentId)
    {
        return TrainingLog::where('student_id', $studentId)->max('duration_actual') ?? 0;
    }

    private function getAvgSleepQuality($studentId)
    {
        return 7.5; // Placeholder - implement from wellness_logs
    }

    private function getAvgSoreness($studentId)
    {
        return 3.2; // Placeholder - implement from wellness_logs
    }

    private function calculateTeamKpis($teamId)
    {
        $today = now()->toDateString();
        $team = SportTeam::find($teamId);

        if (!$team) {
            return null;
        }

        $studentIds = $team->studentAssignments()->pluck('student_id')->toArray();

        $completionRate = $this->calculateTeamCompletionRate($studentIds);
        $complianceScore = $this->calculateTeamComplianceScore($studentIds);
        $consistencyIndex = $this->calculateTeamConsistencyIndex($studentIds);
        $performanceTrend = $this->calculateTeamPerformanceTrend($studentIds);
        $attendanceRate = $this->calculateTeamAttendanceRate($studentIds);
        $avgDuration = $this->calculateTeamAvgSessionDuration($studentIds);

        return TeamKpiCache::updateOrCreate(
            ['sport_team_id' => $teamId, 'date' => $today],
            [
                'completion_rate' => $completionRate,
                'compliance_score' => $complianceScore,
                'consistency_index' => $consistencyIndex,
                'performance_trend' => $performanceTrend,
                'attendance_rate' => $attendanceRate,
                'avg_session_duration' => $avgDuration,
                'total_members' => count($studentIds),
            ]
        );
    }

    private function calculateSchoolKpis($schoolId)
    {
        $today = now()->toDateString();

        $studentIds = User::where('school_id', $schoolId)->pluck('id')->toArray();
        $teamCount = SportTeam::where('school_id', $schoolId)->count();

        $completionRate = $this->calculateTeamCompletionRate($studentIds);
        $complianceScore = $this->calculateTeamComplianceScore($studentIds);
        $consistencyIndex = $this->calculateTeamConsistencyIndex($studentIds);
        $performanceTrend = $this->calculateTeamPerformanceTrend($studentIds);
        $attendanceRate = $this->calculateTeamAttendanceRate($studentIds);
        $avgDuration = $this->calculateTeamAvgSessionDuration($studentIds);

        return SchoolKpiCache::updateOrCreate(
            ['school_id' => $schoolId, 'date' => $today],
            [
                'completion_rate' => $completionRate,
                'compliance_score' => $complianceScore,
                'consistency_index' => $consistencyIndex,
                'performance_trend' => $performanceTrend,
                'attendance_rate' => $attendanceRate,
                'avg_session_duration' => $avgDuration,
                'total_students' => count($studentIds),
                'total_teams' => $teamCount,
            ]
        );
    }

    private function calculateTeamCompletionRate($studentIds)
    {
        if (empty($studentIds)) return 0;

        $assigned = TrainingLog::whereIn('student_id', $studentIds)->count();
        $completed = TrainingLog::whereIn('student_id', $studentIds)
            ->where('sets_completed', '>', 0)
            ->count();

        return $assigned > 0 ? round(($completed / $assigned) * 100, 2) : 0;
    }

    private function calculateTeamComplianceScore($studentIds)
    {
        if (empty($studentIds)) return 0;

        $logs = TrainingLog::whereIn('student_id', $studentIds)->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('compliance_score'), 2);
    }

    private function calculateTeamConsistencyIndex($studentIds)
    {
        if (empty($studentIds)) return 0;

        $sessionsThisWeek = TrainingLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', now()->startOfWeek())
            ->distinct('training_id')
            ->count();

        $targetSessions = count($studentIds) * 4;
        return $targetSessions > 0 ? round(($sessionsThisWeek / $targetSessions) * 100, 2) : 0;
    }

    private function calculateTeamPerformanceTrend($studentIds)
    {
        if (empty($studentIds)) return 0;

        $thisWeekAvg = TrainingLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', now()->subWeek())
            ->avg('compliance_score') ?? 0;

        $lastWeekAvg = TrainingLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', now()->subWeeks(2))
            ->where('logged_at', '<', now()->subWeek())
            ->avg('compliance_score') ?? 0;

        if ($lastWeekAvg == 0) return 0;
        return round((($thisWeekAvg - $lastWeekAvg) / $lastWeekAvg) * 100, 2);
    }

    private function calculateTeamAttendanceRate($studentIds)
    {
        return 88.0;
    }

    private function calculateTeamAvgSessionDuration($studentIds)
    {
        if (empty($studentIds)) return 0;

        $logs = TrainingLog::whereIn('student_id', $studentIds)->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('duration_actual'), 0);
    }
}
