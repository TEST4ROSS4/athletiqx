<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\ProgramExercise;
use App\Models\ExerciseSet;
use App\Models\SportTeam;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function landing(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $teamId = null;
        if ($user->hasRole('Admin')) {
            $requestedTeamId = $request->input('team_id');
            $teamId = $requestedTeamId
                ? SportTeam::where('school_id', $user->school_id)
                    ->where('id', $requestedTeamId)
                    ->value('id')
                : null;
        }

        $programs = Program::withCount(['exercises', 'assignments'])
            ->where('school_id', $user->school_id)
            ->when($teamId, fn($q) => $q->where('sport_team_id', $teamId))
            ->when(! $user->hasRole('Admin'), function ($q) use ($user) {
                $teamIds = $user->assignedTeams()->pluck('id');
                $q->where('created_by', $user->id)
                    ->where(function ($sub) use ($teamIds) {
                        $sub->whereNull('sport_team_id')
                            ->orWhereIn('sport_team_id', $teamIds);
                    });
            })
            ->orderByDesc('updated_at')
            ->take(5)
            ->get();

        $summaryBase = Program::where('school_id', $user->school_id)
            ->when($teamId, fn($q) => $q->where('sport_team_id', $teamId))
            ->when(! $user->hasRole('Admin'), function ($q) use ($user) {
                $teamIds = $user->assignedTeams()->pluck('id');
                $q->where('created_by', $user->id)
                    ->where(function ($sub) use ($teamIds) {
                        $sub->whereNull('sport_team_id')
                            ->orWhereIn('sport_team_id', $teamIds);
                    });
            });

        $summary = [
            'total' => (clone $summaryBase)->count(),
            'assigned' => (clone $summaryBase)->has('assignments')->count(),
            'unassigned' => (clone $summaryBase)->doesntHave('assignments')->count(),
            'latest_created' => (clone $summaryBase)->orderByDesc('created_at')->first()?->name,
            'latest_created_at' => (clone $summaryBase)->orderByDesc('created_at')->first()?->created_at,
        ];

        $teams = $user->hasRole('Admin')
            ? SportTeam::where('school_id', $user->school_id)->orderBy('name')->get(['id', 'name'])
            : SportTeam::whereIn('id', $user->assignedTeams()->pluck('id'))
                ->orderBy('name')
                ->get(['id', 'name']);

        return Inertia::render('ProgramsPage/Landing', [
            'programs' => $programs,
            'summary' => $summary,
            'schools' => $user->hasRole('Admin')
                ? School::orderBy('name')->get(['id', 'name'])
                : [],
            'teams' => $teams,
            'filters' => [
                'team_id' => $teamId,
            ],
            'isAdmin' => $user->hasRole('Admin'),
            'current_school_id' => $user->school_id,
        ]);
    }

    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $query = Program::with(['sportTeam:id,name'])
            ->withCount(['exercises', 'assignments'])
            ->where('school_id', $user->school_id);

        if ($user->hasRole('Student')) {
            $query->whereHas('assignments', fn($q) => $q->where('student_id', $user->id));
        } else {
            $query->when(! $user->hasRole('Admin'), function ($q) use ($user) {
                $teamIds = $user->assignedTeams()->pluck('id');
                $q->where('created_by', $user->id)
                    ->where(function ($sub) use ($teamIds) {
                        $sub->whereNull('sport_team_id')
                            ->orWhereIn('sport_team_id', $teamIds);
                    });
            });
        }

        // Search by program name
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Filter by assigned / unassigned
        if ($status = $request->input('status')) {
            $query->when($status === 'assigned', fn($q) => $q->has('assignments'))
                  ->when($status === 'unassigned', fn($q) => $q->doesntHave('assignments'));
        }

        // Sorting
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
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $teams = SportTeam::where('school_id', $user->school_id)
            ->when(! $user->hasRole('Admin'), function ($q) use ($user) {
                $teamIds = $user->assignedTeams()->pluck('id');
                $q->whereIn('id', $teamIds);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ProgramsPage/Add', [
            'teams' => $teams,
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $teamIds = $user->assignedTeams()->pluck('id');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'note' => 'nullable|string',
            'school_id' => [
                'nullable',
                'integer',
                Rule::exists('schools', 'id'),
            ],
            'sport_team_id' => [
                'nullable',
                'integer',
                Rule::exists('sport_teams', 'id')->where(function ($q) use ($user) {
                    $q->where('school_id', $user->school_id);
                }),
            ],
            'exercises' => 'required|array|min:1',
            'exercises.*.name' => 'required|string|max:255',
            'exercises.*.description' => 'nullable|string',
            'exercises.*.order' => 'nullable|integer',
            'exercises.*.sets' => 'required|array|min:1',
            'exercises.*.sets.*.order' => 'nullable|integer',
            'exercises.*.sets.*.fields' => 'required|array',
            'exercises.*.sets.*.suggested_values' => 'nullable|array',
        ]);

        $schoolId = $user->school_id;
        if ($user->hasRole('Admin') && $validated['school_id'] ?? false) {
            $schoolId = $validated['school_id'];
        }

        if (! $user->hasRole('Admin') && $validated['sport_team_id']) {
            if (! $teamIds->contains($validated['sport_team_id'])) {
                abort(403, 'You are not assigned to this team.');
            }
        }

        // 👇 Return $program from the transaction
        $program = DB::transaction(function () use ($validated, $user, $schoolId) {
            $program = Program::create([
                'created_by' => $user->id,
                'school_id' => $schoolId,
                'sport_team_id' => $validated['sport_team_id'] ?? null,
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

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Load exercises and their sets
        $program->load(['exercises.sets']);

        $teams = SportTeam::where('school_id', $user->school_id)
            ->when(! $user->hasRole('Admin'), function ($q) use ($user) {
                $teamIds = $user->assignedTeams()->pluck('id');
                $q->whereIn('id', $teamIds);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ProgramsPage/Edit', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'note' => $program->note,
                'sport_team_id' => $program->sport_team_id,
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
            'teams' => $teams,
        ]);
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $teamIds = $user->assignedTeams()->pluck('id');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'note' => 'nullable|string',
            'sport_team_id' => [
                'nullable',
                'integer',
                Rule::exists('sport_teams', 'id')->where(function ($q) use ($user) {
                    $q->where('school_id', $user->school_id);
                }),
            ],
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

        if (! $user->hasRole('Admin') && $validated['sport_team_id']) {
            if (! $teamIds->contains($validated['sport_team_id'])) {
                abort(403, 'You are not assigned to this team.');
            }
        }

        // Return the updated program
        $program = DB::transaction(function () use ($program, $validated) {

            $program->update([
                'name' => $validated['name'],
                'note' => $validated['note'] ?? null,
                'sport_team_id' => $validated['sport_team_id'] ?? null,
            ]);

            $program->exercises()->delete();

            // Rebuild all exercises & sets from validated data
            foreach ($validated['exercises'] as $exerciseData) {
                $exercise = $program->exercises()->create([
                    'name'        => $exerciseData['name'],
                    'description' => $exerciseData['description'] ?? null,
                    'order'       => $exerciseData['order'],
                ]);

                foreach ($exerciseData['sets'] as $setData) {
                    $exercise->sets()->create([
                        'order' => $setData['order'],
                        'fields' => $setData['fields'],
                        'suggested_values' => $setData['suggested_values'] ?? [],
                    ]);
                }
            }

            return $program;
        });

        return redirect()
            ->route('programs.show', $program->id)
            ->with('success', 'Program updated successfully.');
    }




    public function show(Program $program)
{
    $this->authorizeProgramAccess($program, 'programs.view');

    // Eager load exercises, sets, creator, and assigned students
    $program->load([
        'exercises.sets',
        'creator:id,name',
        'assignments.student:id,name',
        'sportTeam:id,name'
    ]);

    return Inertia::render('ProgramsPage/View', [
        'program' => [
            'id' => $program->id,
            'name' => $program->name,
            'note' => $program->note,
            'created_by' => $program->creator?->name ?? 'System',
            'school_id' => $program->school_id,
            'sport_team_id' => $program->sport_team_id,
            'sport_team_name' => $program->sportTeam?->name,
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
        'assignments' => $program->assignments->map(function ($a) {
            return [
                'id' => $a->id,
                'student_id' => $a->student_id,
                'student_name' => $a->student?->name,
                'assigned_at' => $a->assigned_at ?? $a->created_at,
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

        $teamIds = $user->assignedTeams()->pluck('id');

        $ownsProgram = $program->created_by === $user->id;
        $teamMatches = $program->sport_team_id === null || $teamIds->contains($program->sport_team_id);

        $allowed =
            $user->hasRole('Admin') ||
            ($user->can($permission) && $program->school_id === $user->school_id && $ownsProgram && $teamMatches);

        if (! $allowed) {
            abort(403, 'Unauthorized access to this program.');
        }
    }
}
