<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ExerciseLog;
use App\Models\ProgramAssignment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
            'logs.*.proof_url' => 'nullable|string',
            'logs.*.proof_name' => 'nullable|string',
            'logs.*.proof_size' => 'nullable|integer',
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

            $log = ExerciseLog::firstOrNew([
                'assignment_id' => $assignment->id,
                'set_id' => $set->id,
            ]);

            $log->inputs = $finalInputs;
            $log->marked_as_done = $logData['marked_as_done'] ?? ($log->marked_as_done ?? false);

            if (array_key_exists('proof_url', $logData) && $logData['proof_url']) {
                $log->proof_url = $logData['proof_url'];
                $log->proof_name = $logData['proof_name'] ?? $log->proof_name;
                $log->proof_size = $logData['proof_size'] ?? $log->proof_size;
            }

            $log->save();
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
    // public function show(ProgramAssignment $assignment)
    // {
    //     $assignment->load('program.exercises.sets', 'logs');

    //     $logs = $assignment->logs->keyBy('set_id');

    //     $response = $assignment->program->exercises->map(function ($exercise) use ($logs) {
    //         return [
    //             'id' => $exercise->id,
    //             'name' => $exercise->name,
    //             'sets' => $exercise->sets->map(function ($set) use ($logs) {
    //                 $log = $logs->get($set->id);
    //                 return [
    //                     'id' => $set->id,
    //                     'order' => $set->order,
    //                     'fields' => $set->fields,
    //                     'suggested_values' => $set->suggested_values,
    //                     'logged_values' => $log->inputs ?? [],
    //                     'marked_as_done' => $log->marked_as_done ?? false,
    //                 ];
    //             }),
    //         ];
    //     });

    //     return response()->json([
    //         'assignment_id' => $assignment->id,
    //         'exercise_logs' => $response,
    //     ]);
    // }

    // Fetch logs for an assignment
    // Fetch logs for an assignment per student
    // Fetch logs for a specific assignment and student
    public function show(ProgramAssignment $assignment, $studentId = null)
    {
        $studentId = $studentId ?? Auth::id(); // default to logged-in student

        // Ensure we fetch logs only for this student
        $logs = $assignment->logs()
            ->where('assignment_id', $assignment->id)
            ->whereHas('assignment', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->get()
            ->keyBy('set_id');

        $exerciseLogs = $assignment->program->exercises->map(function ($exercise) use ($logs) {
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
                        'proof_url' => $log->proof_url ?? null,
                        'proof_name' => $log->proof_name ?? null,
                        'proof_size' => $log->proof_size ?? null,
                    ];
                }),
            ];
        });

        return response()->json([
            'assignment_id' => $assignment->id,
            'assignment_status' => $assignment->status,
            'marked_done_at' => $assignment->marked_done_at,
            'exercise_logs' => $exerciseLogs,
        ]);
    }

    public function markAsCompleted($assignmentId)
    {
        $assignment = ProgramAssignment::findOrFail($assignmentId);
        $assignment->marked_done_at = now();
        // $assignment->status = 'Approved';
        $assignment->save();

        return response()->json([
            'message' => 'Program assignment marked as completed.',
            'marked_done_at' => $assignment->marked_done_at, // ✅ return this
            'assignment_id' => $assignment->id,
            'assignment_status' => $assignment->status,
        ]);
    }

    /**
     * Upload proof file for exercise log
     */
    public function uploadProof(Request $request, ProgramAssignment $assignment)
    {
        $request->validate([
            'file' => 'required|file|max:51200', // 50MB
        ]);

        try {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'avi'];

            if (!in_array($extension, $allowedExtensions)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File type not allowed. Allowed: ' . implode(', ', $allowedExtensions),
                ], 400);
            }

            $fileName = Str::uuid() . '.' . $extension;
            $path = Storage::disk('public')->putFileAs('exercise-proofs', $file, $fileName);
            $fileUrl = Storage::disk('public')->url($path);

            return response()->json([
                'success' => true,
                'proof_url' => $fileUrl,
                'proof_name' => $file->getClientOriginalName(),
                'proof_size' => $file->getSize(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
