<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\ProgramExercise;
use App\Models\ExerciseSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function landing()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $programs = $user->hasRole('Admin')
            ? Program::with('exercises.sets')
            ->where('school_id', $user->school_id)
            ->get()
            : Program::with('exercises.sets')
            ->where('school_id', $user->school_id)
            ->where('created_by', $user->id)
            ->get();

        return Inertia::render('ProgramModule/Landing', [
            'programs' => $programs,
        ]);
    }

    public function create()
    {
        return Inertia::render('ProgramModule/Create');
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

        DB::transaction(function () use ($validated, $user) {
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
        });

        return redirect()->route('programs.landing')
            ->with('success', 'Program created successfully.');
    }

    public function edit(Program $program)
    {
        $this->authorizeProgramAccess($program, 'programs.edit');

        $program->load('exercises.sets');

        return Inertia::render('ProgramModule/Edit', [
            'program' => $program,
        ]);
    }

    public function update(Request $request, Program $program)
    {
        $this->authorizeProgramAccess($program, 'programs.edit');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'note' => 'nullable|string',
            'exercises' => 'required|array|min:1',
            'exercises.*.id' => 'nullable|integer',
            'exercises.*.name' => 'required|string|max:255',
            'exercises.*.description' => 'nullable|string',
            'exercises.*.order' => 'nullable|integer',
            'exercises.*.sets' => 'required|array|min:1',
            'exercises.*.sets.*.id' => 'nullable|integer',
            'exercises.*.sets.*.order' => 'nullable|integer',
            'exercises.*.sets.*.fields' => 'required|array',
            'exercises.*.sets.*.suggested_values' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated, $program) {
            $program->update([
                'name' => $validated['name'],
                'note' => $validated['note'] ?? null,
            ]);

            foreach ($validated['exercises'] as $exerciseData) {
                $exercise = isset($exerciseData['id'])
                    ? ProgramExercise::findOrFail($exerciseData['id'])
                    : new ProgramExercise(['program_id' => $program->id]);

                $exercise->fill([
                    'name' => $exerciseData['name'],
                    'description' => $exerciseData['description'] ?? null,
                    'order' => $exerciseData['order'] ?? 0,
                ])->save();

                foreach ($exerciseData['sets'] as $setData) {
                    $set = isset($setData['id'])
                        ? ExerciseSet::findOrFail($setData['id'])
                        : new ExerciseSet(['program_exercise_id' => $exercise->id]);

                    $set->fill([
                        'order' => $setData['order'] ?? 0,
                        'fields' => $setData['fields'],
                        'suggested_values' => $setData['suggested_values'] ?? null,
                    ])->save();
                }
            }
        });

        return redirect()->route('programs.landing')
            ->with('success', 'Program updated successfully.');
    }

    public function show(Program $program)
    {
        $this->authorizeProgramAccess($program, 'programs.view');

        $program->load('exercises.sets');

        return Inertia::render('ProgramModule/View', [
            'program' => $program->only([
                'id',
                'name',
                'note',
                'created_by',
                'school_id',
                'created_at',
                'updated_at',
            ]),
            'exercises' => $program->exercises->map(function ($exercise) {
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
            }),
        ]);
    }

    public function destroy(Program $program)
    {
        $this->authorizeProgramAccess($program, 'programs.delete');

        $program->delete();

        return redirect()->route('programs.landing')
            ->with('success', 'Program deleted.');
    }

    // 🔐 Centralized access logic
    protected function authorizeProgramAccess(Program $program, string $permission)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (
            $program->school_id !== $user->school_id ||
            (! $user->hasRole('Admin') && $program->created_by !== $user->id) ||
            ! $user->can($permission)
        ) {
            abort(403, 'Unauthorized access to this program.');
        }
    }
}
