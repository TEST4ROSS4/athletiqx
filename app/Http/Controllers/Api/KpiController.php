<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KpiLog;
use App\Models\KpiCache;
use App\Models\TeamKpiCache;
use App\Models\SchoolKpiCache;
use App\Models\TrainingLog;
use App\Models\ExerciseLog;
use App\Models\ProgramAssignment;
use App\Models\Program;
use App\Models\ProgramExercise;
use App\Models\ExerciseSet;
use App\Models\SportTeam;
use App\Models\StudentSportTeam;
use App\Models\User;
use App\Models\School;
use App\Models\WellnessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

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

        $wellnessMetrics = $this->calculateWellnessAverages([$studentId]);
        $exerciseMetrics = $this->calculateExerciseMetrics([$studentId], 7);
        $logSnapshot = $this->buildLogSnapshot([$studentId]);
        $trainingCompletionRate = $this->calculateCompletionRate($studentId);
        $complianceScore = $this->calculateComplianceScore($studentId);
        $consistencyIndex = $this->calculateConsistencyIndex($studentId);
        $performanceTrend = $this->calculatePerformanceTrend($studentId);
        $attendanceRate = $this->calculateAttendanceRate($studentId, 7);
        $averageSessionDuration = $this->calculateAvgSessionDuration($studentId);
        $personalRecords = [
            'maxWeight' => $this->getMaxWeight($studentId),
            'maxTime' => $this->getMaxDuration($studentId),
        ];
        $recoveryMetrics = [
            'sleepQuality' => $this->getAvgSleepQuality($studentId),
            'soreness' => $this->getAvgSoreness($studentId),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => ($wellnessMetrics + $exerciseMetrics + [
                    'trainingCompletionRate' => $trainingCompletionRate,
                    'complianceScore' => $complianceScore,
                    'consistencyIndex' => $consistencyIndex,
                    'performanceTrend' => $performanceTrend,
                    'attendanceRate' => $attendanceRate,
                    'averageSessionDuration' => $averageSessionDuration,
                    'personalRecords' => $personalRecords,
                    'recoveryMetrics' => $recoveryMetrics,
                ]),
                'logSnapshot' => $logSnapshot,
                'lastUpdated' => now()->toIso8601String(),
            ],
        ]);

    }

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

    /**
     * Test helper: seed randomized wellness and exercise data to make KPI dashboards non-empty.
     * WARNING: restricted to super_admin.
     */
    public function seedTestKpi(Request $request, $count = null, $schoolIdParam = null, $studentIdParam = null)
    {
        $count = (int)($count ?? $request->get('count') ?? 10);
        $sessions = max(1, $count);
        $schoolId = $schoolIdParam ?? $request->get('school_id');
        $studentId = $studentIdParam ?? $request->get('student_id');

        $schoolId = $schoolId ?? School::first()?->id;
        if (!$schoolId) {
            $school = School::create(['name' => 'Test School ' . Str::random(5)]);
            $schoolId = $school->id;
        }

        if ($studentId) {
            $student = User::find($studentId);
            if (!$student || !$student->hasRole('Student')) {
                return response()->json(['success' => false, 'message' => 'Student not found or invalid'], 404);
            }
            $students = collect([$student]);
            $schoolId = $schoolId ?? $student->school_id;
        } else {
            $students = User::whereHas('roles', fn($q) => $q->where('name', 'Student'))
                ->when($schoolId, fn($q) => $q->where('school_id', $schoolId))
                ->take($count)
                ->get();
        }

        if ($students->isEmpty()) {
            // create students if none exist
            for ($i = 0; $i < $count; $i++) {
                $s = User::create([
                    'name' => 'Student ' . Str::random(4),
                    'email' => 'student_' . Str::random(6) . '@test.local',
                    'password' => bcrypt('password'),
                    'school_id' => $schoolId,
                ]);
                $s->assignRole('Student');
                $students->push($s);
            }
        }

        $schoolId = $schoolId ?? $students->first()->school_id ?? School::first()?->id;
        if (!$schoolId) {
            return response()->json(['success' => false, 'message' => 'No school available for seeding'], 400);
        }

        // Purge existing data for the targeted students before seeding
        $studentIds = $students->pluck('id')->all();
        $assignmentIds = ProgramAssignment::whereIn('student_id', $studentIds)->pluck('id');
        ExerciseLog::whereIn('assignment_id', $assignmentIds)->delete();
        ProgramAssignment::whereIn('id', $assignmentIds)->delete();
        WellnessLog::whereIn('student_id', $studentIds)->delete();

        $team = SportTeam::where('school_id', $schoolId)->first();

        // Create a simple program/exercise/sets scaffold
        $program = Program::firstOrCreate(
            ['name' => 'Test KPI Program', 'school_id' => $schoolId, 'sport_team_id' => $team?->id],
            ['created_by' => $team?->id ?? $students->first()->id, 'note' => 'Autogenerated for KPI testing']
        );

        $exercise = ProgramExercise::firstOrCreate(
            ['program_id' => $program->id, 'name' => 'Test Exercise'],
            ['description' => 'Autogenerated', 'order' => 1]
        );

        $set1 = ExerciseSet::firstOrCreate(
            ['program_exercise_id' => $exercise->id, 'order' => 1],
            ['fields' => ['weight', 'reps'], 'suggested_values' => ['weight' => 50, 'reps' => 8]]
        );
        $set2 = ExerciseSet::firstOrCreate(
            ['program_exercise_id' => $exercise->id, 'order' => 2],
            ['fields' => ['weight', 'reps'], 'suggested_values' => ['weight' => 40, 'reps' => 12]]
        );

        $startDate = Carbon::now()->subDays($sessions - 1)->startOfDay();

        $createdWellness = 0;
        $createdAssignments = 0;
        $createdLogs = 0;

        foreach ($students as $student) {
            for ($i = 0; $i < $sessions; $i++) {
                $day = $startDate->copy()->addDays($i)->setTime(rand(6, 22), rand(0, 59));
                WellnessLog::create([
                    'student_id' => $student->id,
                    'sleep_hours' => rand(5, 9),
                    'sleep_quality' => rand(5, 10),
                    'nutrition_status' => 'OK',
                    'hydration_level' => rand(6, 10),
                    'injury_status' => 'No Injury',
                    'injury_severity' => null,
                    'mood' => rand(6, 10),
                    'energy_level' => rand(6, 10),
                    'recovery_soreness' => rand(2, 7),
                    'readiness_to_train' => rand(6, 10),
                    'notes' => 'Seeded data',
                    'logged_at' => $day,
                ]);
                $createdWellness++;
            }

            $assignment = ProgramAssignment::create([
                'program_id' => $program->id,
                'student_id' => $student->id,
                'assigned_by' => $team?->id ?? $student->id,
                'status' => 'Completed',
                'assigned_at' => Carbon::now()->subDays(rand(0, 6)),
                'marked_done_at' => Carbon::now()->subDays(rand(0, 6)),
                'notes' => 'Seeded data',
            ]);
            $createdAssignments++;

            for ($i = 0; $i < $sessions; $i++) {
                $set = rand(0, 1) === 0 ? $set1 : $set2;
                $logDay = $startDate->copy()->addDays($i)->setTime(rand(6, 22), rand(0, 59));
                ExerciseLog::create([
                    'assignment_id' => $assignment->id,
                    'set_id' => $set->id,
                    'inputs' => [
                        'weight' => rand(30, 80),
                        'reps' => rand(6, 12),
                    ],
                    'notes' => 'Seeded log',
                    'marked_as_done' => true,
                    'created_at' => $logDay,
                    'updated_at' => $logDay,
                ]);
                $createdLogs++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Seeded KPI test data',
            'data' => [
                'students_seeded' => $students->count(),
                'wellness_logs_created' => $createdWellness,
                'assignments_created' => $createdAssignments,
                'exercise_logs_created' => $createdLogs,
            ],
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

        $logs = WellnessLog::where('student_id', $studentId)
            ->where('logged_at', '>=', $startDate)
            ->orderBy('logged_at')
            ->get()
            ->groupBy(fn($log) => $log->logged_at->toDateString());

        $assignments = ProgramAssignment::where('student_id', $studentId)
            ->where('assigned_at', '>=', $startDate)
            ->get()
            ->groupBy(fn($assignment) => $assignment->assigned_at->toDateString());

        $labels = [];
        $readinessData = [];
        $completionData = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $labels[] = \Carbon\Carbon::parse($date)->format('D');

            $dayLogs = $logs[$date] ?? collect();
            $avgReadiness = $dayLogs->isEmpty() ? 0 : $dayLogs->avg('readiness_to_train');
            $readinessData[] = round($avgReadiness, 2);

            $dayAssignments = $assignments[$date] ?? collect();
            $assignedCount = $dayAssignments->count();
            $completedCount = $dayAssignments->where('status', 'Completed')->count();
            $completionRate = $assignedCount > 0 ? round(($completedCount / $assignedCount) * 100, 1) : 0;
            $completionData[] = $completionRate;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Readiness',
                        'data' => $readinessData,
                    ],
                    [
                        'label' => 'Exercise Completion %',
                        'data' => $completionData,
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

        $wellness = $this->calculateWellnessAverages([$studentId]);
        $logSnapshot = $this->buildLogSnapshot([$studentId]);

        return response()->json([
            'success' => true,
            'data' => [
                'wellnessMetrics' => $wellness,
                'logSnapshot' => $logSnapshot,
                'lastUpdated' => now()->toIso8601String(),
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

        $studentIds = $team->studentAssignments()->pluck('student_id')->toArray();

        // KPI aggregates
        $wellnessMetrics = $this->calculateWellnessAverages($studentIds);
        $exerciseMetrics = $this->calculateExerciseMetrics($studentIds, 7);
        $logSnapshot = $this->buildLogSnapshot($studentIds);
        $trainingCompletionRate = $this->calculateTeamCompletionRate($studentIds);
        $complianceScore = $this->calculateTeamComplianceScore($studentIds);
        $consistencyIndex = $this->calculateTeamConsistencyIndex($studentIds);
        $performanceTrend = $this->calculateTeamPerformanceTrend($studentIds);
        $attendanceRate = $this->calculateTeamAttendanceRate($studentIds, 7);
        $averageSessionDuration = $this->calculateTeamAvgSessionDuration($studentIds);
        $totalMembers = count($studentIds);

        // Calculate student wellness metrics in real-time
        $studentMetrics = [];
        foreach ($studentIds as $studentId) {
            $student = User::find($studentId);
            $studentMetrics[] = [
                'student_id' => $studentId,
                'name' => $student?->name ?? 'Unknown',
                'sleepQuality' => $this->calculateWellnessAverages([$studentId])['sleepQuality'],
                'soreness' => $this->calculateWellnessAverages([$studentId])['soreness'],
                'energy' => $this->calculateWellnessAverages([$studentId])['energy'],
                'mood' => $this->calculateWellnessAverages([$studentId])['mood'],
                'readiness' => $this->calculateWellnessAverages([$studentId])['readiness'],
                'hydration' => $this->calculateWellnessAverages([$studentId])['hydration'],
            ];
        }

        // Sort by sleep quality
        usort($studentMetrics, fn($a, $b) => $b['sleepQuality'] <=> $a['sleepQuality']);

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => ($wellnessMetrics + $exerciseMetrics + [
                    'trainingCompletionRate' => $trainingCompletionRate,
                    'complianceScore' => $complianceScore,
                    'consistencyIndex' => $consistencyIndex,
                    'performanceTrend' => $performanceTrend,
                    'attendanceRate' => $attendanceRate,
                    'averageSessionDuration' => $averageSessionDuration,
                    'totalMembers' => $totalMembers,
                ]),
                'studentMetrics' => $studentMetrics,
                'pagination' => [
                    'total' => count($studentMetrics),
                    'per_page' => count($studentMetrics),
                    'current_page' => 1,
                ],
                'logSnapshot' => $logSnapshot,
                'lastUpdated' => now()->toIso8601String(),
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

        $studentIds = User::where('school_id', $schoolId)->pluck('id')->toArray();
        $teamCount = SportTeam::where('school_id', $schoolId)->count();

        $wellnessMetrics = $this->calculateWellnessAverages($studentIds);
        $logSnapshot = $this->buildLogSnapshot($studentIds);
        $exerciseMetrics = $this->calculateExerciseMetrics($studentIds, 7);
        $trainingCompletionRate = $this->calculateTeamCompletionRate($studentIds);
        $complianceScore = $this->calculateTeamComplianceScore($studentIds);
        $consistencyIndex = $this->calculateTeamConsistencyIndex($studentIds);
        $performanceTrend = $this->calculateTeamPerformanceTrend($studentIds);
        $attendanceRate = $this->calculateTeamAttendanceRate($studentIds, 7);
        $averageSessionDuration = $this->calculateTeamAvgSessionDuration($studentIds);

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => ($wellnessMetrics + $exerciseMetrics + [
                    'trainingCompletionRate' => $trainingCompletionRate,
                    'complianceScore' => $complianceScore,
                    'consistencyIndex' => $consistencyIndex,
                    'performanceTrend' => $performanceTrend,
                    'attendanceRate' => $attendanceRate,
                    'averageSessionDuration' => $averageSessionDuration,
                    'totalStudents' => count($studentIds),
                    'totalTeams' => $teamCount,
                ]),
                'logSnapshot' => $logSnapshot,
                'lastUpdated' => now()->toIso8601String(),
            ],
        ]);
    }

    private function buildLogSnapshot(array $studentIds)
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
        $logs = WellnessLog::whereIn('student_id', $studentIds)
            ->where('logged_at', '>=', $startDate)
            ->orderBy('logged_at')
            ->get()
            ->groupBy(fn($log) => $log->logged_at->toDateString());

        $assignments = ProgramAssignment::whereIn('student_id', $studentIds)
            ->where('assigned_at', '>=', $startDate)
            ->get()
            ->groupBy(fn($assignment) => $assignment->assigned_at->toDateString());

        $labels = [];
        $sleepData = [];
        $exerciseCompletionData = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $dateStr = now()->subDays($i)->toDateString();
            $labels[] = \Carbon\Carbon::parse($dateStr)->format('D');

            $dayLogs = $logs[$dateStr] ?? collect();
            $avgSleep = $dayLogs->isEmpty() ? 0 : $dayLogs->avg('sleep_quality');
            $sleepData[] = round($avgSleep, 2);

            $dayAssignments = $assignments[$dateStr] ?? collect();
            $assignedCount = $dayAssignments->count();
            $completedCount = $dayAssignments->where('status', 'Completed')->count();
            $exerciseCompletionData[] = $assignedCount > 0 ? round(($completedCount / $assignedCount) * 100, 1) : 0;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Avg Sleep Quality',
                        'data' => $sleepData,
                    ],
                    [
                        'label' => 'Exercise Completion %',
                        'data' => $exerciseCompletionData,
                    ],
                ],
            ],
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

    private function calculateComplianceScore($studentId, $days = 7)
    {
        $windowStart = now()->subDays($days - 1)->startOfDay();

        // Prefer recent training logs (logged_at or created_at) within the window
        $logs = TrainingLog::where('student_id', $studentId)
            ->where(function ($q) use ($windowStart) {
                $q->where('logged_at', '>=', $windowStart)
                    ->orWhere(function ($qq) use ($windowStart) {
                        $qq->whereNull('logged_at')->where('created_at', '>=', $windowStart);
                    });
            })
            ->get();

        if (!$logs->isEmpty()) {
            return round($logs->avg('compliance_score') ?? 0, 2);
        }

        // Fallback: derive a compliance-like value from program assignments in the same window
        $assigned = ProgramAssignment::where('student_id', $studentId)
            ->whereNotNull('assigned_at')
            ->where('assigned_at', '>=', $windowStart)
            ->count();

        $completed = ProgramAssignment::where('student_id', $studentId)
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

        return $assigned > 0 ? round(($completed / $assigned) * 100, 2) : 0;
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
        $thisWeekStart = now()->subWeek();
        $lastWeekStart = now()->subWeeks(2);
        $thisWeekAvg = TrainingLog::where('student_id', $studentId)
            ->where(function ($q) use ($thisWeekStart) {
                $q->where('logged_at', '>=', $thisWeekStart)
                    ->orWhere(function ($qq) use ($thisWeekStart) {
                        $qq->whereNull('logged_at')->where('created_at', '>=', $thisWeekStart);
                    });
            })
            ->avg('compliance_score') ?? 0;

        $lastWeekAvg = TrainingLog::where('student_id', $studentId)
            ->where(function ($q) use ($lastWeekStart) {
                $q->where('logged_at', '>=', $lastWeekStart)
                    ->orWhere(function ($qq) use ($lastWeekStart) {
                        $qq->whereNull('logged_at')->where('created_at', '>=', $lastWeekStart);
                    });
            })
            ->where(function ($q) {
                $q->where('logged_at', '<', now()->subWeek())
                    ->orWhere(function ($qq) {
                        $qq->whereNull('logged_at')->where('created_at', '<', now()->subWeek());
                    });
            })
            ->avg('compliance_score') ?? 0;

        if ($lastWeekAvg == 0) return 0;
        return round((($thisWeekAvg - $lastWeekAvg) / $lastWeekAvg) * 100, 2);
    }

    private function calculateAttendanceRate($studentId, $days = 7, $baselineStudentIds = null)
    {
        $logs = \App\Models\WellnessLog::where('student_id', $studentId)
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

    private function calculateAvgSessionDuration($studentId, $days = 7)
    {
        $windowStart = now()->subDays($days - 1)->startOfDay();

        // Prefer recent training logs (logged_at or created_at) within the window
        $logs = TrainingLog::where('student_id', $studentId)
            ->where(function ($q) use ($windowStart) {
                $q->where('logged_at', '>=', $windowStart)
                    ->orWhere(function ($qq) use ($windowStart) {
                        $qq->whereNull('logged_at')->where('created_at', '>=', $windowStart);
                    });
            })
            ->get();

        $validDurations = $logs
            ->map(fn ($log) => $log->duration_actual)
            ->filter(fn ($d) => is_numeric($d) && $d > 0);

        if ($validDurations->isNotEmpty()) {
            return round($validDurations->avg() ?? 0, 0);
        }

        // Fallback: approximate session duration using assignment start/end times
        $assignments = ProgramAssignment::where('student_id', $studentId)
            ->where(function ($q) use ($windowStart) {
                $q->whereNotNull('marked_done_at')
                    ->where('marked_done_at', '>=', $windowStart)
                    ->orWhere(function ($qq) use ($windowStart) {
                        $qq->where('status', 'Completed')
                            ->whereNotNull('assigned_at')
                            ->where('assigned_at', '>=', $windowStart);
                    });
            })
            ->get();

        $avgDurationFromAssignments = $assignments
            ->map(function ($a) {
                if ($a->assigned_at && $a->marked_done_at) {
                    return max(0, $a->marked_done_at->diffInMinutes($a->assigned_at));
                }
                return null;
            })
            ->filter()
            ->avg();

        return $avgDurationFromAssignments ? round($avgDurationFromAssignments, 0) : 0;
    }

    private function getMaxWeight($studentId)
    {
        return TrainingLog::where('student_id', $studentId)->max('weight_actual') ?? 0;
    }

    private function getMaxDuration($studentId)
    {
        return TrainingLog::where('student_id', $studentId)->max('duration_actual') ?? 0;
    }

    private function getAvgSleepQuality($studentId, $days = 30)
    {
        $windowStart = now()->subDays($days);
        
        $avg = \App\Models\WellnessLog::where('student_id', $studentId)
            ->where('logged_at', '>=', $windowStart)
            ->avg('sleep_quality');
        
        return $avg ? round($avg, 1) : 0;
    }

    private function getAvgSoreness($studentId, $days = 30)
    {
        $windowStart = now()->subDays($days);
        
        $avg = \App\Models\WellnessLog::where('student_id', $studentId)
            ->where('logged_at', '>=', $windowStart)
            ->avg('recovery_soreness');
        
        return $avg ? round($avg, 1) : 0;
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

    private function calculateTeamCompletionRate($studentIds, $days = 7)
    {
        if (empty($studentIds)) return 0;

        $windowStart = now()->subDays($days - 1)->startOfDay();

        $assigned = ProgramAssignment::whereIn('student_id', $studentIds)
            ->whereNotNull('assigned_at')
            ->where('assigned_at', '>=', $windowStart)
            ->count();

        $completed = ProgramAssignment::whereIn('student_id', $studentIds)
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
        return $assigned > 0 ? round(($completed / $assigned) * 100, 2) : 0;
    }

    private function calculateTeamComplianceScore($studentIds, $days = 7)
    {
        if (empty($studentIds)) return 0;

        $windowStart = now()->subDays($days - 1)->startOfDay();
        $logs = TrainingLog::whereIn('student_id', $studentIds)
            ->where(function ($q) use ($windowStart) {
                $q->where('logged_at', '>=', $windowStart)
                    ->orWhere(function ($qq) use ($windowStart) {
                        $qq->whereNull('logged_at')->where('created_at', '>=', $windowStart);
                    });
            })
            ->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('compliance_score'), 2);
    }

    private function calculateTeamConsistencyIndex($studentIds, $days = 7)
    {
        if (empty($studentIds)) return 0;

        $windowStart = now()->subDays($days - 1)->startOfDay();
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
            fn ($studentId) => $this->calculateAttendanceRate($studentId, $days),
            $studentIds
        );

        return round(array_sum($rates) / count($rates), 2);
    }

    private function calculateTeamAvgSessionDuration($studentIds, $days = 7)
    {
        if (empty($studentIds)) return 0;

        $windowStart = now()->subDays($days - 1)->startOfDay();
        $logs = TrainingLog::whereIn('student_id', $studentIds)
            ->where(function ($q) use ($windowStart) {
                $q->where('logged_at', '>=', $windowStart)
                    ->orWhere(function ($qq) use ($windowStart) {
                        $qq->whereNull('logged_at')->where('created_at', '>=', $windowStart);
                    });
            })
            ->get();
        return $logs->isEmpty() ? 0 : round($logs->avg('duration_actual'), 0);
    }
}
