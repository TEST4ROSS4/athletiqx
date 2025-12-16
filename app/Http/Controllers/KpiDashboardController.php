<?php

namespace App\Http\Controllers;

use App\Models\KpiCache;
use App\Models\TeamKpiCache;
use App\Models\SchoolKpiCache;
use App\Models\TrainingLog;
use App\Models\User;
use App\Models\WellnessLog;
use App\Models\SportTeam;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KpiDashboardController extends Controller
{
    public function index(Request $request)
    {
        // If admin/super_admin and no student_id provided, get first available student
        if (auth()->user()->hasRole(['Admin', 'super_admin']) && !$request->has('student_id')) {
            $query = User::whereHas('roles', function ($q) {
                $q->where('name', 'Student');
            });
            
            // Super admins can see all students, school admins only their school
            if (!auth()->user()->hasRole('super_admin')) {
                $query->where('school_id', auth()->user()->school_id);
            }
            
            $firstStudent = $query->first();
            
            if (!$firstStudent) {
                return Inertia::render('KpiDashboard/Index', [
                    'student' => null,
                    'kpis' => [
                        'trainingCompletionRate' => 0,
                        'complianceScore' => 0,
                        'consistencyIndex' => 0,
                        'performanceTrend' => 0,
                        'attendanceRate' => 0,
                        'averageSessionDuration' => 0,
                        'personalRecords' => ['maxWeight' => 0, 'maxTime' => 0],
                        'recoveryMetrics' => ['sleepQuality' => 0, 'soreness' => 0],
                    ],
                    'trends' => ['labels' => [], 'datasets' => []],
                    'comparison' => ['current' => [], 'target' => [], 'variance' => []],
                    'lastUpdated' => now()->toIso8601String(),
                    'message' => 'No students found',
                ]);
            }
            
            return redirect()->route('kpi-dashboard.index', ['student_id' => $firstStudent->id]);
        }

        $studentId = $request->get('student_id', auth()->id());

        // Authorization check
        if (auth()->id() !== $studentId && !auth()->user()->hasRole(['Admin', 'super_admin'])) {
            abort(403, 'Unauthorized');
        }

        $student = User::find($studentId);
        if (!$student) {
            abort(404, 'Student not found');
        }

        $kpiCache = KpiCache::where('student_id', $studentId)
            ->where('date', now()->toDateString())
            ->first();

        if (!$kpiCache) {
            $kpiCache = $this->calculateKpis($studentId);
        }

        $trends = $this->getKpiTrends($studentId, 7);
        $comparison = $this->getKpiComparison($studentId);

        return Inertia::render('KpiDashboard/Index', [
            'student' => $student,
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
            'trends' => $trends,
            'comparison' => $comparison,
            'lastUpdated' => $kpiCache->updated_at?->toIso8601String(),
        ]);
    }

    public function teamLanding(Request $request)
    {
        $user = $request->user();

        // Super admins and admins can view all teams; coaches only their assigned teams
        $teamQuery = SportTeam::query();

        if ($user->hasRole('Coach')) {
            $teamIds = $user->assignedTeams()->pluck('id');
            $teamQuery->whereIn('id', $teamIds);
        }

        $firstTeam = $teamQuery->first();

        if (!$firstTeam) {
            return Inertia::render('KpiDashboard/TeamKpi', [
                'team' => null,
                'kpis' => [],
                'trends' => ['labels' => [], 'datasets' => []],
                'studentMetrics' => [],
                'lastUpdated' => now()->toIso8601String(),
                'message' => 'No teams available.',
            ]);
        }

        return redirect()->route('kpi-dashboard.team', ['teamId' => $firstTeam->id]);
    }

    public function teamKpi(Request $request, $teamId)
    {
        $team = SportTeam::find($teamId);
        if (!$team) {
            abort(404, 'Team not found');
        }

        // Authorization check
        if (!auth()->user()->canManageTeam($team) && !auth()->user()->hasRole(['Admin', 'super_admin'])) {
            abort(403, 'Unauthorized');
        }

        $teamKpiCache = TeamKpiCache::where('sport_team_id', $teamId)
            ->where('date', now()->toDateString())
            ->first();

        if (!$teamKpiCache) {
            $teamKpiCache = $this->calculateTeamKpis($teamId);
        }

        $trends = $this->getTeamKpiTrends($teamId, 7);
        $studentMetrics = $this->getTeamStudentMetrics($teamId);

        return Inertia::render('KpiDashboard/TeamKpi', [
            'team' => $team,
            'kpis' => [
                'completionRate' => $teamKpiCache->completion_rate ?? 0,
                'complianceScore' => $teamKpiCache->compliance_score ?? 0,
                'consistencyIndex' => $teamKpiCache->consistency_index ?? 0,
                'performanceTrend' => $teamKpiCache->performance_trend ?? 0,
                'attendanceRate' => $teamKpiCache->attendance_rate ?? 0,
                'averageSessionDuration' => $teamKpiCache->avg_session_duration ?? 0,
                'totalMembers' => $teamKpiCache->total_members ?? 0,
            ],
            'trends' => $trends,
            'studentMetrics' => $studentMetrics,
            'lastUpdated' => $teamKpiCache->updated_at?->toIso8601String(),
        ]);
    }

    public function schoolKpi(Request $request)
    {
        // Authorization check
        if (!auth()->user()->hasRole(['Admin', 'super_admin'])) {
            abort(403, 'Unauthorized');
        }

        // Get school ID from request or use user's school
        $schoolId = $request->get('school_id') ?? auth()->user()->school_id;

        // If admin has no school yet, prompt to create/assign
        if (!$schoolId && auth()->user()->hasRole('Admin')) {
            return redirect()
                ->route('schools.create')
                ->with('error', 'Please create your school before viewing School KPI.');
        }

        // For super admins with no school_id provided, pick first available
        if (!$schoolId && auth()->user()->hasRole('super_admin')) {
            $firstSchool = School::first();
            if (!$firstSchool) {
                return Inertia::render('KpiDashboard/SchoolKpi', [
                    'school' => null,
                    'kpis' => [
                        'completionRate' => 0,
                        'complianceScore' => 0,
                        'consistencyIndex' => 0,
                        'performanceTrend' => 0,
                        'attendanceRate' => 0,
                        'averageSessionDuration' => 0,
                        'totalStudents' => 0,
                        'totalTeams' => 0,
                    ],
                    'trends' => ['labels' => [], 'datasets' => []],
                    'teamMetrics' => [],
                    'lastUpdated' => now()->toIso8601String(),
                    'message' => 'No schools found. Please create a school first.',
                ]);
            }
            $schoolId = $firstSchool->id;
        }

        if (!$schoolId) {
            abort(400, 'School ID is required');
        }

        // School admins can only view their own school
        if (auth()->user()->hasRole('Admin') && auth()->user()->school_id !== $schoolId) {
            abort(403, 'Unauthorized');
        }

        $school = School::find($schoolId);
        if (!$school) {
            abort(404, 'School not found');
        }

        $schoolKpiCache = SchoolKpiCache::where('school_id', $schoolId)
            ->where('date', now()->toDateString())
            ->first();

        if (!$schoolKpiCache) {
            $schoolKpiCache = $this->calculateSchoolKpis($schoolId);
        }

        $trends = $this->getSchoolKpiTrends($schoolId, 7);
        $teamMetrics = $this->getSchoolTeamMetrics($schoolId);

        return Inertia::render('KpiDashboard/SchoolKpi', [
            'school' => $school,
            'kpis' => [
                'completionRate' => $schoolKpiCache->completion_rate ?? 0,
                'complianceScore' => $schoolKpiCache->compliance_score ?? 0,
                'consistencyIndex' => $schoolKpiCache->consistency_index ?? 0,
                'performanceTrend' => $schoolKpiCache->performance_trend ?? 0,
                'attendanceRate' => $schoolKpiCache->attendance_rate ?? 0,
                'averageSessionDuration' => $schoolKpiCache->avg_session_duration ?? 0,
                'totalStudents' => $schoolKpiCache->total_students ?? 0,
                'totalTeams' => $schoolKpiCache->total_teams ?? 0,
            ],
            'trends' => $trends,
            'teamMetrics' => $teamMetrics,
            'lastUpdated' => $schoolKpiCache->updated_at?->toIso8601String(),
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

    private function calculateAttendanceRate($studentId, $days = 7)
    {
        $windowStart = now()->subDays($days - 1)->startOfDay();

        $uniqueDays = WellnessLog::where('student_id', $studentId)
            ->where('logged_at', '>=', $windowStart)
            ->get()
            ->map(fn ($log) => optional($log->logged_at ?? $log->created_at)?->toDateString())
            ->filter()
            ->unique()
            ->count();

        return $days > 0 ? round(($uniqueDays / $days) * 100, 2) : 0;
    }

    private function calculateAvgSessionDuration($studentId)
    {
        $logs = TrainingLog::where('student_id', $studentId)->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('duration_actual'), 0);
    }

    private function getMaxWeight($studentId)
    {
        return TrainingLog::where('student_id', $studentId)
            ->whereNotNull('weight_actual')
            ->max('weight_actual') ?? 0;
    }

    private function getMaxDuration($studentId)
    {
        return TrainingLog::where('student_id', $studentId)
            ->whereNotNull('duration_actual')
            ->max('duration_actual') ?? 0;
    }

    private function getAvgSleepQuality($studentId)
    {
        return 7.5;
    }

    private function getAvgSoreness($studentId)
    {
        return 3.2;
    }

    private function calculateTeamKpis($teamId)
    {
        $today = now()->toDateString();
        $team = SportTeam::find($teamId);
        
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

    private function calculateTeamAttendanceRate($studentIds, $days = 7)
    {
        if (empty($studentIds)) {
            return 0;
        }

        $rates = array_map(
            fn ($studentId) => $this->calculateAttendanceRate($studentId, $days),
            $studentIds
        );

        return round(array_sum($rates) / count($rates), 2);
    }

    private function calculateTeamAvgSessionDuration($studentIds)
    {
        if (empty($studentIds)) return 0;
        
        $logs = TrainingLog::whereIn('student_id', $studentIds)->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('duration_actual'), 0);
    }

    private function getTeamKpiTrends($teamId, $days)
    {
        $team = SportTeam::find($teamId);
        $studentIds = $team->studentAssignments()->pluck('student_id')->toArray();
        
        $startDate = now()->subDays($days);

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

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Team Compliance',
                    'data' => $data,
                ],
            ],
        ];
    }

    private function getSchoolKpiTrends($schoolId, $days)
    {
        $studentIds = User::where('school_id', $schoolId)->pluck('id')->toArray();
        
        $startDate = now()->subDays($days);

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

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'School Compliance',
                    'data' => $data,
                ],
            ],
        ];
    }

    private function getTeamStudentMetrics($teamId)
    {
        $team = SportTeam::find($teamId);
        $studentIds = $team->studentAssignments()->pluck('student_id')->toArray();

        $metrics = KpiCache::whereIn('student_id', $studentIds)
            ->where('date', now()->toDateString())
            ->with('student:id,name')
            ->orderByDesc('compliance_score')
            ->get();

        return $metrics->map(fn($metric) => [
            'student_id' => $metric->student_id,
            'name' => $metric->student?->name ?? 'Unknown',
            'completionRate' => $metric->completion_rate ?? 0,
            'complianceScore' => $metric->compliance_score ?? 0,
            'consistencyIndex' => $metric->consistency_index ?? 0,
            'attendanceRate' => $metric->attendance_rate ?? 0,
            'trend' => $metric->performance_trend ?? 0,
        ])->toArray();
    }

    private function getSchoolTeamMetrics($schoolId)
    {
        $teams = SportTeam::where('school_id', $schoolId)->get();

        $metrics = TeamKpiCache::whereIn('sport_team_id', $teams->pluck('id'))
            ->where('date', now()->toDateString())
            ->with('sportTeam:id,name')
            ->orderByDesc('compliance_score')
            ->get();

        return $metrics->map(fn($metric) => [
            'team_id' => $metric->sport_team_id,
            'name' => $metric->sportTeam?->name ?? 'Unknown',
            'completionRate' => $metric->completion_rate ?? 0,
            'complianceScore' => $metric->compliance_score ?? 0,
            'consistencyIndex' => $metric->consistency_index ?? 0,
            'attendanceRate' => $metric->attendance_rate ?? 0,
            'trend' => $metric->performance_trend ?? 0,
            'totalMembers' => $metric->total_members ?? 0,
        ])->toArray();
    }

    private function getKpiTrends($studentId, $days)
    {
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

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Completion Rate',
                    'data' => $data,
                ],
            ],
        ];
    }

    private function getKpiComparison($studentId)
    {
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

        return [
            'current' => [
                'trainingCompletionRate' => $current->completion_rate ?? 0,
                'complianceScore' => $current->compliance_score ?? 0,
            ],
            'target' => $target,
            'variance' => $variance,
        ];
    }
}
