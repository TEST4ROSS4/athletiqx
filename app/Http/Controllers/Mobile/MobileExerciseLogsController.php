<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ExerciseLog;
use App\Models\ProgramAssignment;
use Illuminate\Http\Request;

class MobileExerciseLogsController extends Controller
{
    // Store logs
    public function store(Request $request, ProgramAssignment $assignment)
    {
        $validated = $request->validate([
            'logs' => 'required|array',
            'logs.*.set_id' => 'required|integer|exists:exercise_sets,id',
            'logs.*.inputs' => 'nullable|array',
            'logs.*.marked_as_done' => 'boolean',
        ]);

        foreach ($validated['logs'] as $logData) {
            $set = \App\Models\ExerciseSet::find($logData['set_id']);
            if (!$set) continue;

            $studentInputs = $logData['inputs'] ?? [];
            $finalInputs = [];

            foreach (($set->fields ?? []) as $idx => $field) {
                $fieldName = $field['name'];
                $studentValue = $studentInputs[$fieldName] ?? null;
                $suggested = $set->suggested_values[$idx] ?? null;

                if ($studentValue !== null) {
                    if (
                        !empty($suggested['unit']) &&
                        !str_ends_with($studentValue, $suggested['unit'])
                    ) {
                        $finalInputs[$fieldName] = $studentValue . ' ' . $suggested['unit'];
                    } else {
                        $finalInputs[$fieldName] = $studentValue;
                    }
                } else {
                    $finalInputs[$fieldName] = $suggested
                        ? ($suggested['unit']
                            ? $suggested['value'] . ' ' . $suggested['unit']
                            : $suggested['value'])
                        : '';
                }
            }

            ExerciseLog::updateOrCreate(
                ['assignment_id' => $assignment->id, 'set_id' => $set->id],
                [
                    'inputs' => $finalInputs,
                    'marked_as_done' => $logData['marked_as_done'] ?? false,
                ]
            );
        }

        // Reload logs and compute status
        $assignment->load('program.exercises.sets', 'logs');

        $totalSets = $assignment->program->exercises->sum(
            fn($e) => $e->sets->count()
        );
        $completedSets = $assignment->logs
            ->where('marked_as_done', true)
            ->count();

        $assignment->status = match (true) {
            $totalSets === 0 => 'Assigned',
            $completedSets === 0 => 'Assigned',
            $completedSets < $totalSets => 'In-Progress',
            $completedSets === $totalSets => 'Completed',
        };

        $assignment->save();

        return response()->json([
            'message'    => 'Logs saved successfully.',
            'status'     => $assignment->status,
            'logs'       => $assignment->logs,
            'assignment' => $assignment,
        ], 200);
    }

    // Fetch logs for an assignment
    public function show(ProgramAssignment $assignment)
    {
        $assignment->load('program.exercises.sets', 'logs');

        $logs = $assignment->logs->keyBy('set_id');

        $response = $assignment->program->exercises->map(function ($exercise) use ($logs) {
            return [
                'id' => $exercise->id,
                'name' => $exercise->name,
                'sets' => $exercise->sets->map(function ($set) use ($logs) {
                    $log = $logs->get($set->id);
                    return [
                        'id' => $set->id,
                        'order' => $set->order,
                        'fields' => $set->fields,
                        'suggested_values' => $set->suggested_values,
                        'logged_values' => $log->inputs ?? [],
                        'marked_as_done' => $log->marked_as_done ?? false,
                    ];
                }),
            ];
        });

        return response()->json([
            'assignment_id' => $assignment->id,
            'exercise_logs' => $response,
        ]);
    }
}
