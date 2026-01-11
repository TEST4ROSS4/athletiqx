<?php

namespace App\Http\Controllers;

use App\Models\KpiCache;
use App\Models\TeamKpiCache;
use App\Models\SchoolKpiCache;
use App\Models\TrainingLog;
use App\Models\ExerciseLog;
use App\Models\ProgramAssignment;
use App\Models\User;
use App\Models\WellnessLog;
use App\Models\SportTeam;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
                        'sleepQuality' => 0,
                        'soreness' => 0,
                        'energy' => 0,
                        'mood' => 0,
                        'readiness' => 0,
                        'hydration' => 0,
                    ],
                    'trends' => ['labels' => [], 'datasets' => []],
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

        $wellnessMetrics = $this->calculateWellnessAverages([$studentId]);
        $trends = $this->getWellnessTrends([$studentId], 7);

        $wellnessLogsLast7d = WellnessLog::where('student_id', $studentId)
            ->where('logged_at', '>=', now()->subDays(7))
            ->count();

        $latestWellnessLog = WellnessLog::where('student_id', $studentId)
            ->orderByDesc('logged_at')
            ->first();

        return Inertia::render('KpiDashboard/Index', [
            'student' => $student,
            'kpis' => $wellnessMetrics,
            'trends' => $trends,
            'logSnapshot' => [
                'wellnessLast7d' => $wellnessLogsLast7d,
                'latestWellnessAt' => optional($latestWellnessLog?->logged_at ?? $latestWellnessLog?->created_at)?->toIso8601String(),
            ],
            'lastUpdated' => now()->toIso8601String(),
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

        $studentIds = $team->studentAssignments()->pluck('student_id')->toArray();

        // Calculate comprehensive KPI data using the shared comparison logic
        $kpiData = $this->getComparisonKpi($studentIds);
        
        // Get individual student metrics for the table
        $studentMetrics = $this->getTeamStudentWellnessMetrics($teamId);

        return Inertia::render('KpiDashboard/TeamKpi', [
            'team' => $team,
            'kpi' => $kpiData,
            'studentMetrics' => $studentMetrics,
            'lastUpdated' => now()->toIso8601String(),
        ]);
    }

    private function calculateWellnessAverages(array $studentIds): array
    {
        if (empty($studentIds)) {
            return [
                'sleepQuality' => 0,
                'soreness' => 0,
                'energy' => 0,
                'mood' => 0,
                'readiness' => 0,
                'hydration' => 0,
            ];
        }

        $logs = WellnessLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', now()->subDays(7))
            ->get();

        return [
            'sleepQuality' => round($logs->avg('sleep_quality') ?? 0, 2),
            'soreness' => round($logs->avg('recovery_soreness') ?? 0, 2),
            'energy' => round($logs->avg('energy_level') ?? 0, 2),
            'mood' => round($logs->avg('mood') ?? 0, 2),
            'readiness' => round($logs->avg('readiness_to_train') ?? 0, 2),
            'hydration' => round($logs->avg('hydration_level') ?? 0, 2),
        ];
    }

    private function buildWellnessSnapshot(array $studentIds): array
    {
        if (empty($studentIds)) {
            return [
                'wellnessLast7d' => 0,
                'latestWellnessAt' => null,
            ];
        }

        $wellnessLast7d = WellnessLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', now()->subDays(7))
            ->count();

        $latestWellnessLog = WellnessLog::whereIn('student_id', $studentIds)
            ->orderByDesc('logged_at')
            ->first();

        return [
            'wellnessLast7d' => $wellnessLast7d,
            'latestWellnessAt' => optional($latestWellnessLog?->logged_at ?? $latestWellnessLog?->created_at)?->toIso8601String(),
        ];
    }

    private function getWellnessTrends(array $studentIds, int $days = 7): array
    {
        if (empty($studentIds)) {
            return ['labels' => [], 'datasets' => []];
        }

        $startDate = now()->subDays($days);
        $logs = WellnessLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', $startDate)
            ->orderBy('logged_at')
            ->get()
            ->groupBy(fn($log) => $log->logged_at->format('D'));

        $assignments = ProgramAssignment::whereIn('student_id', $studentIds)
            ->where('assigned_at', '>=', $startDate)
            ->get()
            ->groupBy(fn($assignment) => $assignment->assigned_at->format('D'));

        $trainingLogs = TrainingLog::whereIn('student_id', $studentIds)
            ->where(function ($q) use ($startDate) {
                $q->whereNotNull('logged_at')->where('logged_at', '>=', $startDate);
            })
            ->orWhere(function ($q) use ($studentIds, $startDate) {
                $q->whereIn('student_id', $studentIds)
                    ->whereNull('logged_at')
                    ->where('created_at', '>=', $startDate);
            })
            ->get()
            ->groupBy(fn($log) => optional($log->logged_at ?? $log->created_at)?->format('D') ?? '');

        $labels = [];
        $sleepData = [];
        $exerciseCompletionData = [];
        $activeDaysData = [];
        $weightVolumeData = [];
        $repsVolumeData = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $labels[] = $date->format('D');

            $dayLogs = $logs[$date->format('D')] ?? collect();
            $avgSleep = $dayLogs->isEmpty() ? 0 : $dayLogs->avg('sleep_quality');
            $sleepData[] = round($avgSleep, 2);

            $dayAssignments = $assignments[$date->format('D')] ?? collect();
            $assignedCount = $dayAssignments->count();
            $completedCount = $dayAssignments->where('status', 'Completed')->count();
            $exerciseCompletionData[] = $assignedCount > 0 ? round(($completedCount / $assignedCount) * 100, 2) : 0;

            $trainingDayLogs = $trainingLogs[$date->format('D')] ?? collect();
            $activeDaysData[] = $trainingDayLogs->isEmpty() ? 0 : 1;
            $weightVolumeData[] = $trainingDayLogs->sum('weight_actual');
            $repsVolumeData[] = $trainingDayLogs->sum('reps_completed');
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Sleep Quality',
                    'data' => $sleepData,
                ],
                [
                    'label' => 'Exercise Completion %',
                    'data' => $exerciseCompletionData,
                ],
                [
                    'label' => 'Active Days (exercise)',
                    'data' => $activeDaysData,
                ],
                [
                    'label' => 'Weight Volume',
                    'data' => $weightVolumeData,
                ],
                [
                    'label' => 'Reps Volume',
                    'data' => $repsVolumeData,
                ],
            ],
        ];
    }

    private function getTeamStudentWellnessMetrics($teamId): array
    {
        $team = SportTeam::find($teamId);
        if (!$team) {
            return [];
        }

        $studentIds = $team->studentAssignments()->pluck('student_id')->toArray();
        $metrics = [];

        foreach ($studentIds as $studentId) {
            $student = User::find($studentId);
            $avg = $this->calculateWellnessAverages([$studentId]);
            $metrics[] = [
                'student_id' => $studentId,
                'name' => $student?->name ?? 'Unknown',
                'sleepQuality' => $avg['sleepQuality'],
                'soreness' => $avg['soreness'],
                'energy' => $avg['energy'],
                'mood' => $avg['mood'],
                'readiness' => $avg['readiness'],
                'hydration' => $avg['hydration'],
            ];
        }

        usort($metrics, fn($a, $b) => $b['sleepQuality'] <=> $a['sleepQuality']);
        return $metrics;
    }
    public function schoolKpi(Request $request)
    {
        // Authorization check
        if (!auth()->user()->hasRole(['Admin', 'super_admin'])) {
            abort(403, 'Unauthorized');
        }

        // Collect schools list for super admins to pick (including "All")
        $schools = auth()->user()->hasRole('super_admin')
            ? School::select('id', 'name')->orderBy('name')->get()
            : collect();

        // Get school ID from request or use user's school; super admins default to "all"
        $rawSchoolId = $request->get('school_id');
        $schoolId = auth()->user()->hasRole('super_admin')
            ? ($rawSchoolId ?? 'all')
            : ($rawSchoolId ?? auth()->user()->school_id);

        // If admin has no school yet, prompt to create/assign
        if (!$schoolId && auth()->user()->hasRole('Admin')) {
            return redirect()
                ->route('schools.create')
                ->with('error', 'Please create your school before viewing School KPI.');
        }

        // School admins can only view their own school
        if (auth()->user()->hasRole('Admin') && auth()->user()->school_id !== $schoolId) {
            abort(403, 'Unauthorized');
        }

        // Handle "all" aggregate for super admin
        $isAllSchools = auth()->user()->hasRole('super_admin') && ($schoolId === 'all' || $schoolId === null);

        if ($isAllSchools) {
            $studentIds = User::pluck('id')->toArray();
            $school = (object) ['id' => null, 'name' => 'All Schools'];
            $teamMetrics = [];
        } else {
            if (!$schoolId) {
                abort(400, 'School ID is required');
            }

            $school = School::find($schoolId);
            if (!$school) {
                abort(404, 'School not found');
            }

            $studentIds = User::where('school_id', $schoolId)->pluck('id')->toArray();
            $teamMetrics = $this->getSchoolTeamMetrics($schoolId);
        }

        // Calculate comprehensive KPI data for the new dashboard design
        $kpiData = $this->getComparisonKpi($studentIds);

        return Inertia::render('KpiDashboard/SchoolKpi', [
            'school' => $school,
            'kpi' => $kpiData, // New structured data
            'teamMetrics' => $teamMetrics,
            'lastUpdated' => now()->toIso8601String(),
            'schools' => $schools,
            'selectedSchoolId' => $schoolId,
        ]);
    }

    private function getComparisonKpi(array $studentIds)
    {
        if (empty($studentIds)) {
            return [
                'exercise' => [
                    'week' => [
                        'total_logs' => 0,
                        'completed_logs' => 0,
                        'completion_rate' => 0,
                        'proof_logs' => 0,
                        'proof_rate' => 0,
                        'active_athletes' => 0,
                        'session_density' => 0,
                    ],
                    'previous' => ['completion_rate' => 0, 'proof_rate' => 0, 'session_density' => 0],
                    'daily' => ['labels' => [], 'completion_rate' => []],
                ],
                'wellness' => [
                    'week' => [
                        'readiness_avg' => 0,
                        'energy_avg' => 0,
                        'mood_avg' => 0,
                        'soreness_avg' => 0,
                        'sleep_hours_avg' => 0,
                        'sleep_quality_avg' => 0,
                        'hydration_avg' => 0,
                        'injury_flags' => 0,
                        'active_athletes' => 0,
                    ],
                    'previous' => ['readiness_avg' => 0, 'energy_avg' => 0, 'soreness_avg' => 0],
                    'daily' => ['labels' => [], 'readiness' => [], 'energy' => [], 'soreness' => []],
                ],
                'recency' => ['last_log_at' => null, 'days_since_last' => null],
                'window' => ['current_start' => now()->subDays(6)->toDateString(), 'current_end' => now()->toDateString()],
            ];
        }

        $now = now();
        $currentStart = $now->copy()->subDays(6)->startOfDay(); // Last 7 days including today
        $currentEnd = $now->copy()->endOfDay();
        
        $prevStart = $now->copy()->subDays(13)->startOfDay();
        $prevEnd = $now->copy()->subDays(7)->endOfDay();

        // Helper to calculate average of a field
        $calcAvg = fn($collection, $field) => $collection->isEmpty() ? 0 : round($collection->avg($field), 1);

        // --- WELLNESS ---
        $wellnessLogs = WellnessLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', $prevStart)
            ->get();

        $currentWellness = $wellnessLogs->whereBetween('logged_at', [$currentStart, $currentEnd]);
        $prevWellness = $wellnessLogs->whereBetween('logged_at', [$prevStart, $prevEnd]);

        $wellnessWeek = [
            'readiness_avg' => $calcAvg($currentWellness, 'readiness_to_train'),
            'energy_avg' => $calcAvg($currentWellness, 'energy_level'),
            'mood_avg' => $calcAvg($currentWellness, 'mood'),
            'soreness_avg' => $calcAvg($currentWellness, 'recovery_soreness'),
            'sleep_hours_avg' => $calcAvg($currentWellness, 'sleep_hours'),
            'sleep_quality_avg' => $calcAvg($currentWellness, 'sleep_quality'),
            'hydration_avg' => $calcAvg($currentWellness, 'hydration_level'),
            'injury_flags' => $currentWellness->whereNotNull('injury_status')->where('injury_status', '!=', 'No Injury')->count(),
            'active_athletes' => $currentWellness->unique('student_id')->count(),
        ];

        $wellnessPrev = [
            'readiness_avg' => $calcAvg($prevWellness, 'readiness_to_train'),
            'energy_avg' => $calcAvg($prevWellness, 'energy_level'),
            'soreness_avg' => $calcAvg($prevWellness, 'recovery_soreness'),
        ];

        // Daily Wellness Trends
        $dailyLabels = [];
        $dailyReadiness = [];
        $dailyEnergy = [];
        $dailySoreness = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $dateStr = $date->toDateString();
            $dailyLabels[] = $date->format('M d'); // e.g. "Dec 19"
            
            $dayLogs = $currentWellness->filter(fn($l) => $l->logged_at->isSameDay($date));
            $dailyReadiness[] = $calcAvg($dayLogs, 'readiness_to_train');
            $dailyEnergy[] = $calcAvg($dayLogs, 'energy_level');
            $dailySoreness[] = $calcAvg($dayLogs, 'recovery_soreness');
        }

        // --- EXERCISE ---
        // Completion Rate: ProgramAssignment status='Completed' OR marked_done_at within window
        $assignments = ProgramAssignment::whereIn('student_id', $studentIds)
            ->whereNotNull('assigned_at')
            ->where('assigned_at', '>=', $prevStart)
            ->get();

        $calcCompletion = function($logs) {
            $assigned = $logs->count();
            $completed = $logs->filter(function ($a) {
                $done = $a->status === 'Completed';
                $marked = !empty($a->marked_done_at);
                return $done || $marked;
            })->count();
            return $assigned > 0 ? round(($completed / $assigned) * 100, 1) : 0;
        };

        $currentAssignments = $assignments->whereBetween('assigned_at', [$currentStart, $currentEnd]);
        $prevAssignments = $assignments->whereBetween('assigned_at', [$prevStart, $prevEnd]);

        $completionRateWeek = $calcCompletion($currentAssignments);
        $completionRatePrev = $calcCompletion($prevAssignments);

        // Proof Rate & Session Density: ExerciseLog
        $exerciseLogs = ExerciseLog::whereHas('assignment', function($q) use ($studentIds) {
            $q->whereIn('student_id', $studentIds);
        })->where('created_at', '>=', $prevStart)->get();

        $currentExercise = $exerciseLogs->whereBetween('created_at', [$currentStart, $currentEnd]);
        $prevExercise = $exerciseLogs->whereBetween('created_at', [$prevStart, $prevEnd]);

        $calcProof = function($logs) {
            $completed = $logs->where('marked_as_done', true)->count();
            $withProof = $logs->where('marked_as_done', true)->whereNotNull('proof_url')->count();
            return $completed > 0 ? round(($withProof / $completed) * 100, 1) : 0;
        };

        $calcDensity = function($logs) use ($studentIds) {
            // Density: Total sets (logs) / Total athletes (active or total? design says sets/athlete)
            // Using total potential students to normalize, or active ones?
            // "1 sets/athlete" implies volume per person. Let's use total students in scope.
            $count = count($studentIds);
            return $count > 0 ? round($logs->count() / $count, 1) : 0;
        };

        $exerciseWeek = [
            'total_logs' => $currentAssignments->count(), // Total assigned sessions
            'completed_logs' => $currentAssignments->where('status', 'Completed')->count(), // Completed sessions
            'completion_rate' => $completionRateWeek,
            'proof_logs' => $currentExercise->where('marked_as_done', true)->whereNotNull('proof_url')->count(),
            'proof_rate' => $calcProof($currentExercise),
            'active_athletes' => $currentExercise->unique(fn($l) => $l->assignment->student_id)->count(),
            'session_density' => $calcDensity($currentExercise),
        ];

        $exercisePrev = [
            'completion_rate' => $completionRatePrev,
            'proof_rate' => $calcProof($prevExercise),
            'session_density' => $calcDensity($prevExercise),
        ];

        // Daily Exercise Trends
        $dailyCompletion = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $dayAssignments = $currentAssignments->filter(fn($a) => $a->assigned_at->isSameDay($date));
            $dailyCompletion[] = $calcCompletion($dayAssignments);
        }

        // Training KPIs (compliance, consistency, duration) over current window
        $trainingLogsCurrent = TrainingLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', $currentStart)
            ->get();

        $trainingLogsPrev = TrainingLog::whereIn('student_id', $studentIds)
            ->whereBetween('logged_at', [$prevStart, $prevEnd])
            ->get();

        $complianceWeek = $trainingLogsCurrent->isEmpty() ? 0 : round($trainingLogsCurrent->avg('compliance_score'), 1);
        $compliancePrev = $trainingLogsPrev->isEmpty() ? 0 : round($trainingLogsPrev->avg('compliance_score'), 1);

        $sessionsThisWeek = $trainingLogsCurrent->unique('training_id')->count();
        $sessionsPrev = $trainingLogsPrev->unique('training_id')->count();
        $targetSessions = count($studentIds) * 4;
        $consistencyWeek = $targetSessions > 0 ? round(($sessionsThisWeek / $targetSessions) * 100, 1) : 0;
        $consistencyPrev = $targetSessions > 0 ? round(($sessionsPrev / $targetSessions) * 100, 1) : 0;

        $avgDurationWeek = $trainingLogsCurrent->isEmpty() ? 0 : round($trainingLogsCurrent->avg('duration_actual'), 0);
        $avgDurationPrev = $trainingLogsPrev->isEmpty() ? 0 : round($trainingLogsPrev->avg('duration_actual'), 0);

        // Recency
        $lastLog = $currentWellness->sortByDesc('logged_at')->first();

        return [
            'exercise' => [
                'week' => $exerciseWeek,
                'previous' => $exercisePrev,
                'daily' => [
                    'labels' => $dailyLabels,
                    'completion_rate' => $dailyCompletion,
                ],
            ],
            'training' => [
                'week' => [
                    'completion_rate' => $completionRateWeek,
                    'compliance_score' => $complianceWeek,
                    'consistency_index' => $consistencyWeek,
                    'avg_session_duration' => $avgDurationWeek,
                ],
                'previous' => [
                    'completion_rate' => $completionRatePrev,
                    'compliance_score' => $compliancePrev,
                    'consistency_index' => $consistencyPrev,
                    'avg_session_duration' => $avgDurationPrev,
                ],
            ],
            'wellness' => [
                'week' => $wellnessWeek,
                'previous' => $wellnessPrev,
                'daily' => [
                    'labels' => $dailyLabels,
                    'readiness' => $dailyReadiness,
                    'energy' => $dailyEnergy,
                    'soreness' => $dailySoreness,
                ],
            ],
            'recency' => [
                'last_log_at' => $lastLog ? $lastLog->logged_at->toIso8601String() : null,
                'days_since_last' => $lastLog ? round($now->diffInDays($lastLog->logged_at), 1) : null,
            ],
            'window' => [
                'current_start' => $currentStart->toDateString(),
                'current_end' => $currentEnd->toDateString(),
            ],
        ];
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
        $assigned = ProgramAssignment::where('student_id', $studentId)->count();
        $completed = ProgramAssignment::where('student_id', $studentId)
            ->where(function ($q) {
                $q->where('status', 'Completed')
                  ->orWhereNotNull('marked_done_at');
            })
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
        $windowStart = now()->startOfWeek();
        $sessionsThisWeek = TrainingLog::where('student_id', $studentId)
            ->where(function ($q) use ($windowStart) {
                $q->where('logged_at', '>=', $windowStart)
                    ->orWhere(function ($qq) use ($windowStart) {
                        $qq->whereNull('logged_at')->where('created_at', '>=', $windowStart);
                    });
            })
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

    private function calculateAttendanceRate($studentId, $days = 7, $baselineStudentIds = null)
    {
        $logs = WellnessLog::where('student_id', $studentId)
            ->orderBy('logged_at')
            ->orderBy('created_at')
            ->get();

        if ($logs->isEmpty()) {
            return 0;
        }

        if ($logs->count() === 1) {
            return 100;
        }

        $firstTimestamp = $logs->first()->logged_at ?? $logs->first()->created_at;
        if (!$firstTimestamp) {
            return 0;
        }

        $startDate = $firstTimestamp->copy()->startOfDay();
        $today = now()->startOfDay();
        $totalDays = $startDate->diffInDays($today) + 1;

        $uniqueDays = $logs
            ->map(fn ($log) => optional($log->logged_at ?? $log->created_at)?->toDateString())
            ->filter()
            ->unique()
            ->count();

        return $totalDays > 0 ? round(($uniqueDays / $totalDays) * 100, 2) : 0;
    }

    private function calculateAvgSessionDuration($studentId)
    {
        $logs = TrainingLog::where('student_id', $studentId)->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('duration_actual'), 0);
    }

    /**
     * Exercise metrics (training + exercise logs) for a set of students.
     */
    private function calculateExerciseMetrics(array $studentIds, int $days = 7): array
    {
        if (empty($studentIds)) {
            return [
                'exerciseCompletion' => 0,
                'proofCoverage' => 0,
                'totalLogs' => 0,
                'recency' => [
                    'lastLogAt' => null,
                    'logsLast7d' => 0,
                    'activeDays' => 0,
                ],
                'exerciseVolume' => [
                    'weight' => 0,
                    'reps' => 0,
                    'duration' => 0,
                ],
            ];
        }

        $windowStart = now()->subDays($days - 1)->startOfDay();

        $assignedWindow = ProgramAssignment::whereIn('student_id', $studentIds)
            ->whereNotNull('assigned_at')
            ->where('assigned_at', '>=', $windowStart)
            ->count();
        $completedWindow = ProgramAssignment::whereIn('student_id', $studentIds)
            ->where(function ($q) use ($windowStart) {
                $q->where(function ($qq) use ($windowStart) {
                    $qq->where('status', 'Completed')
                       ->whereNotNull('assigned_at')
                       ->where('assigned_at', '>=', $windowStart);
                })->orWhere(function ($qq) use ($windowStart) {
                    $qq->whereNotNull('marked_done_at')
                       ->where('marked_done_at', '>=', $windowStart);
                });
            })
            ->count();
        $exerciseCompletion = $assignedWindow > 0 ? round(($completedWindow / $assignedWindow) * 100, 2) : 0;

        $exerciseLogsBase = ExerciseLog::whereHas('assignment', function ($q) use ($studentIds) {
            $q->whereIn('student_id', $studentIds);
        });

        $exerciseLogsWindow = (clone $exerciseLogsBase)
            ->where('created_at', '>=', $windowStart);

        $logsLast7d = $exerciseLogsWindow->count();
        $completedWithProof = (clone $exerciseLogsWindow)
            ->where('marked_as_done', true)
            ->whereNotNull('proof_url')
            ->count();
        $completedLogs = (clone $exerciseLogsWindow)
            ->where('marked_as_done', true)
            ->count();

        $proofCoverage = $completedLogs > 0 ? round(($completedWithProof / max($completedLogs, 1)) * 100, 2) : 0;

        $activeDays = (clone $exerciseLogsWindow)
            ->selectRaw('DATE(created_at) as day')
            ->pluck('day')
            ->unique()
            ->count();

        $lastLog = (clone $exerciseLogsBase)
            ->latest('created_at')
            ->first();

        $exerciseVolume = [
            'weight' => 0,
            'reps' => 0,
            'duration' => 0,
        ];

        return [
            'exerciseCompletion' => $exerciseCompletion,
            'proofCoverage' => $proofCoverage,
            'totalLogs' => $logsLast7d,
            'recency' => [
                'lastLogAt' => optional($lastLog?->created_at ?? $lastLog?->updated_at)?->toIso8601String(),
                'logsLast7d' => $logsLast7d,
                'activeDays' => $activeDays,
            ],
            'exerciseVolume' => $exerciseVolume,
        ];
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

    private function getAvgSleepQuality($studentId, $days = 30)
    {
        $windowStart = now()->subDays($days);
        
        $avg = WellnessLog::where('student_id', $studentId)
            ->where('logged_at', '>=', $windowStart)
            ->avg('sleep_quality');
        
        return $avg ? round($avg, 1) : 0;
    }

    private function getAvgSoreness($studentId, $days = 30)
    {
        $windowStart = now()->subDays($days);
        
        $avg = WellnessLog::where('student_id', $studentId)
            ->where('logged_at', '>=', $windowStart)
            ->avg('recovery_soreness');
        
        return $avg ? round($avg, 1) : 0;
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
        $assigned = ProgramAssignment::whereIn('student_id', $studentIds)->count();
        $completed = ProgramAssignment::whereIn('student_id', $studentIds)
            ->where(function ($q) {
                $q->where('status', 'Completed')
                  ->orWhereNotNull('marked_done_at');
            })
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
        
        $windowStart = now()->startOfWeek();
        $sessionsThisWeek = TrainingLog::whereIn('student_id', $studentIds)
            ->where(function ($q) use ($windowStart) {
                $q->where('logged_at', '>=', $windowStart)
                    ->orWhere(function ($qq) use ($windowStart) {
                        $qq->whereNull('logged_at')->where('created_at', '>=', $windowStart);
                    });
            })
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
            fn ($studentId) => $this->calculateAttendanceRate($studentId, $days, $studentIds),
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

    private function getSchoolKpiTrends($schoolId, $days = 7)
    {
        $studentIds = $schoolId === null
            ? User::pluck('id')->toArray()
            : User::where('school_id', $schoolId)->pluck('id')->toArray();

        if (empty($studentIds)) {
            return ['labels' => [], 'datasets' => []];
        }

        $startDate = now()->subDays($days);

        $sleepLogs = WellnessLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', $startDate)
            ->orderBy('logged_at')
            ->get()
            ->groupBy(fn($log) => $log->logged_at->format('D'));

        $assignments = ProgramAssignment::whereIn('student_id', $studentIds)
            ->where('assigned_at', '>=', $startDate)
            ->get()
            ->groupBy(fn($assignment) => $assignment->assigned_at->format('D'));

        $labels = [];
        $sleepData = [];
        $exerciseCompletionData = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $labels[] = $date->format('D');

            $dayLogs = $sleepLogs[$date->format('D')] ?? collect();
            $avgSleep = $dayLogs->isEmpty() ? 0 : $dayLogs->avg('sleep_quality');
            $sleepData[] = round($avgSleep, 2);

            $dayAssignments = $assignments[$date->format('D')] ?? collect();
            $assignedCount = $dayAssignments->count();
            $completedCount = $dayAssignments->where('status', 'Completed')->count();
            $exerciseCompletionData[] = $assignedCount > 0 ? round(($completedCount / $assignedCount) * 100, 2) : 0;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Sleep Quality',
                    'data' => $sleepData,
                ],
                [
                    'label' => 'Exercise Completion %',
                    'data' => $exerciseCompletionData,
                ],
            ],
        ];
    }

    private function getTeamStudentMetrics($teamId)
    {
        $team = SportTeam::find($teamId);
        $studentIds = $team->studentAssignments()->pluck('student_id')->toArray();

        // Calculate directly from source data - NO CACHE
        $metrics = [];
        foreach ($studentIds as $studentId) {
            $student = User::find($studentId);
            $metrics[] = [
                'student_id' => $studentId,
                'name' => $student?->name ?? 'Unknown',
                'completionRate' => $this->calculateCompletionRate($studentId),
                'complianceScore' => $this->calculateComplianceScore($studentId),
                'consistencyIndex' => $this->calculateConsistencyIndex($studentId),
                'attendanceRate' => $this->calculateAttendanceRate($studentId),
                'trend' => $this->calculatePerformanceTrend($studentId),
            ];
        }

        // Sort by compliance score descending
        usort($metrics, fn($a, $b) => $b['complianceScore'] <=> $a['complianceScore']);

        return $metrics;
    }

    private function getSchoolTeamMetrics($schoolId)
    {
        $teams = SportTeam::where('school_id', $schoolId)->get();

        $metrics = [];
        foreach ($teams as $team) {
            $studentIds = $team->studentAssignments()->pluck('student_id')->toArray();
            
            // Get wellness averages using the existing helper
            $wellness = $this->calculateWellnessAverages($studentIds);

            $metrics[] = [
                'team_id' => $team->id,
                'name' => $team->name ?? 'Unknown',
                'sleepQuality' => $wellness['sleepQuality'],
                'soreness' => $wellness['soreness'],
                'energy' => $wellness['energy'],
                'mood' => $wellness['mood'],
                'readiness' => $wellness['readiness'],
                'hydration' => $wellness['hydration'],
            ];
        }

        return $metrics;
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
        // Calculate directly from source data - NO CACHE
        $completionRate = $this->calculateCompletionRate($studentId);
        $complianceScore = $this->calculateComplianceScore($studentId);

        $target = [
            'trainingCompletionRate' => 90.0,
            'complianceScore' => 95.0,
        ];

        $variance = [
            'trainingCompletionRate' => $completionRate - $target['trainingCompletionRate'],
            'complianceScore' => $complianceScore - $target['complianceScore'],
        ];

        return [
            'current' => [
                'trainingCompletionRate' => $completionRate,
                'complianceScore' => $complianceScore,
            ],
            'target' => $target,
            'variance' => $variance,
        ];
    }
}
