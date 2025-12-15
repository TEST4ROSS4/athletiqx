<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WellnessLog;
use Illuminate\Http\Request;

class WellnessController extends Controller
{
    public function logWellness(Request $request)
    {
        $request->validate([
            'sleep_hours' => 'required|numeric|min:0|max:24',
            'sleep_quality' => 'required|integer|min:1|max:10',
            'nutrition_status' => 'nullable|string',
            'hydration_level' => 'required|integer|min:1|max:10',
            'injury_status' => 'nullable|string',
            'injury_severity' => 'nullable|integer|min:1|max:10',
            'mood' => 'required|integer|min:1|max:10',
            'energy_level' => 'required|integer|min:1|max:10',
            'recovery_soreness' => 'required|integer|min:1|max:10',
            'readiness_to_train' => 'required|integer|min:1|max:10',
            'notes' => 'nullable|string',
        ]);

        $wellness = WellnessLog::create([
            'student_id' => auth()->id(),
            'sleep_hours' => $request->sleep_hours,
            'sleep_quality' => $request->sleep_quality,
            'nutrition_status' => $request->nutrition_status,
            'hydration_level' => $request->hydration_level,
            'injury_status' => $request->injury_status,
            'injury_severity' => $request->injury_severity,
            'mood' => $request->mood,
            'energy_level' => $request->energy_level,
            'recovery_soreness' => $request->recovery_soreness,
            'readiness_to_train' => $request->readiness_to_train,
            'notes' => $request->notes,
            'logged_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $wellness->id,
                'student_id' => $wellness->student_id,
                'sleep_hours' => $wellness->sleep_hours,
                'sleep_quality' => $wellness->sleep_quality,
                'logged_at' => optional($wellness->logged_at ?? $wellness->created_at)->toIso8601String(),
            ],
        ], 201);
    }

    public function getWellnessHistory(Request $request)
    {
        $days = $request->get('days', 7);
        $perPage = $request->get('per_page', 20);

        $history = WellnessLog::where('student_id', auth()->id())
            ->where('logged_at', '>=', now()->subDays($days))
            ->orderByDesc('logged_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $history->map(fn($log) => [
                'id' => $log->id,
                'sleep_hours' => $log->sleep_hours,
                'sleep_quality' => $log->sleep_quality,
                'nutrition_status' => $log->nutrition_status,
                'hydration_level' => $log->hydration_level,
                'injury_status' => $log->injury_status,
                'injury_severity' => $log->injury_severity,
                'mood' => $log->mood,
                'energy_level' => $log->energy_level,
                'recovery_soreness' => $log->recovery_soreness,
                'readiness_to_train' => $log->readiness_to_train,
                'notes' => $log->notes,
                'logged_at' => $log->logged_at->toIso8601String(),
            ])->toArray(),
            'pagination' => [
                'total' => $history->total(),
                'per_page' => $history->perPage(),
                'current_page' => $history->currentPage(),
            ],
        ]);
    }

    public function updateLatestWellness(Request $request)
    {
        $request->validate([
            'sleep_hours' => 'required|numeric|min:0|max:24',
            'sleep_quality' => 'required|integer|min:1|max:10',
            'nutrition_status' => 'nullable|string',
            'hydration_level' => 'required|integer|min:1|max:10',
            'injury_status' => 'nullable|string',
            'injury_severity' => 'nullable|integer|min:1|max:10',
            'mood' => 'required|integer|min:1|max:10',
            'energy_level' => 'required|integer|min:1|max:10',
            'recovery_soreness' => 'required|integer|min:1|max:10',
            'readiness_to_train' => 'required|integer|min:1|max:10',
            'notes' => 'nullable|string',
        ]);

        $latestLog = WellnessLog::where('student_id', auth()->id())
            ->orderByDesc('logged_at')
            ->first();

        if (!$latestLog) {
            return response()->json([
                'success' => false,
                'message' => 'No wellness log found to update.',
            ], 404);
        }

        $latestLog->update([
            'sleep_hours' => $request->sleep_hours,
            'sleep_quality' => $request->sleep_quality,
            'nutrition_status' => $request->nutrition_status,
            'hydration_level' => $request->hydration_level,
            'injury_status' => $request->injury_status,
            'injury_severity' => $request->injury_severity,
            'mood' => $request->mood,
            'energy_level' => $request->energy_level,
            'recovery_soreness' => $request->recovery_soreness,
            'readiness_to_train' => $request->readiness_to_train,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $latestLog->id,
                'student_id' => $latestLog->student_id,
                'sleep_hours' => $latestLog->sleep_hours,
                'sleep_quality' => $latestLog->sleep_quality,
                'nutrition_status' => $latestLog->nutrition_status,
                'hydration_level' => $latestLog->hydration_level,
                'injury_status' => $latestLog->injury_status,
                'injury_severity' => $latestLog->injury_severity,
                'mood' => $latestLog->mood,
                'energy_level' => $latestLog->energy_level,
                'recovery_soreness' => $latestLog->recovery_soreness,
                'readiness_to_train' => $latestLog->readiness_to_train,
                'notes' => $latestLog->notes,
                'logged_at' => optional($latestLog->logged_at ?? $latestLog->created_at)->toIso8601String(),
            ],
        ]);
    }

    public function getWellnessTrends(Request $request)
    {
        $days = $request->get('days', 7);
        $startDate = now()->subDays($days);

        $logs = WellnessLog::where('student_id', auth()->id())
            ->where('logged_at', '>=', $startDate)
            ->orderBy('logged_at')
            ->get()
            ->groupBy(fn($log) => $log->logged_at->format('D'));

        $labels = [];
        $sleepQuality = [];
        $energyLevel = [];
        $soreness = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $labels[] = $date->format('D');
            
            $dayLogs = $logs[$date->format('D')] ?? collect();
            $sleepQuality[] = $dayLogs->isEmpty() ? 0 : round($dayLogs->avg('sleep_quality'), 1);
            $energyLevel[] = $dayLogs->isEmpty() ? 0 : round($dayLogs->avg('energy_level'), 1);
            $soreness[] = $dayLogs->isEmpty() ? 0 : round($dayLogs->avg('recovery_soreness'), 1);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Sleep Quality',
                        'data' => $sleepQuality,
                    ],
                    [
                        'label' => 'Energy Level',
                        'data' => $energyLevel,
                    ],
                    [
                        'label' => 'Soreness',
                        'data' => $soreness,
                    ],
                ],
            ],
        ]);
    }

    public function getWellnessRecommendations()
    {
        $recentLog = WellnessLog::where('student_id', auth()->id())
            ->orderByDesc('logged_at')
            ->first();

        $recommendations = [];

        if ($recentLog) {
            if ($recentLog->sleep_quality < 6) {
                $recommendations[] = [
                    'category' => 'sleep',
                    'message' => 'Your sleep quality is below average. Aim for 8 hours per night.',
                    'priority' => 'high',
                ];
            }

            if ($recentLog->hydration_level < 6) {
                $recommendations[] = [
                    'category' => 'hydration',
                    'message' => 'Increase water intake. Current hydration level is ' . $recentLog->hydration_level . '/10.',
                    'priority' => 'medium',
                ];
            }

            if ($recentLog->energy_level < 5) {
                $recommendations[] = [
                    'category' => 'energy',
                    'message' => 'Your energy levels are low. Consider rest or light activity.',
                    'priority' => 'high',
                ];
            }

            if ($recentLog->recovery_soreness > 7) {
                $recommendations[] = [
                    'category' => 'recovery',
                    'message' => 'High soreness detected. Focus on recovery and stretching.',
                    'priority' => 'high',
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'recommendations' => $recommendations,
            ],
        ]);
    }

    public function getTeamWellnessStatus($teamId)
    {
        $logs = WellnessLog::where('logged_at', '>=', now()->subDay())
            ->with('student:id,name')
            ->get();

        $avgSleepQuality = $logs->isEmpty() ? 0 : round($logs->avg('sleep_quality'), 1);
        $avgEnergyLevel = $logs->isEmpty() ? 0 : round($logs->avg('energy_level'), 1);
        $avgSoreness = $logs->isEmpty() ? 0 : round($logs->avg('recovery_soreness'), 1);
        $avgReadiness = $logs->isEmpty() ? 0 : round($logs->avg('readiness_to_train'), 1);

        $alerts = [];
        foreach ($logs as $log) {
            if ($log->energy_level < 4) {
                $alerts[] = [
                    'student_id' => $log->student_id,
                    'name' => $log->student?->name ?? 'Unknown',
                    'alert_type' => 'low_energy',
                    'message' => 'Energy level dropped to ' . $log->energy_level . '/10',
                    'severity' => 'high',
                    'logged_at' => $log->logged_at->toIso8601String(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'teamAverages' => [
                    'avgSleepQuality' => $avgSleepQuality,
                    'avgEnergyLevel' => $avgEnergyLevel,
                    'avgSoreness' => $avgSoreness,
                    'avgReadiness' => $avgReadiness,
                ],
                'alerts' => $alerts,
            ],
        ]);
    }

    public function checkTodayWellness()
    {
        $today = now()->startOfDay();
        $tomorrow = now()->addDay()->startOfDay();

        $todayLog = WellnessLog::where('student_id', auth()->id())
            ->whereBetween('logged_at', [$today, $tomorrow])
            ->exists();

        return response()->json([
            'success' => true,
            'data' => [
                'logged_today' => $todayLog,
                'current_date' => now()->toIso8601String(),
            ],
        ]);
    }
}
