<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingLog;
use App\Models\ComplianceAlert;
use App\Services\ComplianceCalculationService;
use Illuminate\Http\Request;

class TrainingComplianceController extends Controller
{
    public function logTrainingCompletion(Request $request, $trainingId)
    {
        $request->validate([
            'sets_completed' => 'required|integer|min:0',
            'reps_completed' => 'required|integer|min:0',
            'weight_actual' => 'required|numeric|min:0',
            'duration_actual' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        // Get training details (assuming from program_assignments or similar)
        $training = $this->getTrainingDetails($trainingId);

        $complianceScore = ComplianceCalculationService::calculateComplianceScore(
            $training['sets_assigned'],
            $request->sets_completed,
            $training['reps_assigned'],
            $request->reps_completed,
            $training['weight_assigned'],
            $request->weight_actual,
            $training['duration_assigned'],
            $request->duration_actual
        );

        $variancePercentage = ComplianceCalculationService::calculateVariancePercentage(
            $request->weight_actual,
            $training['weight_assigned']
        );

        $log = TrainingLog::create([
            'training_id' => $trainingId,
            'student_id' => auth()->id(),
            'sets_assigned' => $training['sets_assigned'],
            'sets_completed' => $request->sets_completed,
            'reps_assigned' => $training['reps_assigned'],
            'reps_completed' => $request->reps_completed,
            'weight_assigned' => $training['weight_assigned'],
            'weight_actual' => $request->weight_actual,
            'duration_assigned' => $training['duration_assigned'],
            'duration_actual' => $request->duration_actual,
            'compliance_score' => $complianceScore,
            'variance_percentage' => $variancePercentage,
            'notes' => $request->notes,
        ]);

        // Create alerts if needed
        $this->createComplianceAlerts($log);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $log->id,
                'training_id' => $log->training_id,
                'student_id' => $log->student_id,
                'sets_assigned' => $log->sets_assigned,
                'sets_completed' => $log->sets_completed,
                'reps_assigned' => $log->reps_assigned,
                'reps_completed' => $log->reps_completed,
                'weight_assigned' => $log->weight_assigned,
                'weight_actual' => $log->weight_actual,
                'duration_assigned' => $log->duration_assigned,
                'duration_actual' => $log->duration_actual,
                'compliance_score' => $log->compliance_score,
                'variance_percentage' => $log->variance_percentage,
                'logged_at' => $log->logged_at->toIso8601String(),
            ],
        ], 201);
    }

    public function getTrainingCompliance($trainingId)
    {
        $completions = TrainingLog::where('training_id', $trainingId)
            ->with('student:id,name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'training_id' => $trainingId,
                'training_name' => 'Training Name', // Placeholder
                'completions' => $completions->map(fn($log) => [
                    'id' => $log->id,
                    'student_id' => $log->student_id,
                    'student_name' => $log->student?->name ?? 'Unknown',
                    'sets_assigned' => $log->sets_assigned,
                    'sets_completed' => $log->sets_completed,
                    'reps_assigned' => $log->reps_assigned,
                    'reps_completed' => $log->reps_completed,
                    'weight_assigned' => $log->weight_assigned,
                    'weight_actual' => $log->weight_actual,
                    'compliance_score' => $log->compliance_score,
                    'variance_percentage' => $log->variance_percentage,
                    'logged_at' => $log->logged_at->toIso8601String(),
                ])->toArray(),
            ],
        ]);
    }

    public function getStudentComplianceReport(Request $request, $studentId)
    {
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');
        $perPage = $request->get('per_page', 20);

        $query = TrainingLog::where('student_id', $studentId);

        if ($dateFrom) {
            $query->where('logged_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->where('logged_at', '<=', $dateTo);
        }

        $trainings = $query->paginate($perPage);
        $totalAssigned = $query->count();
        $totalCompleted = $query->where('sets_completed', '>', 0)->count();
        $avgCompliance = $query->avg('compliance_score') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'student_id' => $studentId,
                'student_name' => 'Student Name', // Placeholder
                'overallComplianceScore' => round($avgCompliance, 2),
                'totalTrainingsAssigned' => $totalAssigned,
                'totalTrainingsCompleted' => $totalCompleted,
                'completionRate' => $totalAssigned > 0 ? round(($totalCompleted / $totalAssigned) * 100, 2) : 0,
                'trainings' => $trainings->map(fn($log) => [
                    'training_id' => $log->training_id,
                    'training_name' => 'Training Name',
                    'assigned_date' => $log->created_at->toDateString(),
                    'completed_date' => $log->logged_at->toDateString(),
                    'compliance_score' => $log->compliance_score,
                    'variance_percentage' => $log->variance_percentage,
                    'status' => $log->sets_completed > 0 ? 'completed' : 'pending',
                ])->toArray(),
            ],
        ]);
    }

    public function getTeamComplianceAnalytics(Request $request, $teamId)
    {
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = TrainingLog::query();

        if ($dateFrom) {
            $query->where('logged_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->where('logged_at', '<=', $dateTo);
        }

        $logs = $query->get();
        $avgCompliance = $logs->avg('compliance_score') ?? 0;
        $totalCompleted = $logs->where('sets_completed', '>', 0)->count();
        $totalAssigned = $logs->count();

        $topPerformers = $logs->groupBy('student_id')
            ->map(fn($group) => [
                'student_id' => $group->first()->student_id,
                'compliance_score' => round($group->avg('compliance_score'), 2),
                'completion_rate' => round(($group->where('sets_completed', '>', 0)->count() / $group->count()) * 100, 2),
            ])
            ->sortByDesc('compliance_score')
            ->take(5)
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'team_id' => $teamId,
                'team_name' => 'Team Name',
                'teamAverageCompliance' => round($avgCompliance, 2),
                'teamCompletionRate' => $totalAssigned > 0 ? round(($totalCompleted / $totalAssigned) * 100, 2) : 0,
                'topPerformers' => $topPerformers->map(fn($perf) => [
                    'student_id' => $perf['student_id'],
                    'name' => 'Student Name',
                    'compliance_score' => $perf['compliance_score'],
                    'completion_rate' => $perf['completion_rate'],
                ])->toArray(),
                'needsAttention' => [],
            ],
        ]);
    }

    public function updateTrainingLog(Request $request, $trainingId, $logId)
    {
        $request->validate([
            'sets_completed' => 'required|integer|min:0',
            'reps_completed' => 'required|integer|min:0',
            'weight_actual' => 'required|numeric|min:0',
            'duration_actual' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $log = TrainingLog::findOrFail($logId);

        $training = $this->getTrainingDetails($trainingId);

        $complianceScore = ComplianceCalculationService::calculateComplianceScore(
            $training['sets_assigned'],
            $request->sets_completed,
            $training['reps_assigned'],
            $request->reps_completed,
            $training['weight_assigned'],
            $request->weight_actual,
            $training['duration_assigned'],
            $request->duration_actual
        );

        $variancePercentage = ComplianceCalculationService::calculateVariancePercentage(
            $request->weight_actual,
            $training['weight_assigned']
        );

        $log->update([
            'sets_completed' => $request->sets_completed,
            'reps_completed' => $request->reps_completed,
            'weight_actual' => $request->weight_actual,
            'duration_actual' => $request->duration_actual,
            'compliance_score' => $complianceScore,
            'variance_percentage' => $variancePercentage,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $log->id,
                'compliance_score' => $log->compliance_score,
                'variance_percentage' => $log->variance_percentage,
            ],
        ]);
    }

    private function createComplianceAlerts($log)
    {
        $alertType = ComplianceCalculationService::getAlertType(
            $log->compliance_score,
            $log->variance_percentage
        );

        if ($alertType) {
            ComplianceAlert::create([
                'student_id' => $log->student_id,
                'training_id' => $log->training_id,
                'alert_type' => $alertType,
                'severity' => ComplianceCalculationService::getAlertSeverity($alertType),
                'message' => ComplianceCalculationService::generateAlertMessage(
                    $alertType,
                    $log->compliance_score,
                    $log->variance_percentage
                ),
            ]);
        }
    }

    private function getTrainingDetails($trainingId)
    {
        // Placeholder - should fetch from actual training/program data
        return [
            'sets_assigned' => 3,
            'reps_assigned' => 12,
            'weight_assigned' => 185,
            'duration_assigned' => 60,
        ];
    }
}
