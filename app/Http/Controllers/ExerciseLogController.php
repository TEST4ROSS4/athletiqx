<?php

namespace App\Http\Controllers;

use App\Models\ExerciseLog;
use App\Models\ProgramAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExerciseLogController extends Controller
{
    /**
     * Show all programs assigned to the student or filtered by student for coaches/admins.
     */
    public function index(Request $request, $studentId = null)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $query = ProgramAssignment::with(['program.creator', 'program.exercises.sets', 'logs']);

        if ($user->hasRole('Student')) {
            $query->where('student_id', $user->id);
        } elseif ($user->hasRole('Coach') && ! $user->hasRole('Admin')) {
            if ($studentId) {
                $query->whereHas('program', fn($q) => $q->where('created_by', $user->id))
                    ->where('student_id', $studentId);
            } else {
                // No student selected → return empty
                $assignments = collect([]);
                $students = ProgramAssignment::with('student:id,name')
                    ->whereHas('program', fn($q) => $q->where('created_by', $user->id))
                    ->get()
                    ->pluck('student')
                    ->unique('id')
                    ->values();

                return Inertia::render('ExerciseLogsPage/Index', [
                    'assignments' => $assignments,
                    'students' => $students,
                    'currentUserRole' => $user->roles->first()?->name ?? 'Coach',
                    'selectedStudentId' => null,
                ]);
            }
        } elseif ($user->hasRole('Admin')) {
            if ($studentId) {
                $query->where('student_id', $studentId);
            } else {
                $query->whereRaw('0 = 1'); // force empty if no student selected
            }
        }

        $assignments = $query->get()->map(function ($assignment) {
            $totalSets = $assignment->program->exercises->sum(fn($e) => $e->sets->count());
            $completedSets = $assignment->logs->where('marked_as_done', true)->count();
            $loggedSets = $assignment->logs->count();

            $status = match (true) {
                $totalSets === 0 || $loggedSets === 0 => 'Assigned',
                $completedSets < $totalSets => 'In-Progress',
                $completedSets === $totalSets => 'Completed',
            };

            return [
                'id' => $assignment->id,
                'program_name' => $assignment->program->name,
                'coach_name' => $assignment->program->creator->name ?? 'System',
                'status' => $status,
                'assigned_at' => $assignment->assigned_at,
            ];
        });

        // Fetch students for dropdown
        $students = [];
        if ($user->hasRole('Admin') || $user->hasRole('Coach')) {
            $students = ProgramAssignment::query()
                ->when(
                    $user->hasRole('Coach') && ! $user->hasRole('Admin'),
                    fn($q) => $q->whereHas('program', fn($q2) => $q2->where('created_by', $user->id))
                )
                ->with('student:id,name')
                ->get()
                ->pluck('student')
                ->unique('id')
                ->values();
        }

        return Inertia::render('ExerciseLogsPage/Index', [
            'assignments' => $assignments,
            'students' => $students,
            'currentUserRole' => $user->roles->first()?->name ?? 'Coach',
            'selectedStudentId' => $studentId,
        ]);
    }

    /**
     * Show the form to create/edit logs for a specific assignment.
     */
    public function form(ProgramAssignment $assignment)
    {
        $this->authorizeAccess($assignment, 'exercise-logs.edit');

        $assignment->load(['program.exercises.sets', 'logs']);

        $totalSets = $assignment->program->exercises->sum(fn($e) => $e->sets->count());
        $completedSets = $assignment->logs->where('marked_as_done', true)->count();
        $loggedSets = $assignment->logs->count();

        $status = match (true) {
            $totalSets === 0 || $loggedSets === 0 => 'Assigned',
            $completedSets < $totalSets => 'In-Progress',
            $completedSets === $totalSets => 'Completed',
        };

        return Inertia::render('ExerciseLogsPage/Form', [
            'assignment' => [
                'id' => $assignment->id,
                'student_id' => $assignment->student_id,
                'program_name' => $assignment->program->name,
                'coach_name' => $assignment->program->creator->name ?? 'System',
                'status' => $status,
                'exercises' => $assignment->program->exercises->map(function ($exercise) use ($assignment) {
                    return [
                        'id' => $exercise->id,
                        'name' => $exercise->name,
                        'description' => $exercise->description,
                        'sets' => $exercise->sets->map(function ($set) use ($assignment, $exercise) {
                            $log = $assignment->logs->firstWhere('set_id', $set->id);
                            return [
                                'id' => $set->id,
                                'program_exercise_id' => $exercise->id,
                                'order' => $set->order,
                                'fields' => $set->fields ?? [],
                                'values' => $log?->inputs ?? [],
                                'suggested_values' => $set->suggested_values ?? [],
                                'marked_as_done' => $log?->marked_as_done ?? false,
                            ];
                        })->values(),
                    ];
                })->values(),
            ],
        ]);
    }

    /**
     * Store or update logs for an assignment.
     */
    public function store(Request $request, ProgramAssignment $assignment)
    {
        $this->authorizeAccess($assignment, 'exercise-logs.edit');

        $validated = $request->validate([
            'logs' => 'required|array',
            'logs.*.set_id' => 'required|integer|exists:exercise_sets,id',
            'logs.*.inputs' => 'nullable|array', // <-- allow empty sets
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

                // Save student input if present, else keep empty string
                if ($studentValue !== null) {
                    // Only append unit if it's not already included
                    if ($suggested['unit'] && !str_ends_with($studentValue, $suggested['unit'])) {
                        $finalInputs[$fieldName] = $studentValue . ' ' . $suggested['unit'];
                    } else {
                        $finalInputs[$fieldName] = $studentValue;
                    }
                } else {
                    $finalInputs[$fieldName] = $suggested
                        ? ($suggested['unit'] ? $suggested['value'] . ' ' . $suggested['unit'] : $suggested['value'])
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

        // Reload logs and update assignment status
        $assignment->load('program.exercises.sets', 'logs');

        $totalSets = $assignment->program->exercises->sum(fn($e) => $e->sets->count());
        $completedSets = $assignment->logs->where('marked_as_done', true)->count();

        $assignment->status = match (true) {
            $totalSets === 0 => 'Assigned',
            $completedSets === 0 => 'Assigned',
            $completedSets < $totalSets => 'In-Progress',
            $completedSets === $totalSets => 'Completed',
        };

        $assignment->save();

        return redirect()->route('exercise-logs.index', $assignment->student_id)
            ->with('success', 'Logs saved successfully.');
    }


    /**
     * View a submitted log (read-only).
     */
    public function show(ProgramAssignment $assignment)
    {
        $this->authorizeAccess($assignment, 'exercise-logs.view');
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $assignment->load(['program.creator', 'program.exercises.sets', 'logs']);

        return Inertia::render('ExerciseLogsPage/View', [
            'assignment' => [
                'id' => $assignment->id,
                'assigned_at' => $assignment->assigned_at,
                'status' => $assignment->status,
                'can_log' => $user->can('exercise-logs.edit'),
                'program' => [
                    'name' => $assignment->program->name,
                    'note' => $assignment->program->note ?? null,
                    'creator' => [
                        'name' => $assignment->program->creator?->name ?? 'System',
                    ],
                    'exercises' => $assignment->program->exercises->map(function ($exercise) use ($assignment) {
                        return [
                            'id' => $exercise->id,
                            'name' => $exercise->name,
                            'description' => $exercise->description ?? null,
                            'sets' => $exercise->sets->map(function ($set) use ($assignment, $exercise) {
                                $log = $assignment->logs->firstWhere('set_id', $set->id);
                                return [
                                    'id' => $set->id,
                                    'program_exercise_id' => $exercise->id,
                                    'order' => $set->order,
                                    'fields' => $set->fields ?? [],
                                    'values' => $log?->inputs ?? [],
                                    'marked_as_done' => $log?->marked_as_done ?? false,
                                ];
                            })->values(),
                        ];
                    })->values(),
                ],
            ],
        ]);
    }

    /**
     * Centralized access logic for Exercise Logs
     */
    protected function authorizeAccess(ProgramAssignment $assignment, string $permission)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (
            ! $user->can($permission) ||
            ($user->hasRole('Student') && $assignment->student_id !== $user->id) ||
            ($user->hasRole('Coach') && $assignment->program->created_by !== $user->id)
        ) {
            abort(403, 'Unauthorized access to this assignment.');
        }
    }
}
