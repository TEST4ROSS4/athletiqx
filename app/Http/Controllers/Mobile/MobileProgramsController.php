<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ExerciseSet;
use App\Models\Program;
use App\Models\ProgramExercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MobileProgramsController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $programs = Program::withCount(['exercises', 'assignments'])
            ->where('school_id', $user->school_id)
            ->where('created_by', $user->id)
            ->orderByDesc('updated_at')
            ->take(5)
            ->get();

        $summary = [
            'total' => Program::where('school_id', $user->school_id)
                ->where('created_by', $user->id)
                ->count(),
            'assigned' => Program::where('school_id', $user->school_id)
                ->where('created_by', $user->id)
                ->has('assignments')
                ->count(),
            'unassigned' => Program::where('school_id', $user->school_id)
                ->where('created_by', $user->id)
                ->doesntHave('assignments')
                ->count(),
            'latest_created' => Program::where('school_id', $user->school_id)
                ->where('created_by', $user->id)
                ->orderByDesc('created_at')
                ->first()?->name,
            'latest_created_at' => Program::where('school_id', $user->school_id)
                ->where('created_by', $user->id)
                ->orderByDesc('created_at')
                ->first()?->created_at,
        ];

        return response()->json([
            'programs' => $programs,
            'summary' => $summary,
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'note' => 'nullable|string',
            'exercises' => 'required|array|min:1',
            'exercises.*.name' => 'required|string|max:255',
            'exercises.*.description' => 'nullable|string',
            'exercises.*.order' => 'nullable|integer',
            'exercises.*.sets' => 'required|array|min:1',
            'exercises.*.sets.*.order' => 'nullable|integer',
            'exercises.*.sets.*.fields' => 'required|array',
            'exercises.*.sets.*.suggested_values' => 'nullable|array',
        ]);

        $program = DB::transaction(function () use ($validated, $user) {
            $program = Program::create([
                'created_by' => $user->id,
                'school_id' => $user->school_id,
                'name' => $validated['name'],
                'note' => $validated['note'] ?? null,
            ]);

            foreach ($validated['exercises'] as $exerciseData) {
                $exercise = ProgramExercise::create([
                    'program_id' => $program->id,
                    'name' => $exerciseData['name'],
                    'description' => $exerciseData['description'] ?? null,
                    'order' => $exerciseData['order'] ?? 0,
                ]);

                foreach ($exerciseData['sets'] as $setData) {
                    ExerciseSet::create([
                        'program_exercise_id' => $exercise->id,
                        'order' => $setData['order'] ?? 0,
                        'fields' => $setData['fields'],
                        'suggested_values' => $setData['suggested_values'] ?? null,
                    ]);
                }
            }

            return $program;
        });

        return response()->json([
            'message' => 'Program created successfully.',
            'program' => $program,
        ], 201);
    }



    public function show(Program $program)
    {
        $program->load(['exercises.sets', 'creator:id,name']);

        $programData = [
            'id' => $program->id,
            'name' => $program->name,
            'note' => $program->note,
            'created_by' => $program->creator?->name ?? 'System',
            'school_id' => $program->school_id,
            'created_at' => $program->created_at,
            'updated_at' => $program->updated_at,
        ];

        $exercisesData = $program->exercises->map(function ($exercise) {
            return [
                'id' => $exercise->id,
                'name' => $exercise->name,
                'description' => $exercise->description,
                'order' => $exercise->order,
                'sets' => $exercise->sets->map(function ($set) {
                    return [
                        'id' => $set->id,
                        'order' => $set->order,
                        'fields' => $set->fields,
                        'suggested_values' => $set->suggested_values,
                    ];
                }),
            ];
        });

        return response()->json([
            'program' => $programData,
            'exercises' => $exercisesData,
        ]);
    }

    public function update(Request $request, $id)
    {
        // Find the program or fail
        $program = Program::findOrFail($id);

        // Validate incoming request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'note' => 'nullable|string',
            'exercises' => 'required|array|min:1',

            'exercises.*.name' => 'required|string|max:255',
            'exercises.*.description' => 'nullable|string',
            'exercises.*.order' => 'required|integer',

            'exercises.*.sets' => 'required|array|min:1',
            'exercises.*.sets.*.order' => 'required|integer',

            'exercises.*.sets.*.fields' => 'required|array|min:1',
            'exercises.*.sets.*.fields.*.name' => 'required|string|max:255',
            'exercises.*.sets.*.fields.*.type' => 'required|string',

            'exercises.*.sets.*.suggested_values' => 'nullable|array',
        ]);

        try {
            $updatedProgram = DB::transaction(function () use ($program, $validated) {

                // Update program details
                $program->update([
                    'name' => $validated['name'],
                    'note' => $validated['note'] ?? null,
                ]);

                // Remove existing exercises (and cascade sets)
                $program->exercises()->delete();

                // Rebuild exercises & sets
                foreach ($validated['exercises'] as $exerciseData) {
                    $exercise = $program->exercises()->create([
                        'name' => $exerciseData['name'],
                        'description' => $exerciseData['description'] ?? null,
                        'order' => $exerciseData['order'],
                    ]);

                    foreach ($exerciseData['sets'] as $setData) {
                        $exercise->sets()->create([
                            'order' => $setData['order'],
                            'fields' => $setData['fields'],
                            'suggested_values' => $setData['suggested_values'] ?? [],
                        ]);
                    }
                }

                return $program->load('exercises.sets'); // eager load for response
            });

            return response()->json([
                'success' => true,
                'message' => 'Program updated successfully.',
                'data' => $updatedProgram,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update program.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Program $program)
    {


        $program->delete();

        return response()->json([
            'message' => 'Program deleted successfully.',
            'status' => 'success',
        ], 200);
    }
}
