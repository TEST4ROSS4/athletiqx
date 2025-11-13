<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

    public function destroy(Program $program)
    {


        $program->delete();

        return response()->json([
            'message' => 'Program deleted successfully.',
            'status' => 'success',
        ], 200);
    }
}
