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

    $programs = Program::withCount(['exercises', 'assignments'])
        ->where('school_id', $user->school_id)
        ->when(! $user->hasRole('Admin'), fn($q) => $q->where('created_by', $user->id))
        ->orderByDesc('updated_at')
        ->take(5)
        ->get();

    $summary = [
        'total' => Program::where('school_id', $user->school_id)
            ->when(! $user->hasRole('Admin'), fn($q) => $q->where('created_by', $user->id))
            ->count(),

        'assigned' => Program::where('school_id', $user->school_id)
            ->when(! $user->hasRole('Admin'), fn($q) => $q->where('created_by', $user->id))
            ->has('assignments')
            ->count(),

        'unassigned' => Program::where('school_id', $user->school_id)
            ->when(! $user->hasRole('Admin'), fn($q) => $q->where('created_by', $user->id))
            ->doesntHave('assignments')
            ->count(),

        'latest_created' => Program::where('school_id', $user->school_id)
            ->when(! $user->hasRole('Admin'), fn($q) => $q->where('created_by', $user->id))
            ->orderByDesc('created_at')
            ->first()?->name,

        'latest_created_at' => Program::where('school_id', $user->school_id)
            ->when(! $user->hasRole('Admin'), fn($q) => $q->where('created_by', $user->id))
            ->orderByDesc('created_at')
            ->first()?->created_at,
    ];

    return Inertia::render('ProgramsPage/Landing', [
        'programs' => $programs,
        'summary' => $summary,
    ]);
}

   public function index(Request $request)
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    $query = Program::withCount(['exercises', 'assignments'])
        ->where('school_id', $user->school_id)
        ->when(! $user->hasRole('Admin'), fn($q) => $q->where('created_by', $user->id));

    // 🔍 Search by name
    if ($search = $request->input('search')) {
        $query->where('name', 'like', "%{$search}%");
    }

    // 🟢 Filter by assigned / unassigned
    if ($status = $request->input('status')) {
        $query->when($status === 'assigned', fn($q) => $q->has('assignments'))
              ->when($status === 'unassigned', fn($q) => $q->doesntHave('assignments'));
    }

    // ↕️ Sorting options
    switch ($request->input('sort')) {
        case 'name':
            $query->orderBy('name');
            break;
        case 'exercises':
            $query->orderByDesc('exercises_count');
            break;
        case 'latest':
        default:
            $query->orderByDesc('created_at');
            break;
    }

    $programs = $query->paginate(12)->withQueryString();

    return Inertia::render('ProgramsPage/Index', [
        'programs' => $programs->toArray(),
        'filters' => $request->only(['search', 'status', 'sort']),
    ]);
}



    public function create()
    {
        return Inertia::render('ProgramsPage/Add');
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

    // 👇 Return $program from the transaction
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

        return $program; // ✅ this makes $program available after transaction
    });

    // Now you can safely redirect to show route
    return redirect()
        ->route('programs.show', $program->id)
        ->with('success', 'Program created successfully.');
}


    public function edit(Program $program)
{
    $this->authorizeProgramAccess($program, 'programs.edit');

    // Load exercises and their sets
    $program->load(['exercises.sets']);

    return Inertia::render('ProgramsPage/Edit', [
        'program' => [
            'id' => $program->id,
            'name' => $program->name,
            'note' => $program->note,
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
                            'suggested_values' => $set->suggested_values ?? [],
                        ];
                    }),
                ];
            }),
        ],
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

        // Update program details
        $program->update([
            'name' => $validated['name'],
            'note' => $validated['note'] ?? null,
        ]);

        $existingExerciseIds = $program->exercises()->pluck('id')->toArray();
        $incomingExerciseIds = collect($validated['exercises'])->pluck('id')->filter()->toArray();

        // Delete removed exercises
        $toDeleteExercises = array_diff($existingExerciseIds, $incomingExerciseIds);
        if (!empty($toDeleteExercises)) {
            ProgramExercise::whereIn('id', $toDeleteExercises)->delete();
        }

        foreach ($validated['exercises'] as $exerciseData) {
            $exercise = isset($exerciseData['id'])
                ? ProgramExercise::findOrFail($exerciseData['id'])
                : new ProgramExercise(['program_id' => $program->id]);

            $exercise->fill([
                'name' => $exerciseData['name'],
                'description' => $exerciseData['description'] ?? null,
                'order' => $exerciseData['order'] ?? 0,
            ])->save();

            $existingSetIds = $exercise->sets()->pluck('id')->toArray();
            $incomingSetIds = collect($exerciseData['sets'])->pluck('id')->filter()->toArray();

            // Delete removed sets
            $toDeleteSets = array_diff($existingSetIds, $incomingSetIds);
            if (!empty($toDeleteSets)) {
                ExerciseSet::whereIn('id', $toDeleteSets)->delete();
            }

            // Update or create sets
            foreach ($exerciseData['sets'] as $setData) {
                $set = isset($setData['id'])
                    ? ExerciseSet::findOrFail($setData['id'])
                    : new ExerciseSet(['program_exercise_id' => $exercise->id]);

                $set->fill([
                    'order' => $setData['order'] ?? 0,
                    'fields' => $setData['fields'], 
                    'suggested_values' => $setData['suggested_values'] ?? [], 
                ])->save();
            }
        }
    });

    return redirect()
    ->route('programs.show', $program->id)
    ->with('success', '✅ Program updated successfully.');
}





    public function show(Program $program)
    {
        $this->authorizeProgramAccess($program, 'programs.view');

        $program->load(['exercises.sets', 'creator:id,name']);

        return Inertia::render('ProgramsPage/View', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'note' => $program->note,
                'created_by' => $program->creator?->name ?? 'System',
                'school_id' => $program->school_id,
                'created_at' => $program->created_at,
                'updated_at' => $program->updated_at,
            ],
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

        return redirect()->route('programs.index')
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
