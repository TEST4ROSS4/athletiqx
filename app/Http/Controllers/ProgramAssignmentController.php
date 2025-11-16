<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\StudentSportTeam;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramAssignmentController extends Controller
{
    /**
     * Show the assign program page (create mode).
     */
    public function create(Program $program)
    {
        $ssts = StudentSportTeam::with(['student', 'sportTeam'])->get();

        $teams = $ssts->pluck('sportTeam')->unique('id')->values()->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'sport' => $t->sport_id ?? null,
        ]);

        return Inertia::render('ProgramsPage/Assign', [
            'program' => $program,
            'teams' => $teams,
            'assignedStudents' => [],
        ]);
    }

    /**
     * Show the assign program page (edit mode).
     */
    public function edit(Program $program)
    {
        $ssts = StudentSportTeam::with(['student', 'sportTeam'])->get();

        $teams = $ssts->pluck('sportTeam')->unique('id')->values()->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'sport' => $t->sport_id ?? null,
        ]);

        $assignedStudents = $program->assignments()
            ->with('student.sportTeamAssignments.sportTeam')
            ->get()
            ->map(function ($assignment) {
                $student = $assignment->student;
                $team = $student->sportTeamAssignments->first()?->sportTeam;
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'team' => $team?->name,
                ];
            });

        return Inertia::render('ProgramsPage/Assign', [
            'program' => $program,
            'teams' => $teams,
            'assignedStudents' => $assignedStudents,
        ]);
    }

    /**
     * Store new assignments.
     */
    public function store(Request $request, Program $program)
    {
        $this->syncAssignments($request, $program);
        return redirect()->route('programs.show', $program)->with('success', 'Program assigned successfully.');
    }

    /**
     * Update existing assignments.
     */
    public function update(Request $request, Program $program)
    {
        $this->syncAssignments($request, $program);
        return redirect()->route('programs.show', $program)->with('success', 'Program assignments updated.');
    }

    protected function syncAssignments(Request $request, Program $program): void
    {
        $validated = $request->validate([
            'team_ids' => 'array',
            'team_ids.*' => 'integer',
            'student_ids' => 'array',
            'student_ids.*' => 'integer',
            'excluded_student_ids' => 'array',
            'excluded_student_ids.*' => 'integer',
            'notes' => 'nullable|string|max:1000',
        ]);

        $excludedStudentIds = collect($validated['excluded_student_ids'] ?? []);
        $allStudentIds = collect($validated['student_ids'] ?? []);

        if (!empty($validated['team_ids'])) {
            $teamStudentIds = StudentSportTeam::whereIn('sport_team_id', $validated['team_ids'])
                ->pluck('student_id');
            $allStudentIds = $allStudentIds->merge($teamStudentIds)->unique();
        }

        $allStudentIds = $allStudentIds->diff($excludedStudentIds);

        $program->assignments()->whereNotIn('student_id', $allStudentIds)->delete();

        foreach ($allStudentIds as $studentId) {
            $program->assignments()->updateOrCreate(
                ['student_id' => $studentId],
                [
                    'assigned_by' => $request->user()->id,
                    'notes' => $validated['notes'] ?? null,
                ]
            );
        }
    }

    /**
     * Search teams (typeahead).
     */
    public function searchTeams(Request $request, Program $program)
    {
        $q = $request->get('q', '');

        $teams = StudentSportTeam::with('sportTeam')
            ->get()
            ->pluck('sportTeam')
            ->unique('id')
            ->filter(fn($t) => $q === '' || str_contains(strtolower($t->name), strtolower($q)))
            ->values()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'sport' => $t->sport_id ?? null,
            ]);

        return response()->json($teams);
    }

    /**
     * Search students (typeahead).
     */
    public function searchStudents(Request $request, Program $program)
    {
        $q = $request->get('q', '');
        $teamId = $request->get('team_id');
        $excludeStudentIds = collect($request->get('exclude_student_ids', []))->map(fn($id) => (int)$id);
        $excludeTeamIds = collect($request->get('exclude_team_ids', []))->map(fn($id) => (int)$id);

        $students = StudentSportTeam::with(['student', 'sportTeam'])
            ->when($teamId, fn($query) => $query->where('sport_team_id', $teamId))
            ->when($excludeStudentIds->isNotEmpty(), fn($q) => $q->whereNotIn('student_id', $excludeStudentIds))
            ->when($excludeTeamIds->isNotEmpty(), fn($q) => $q->whereNotIn('sport_team_id', $excludeTeamIds))
            ->when($q !== '', fn($query) =>
                $query->whereHas('student', fn($sub) =>
                    $sub->where('name', 'LIKE', '%' . $q . '%')
                )
            )
            ->get()
            ->map(fn($sst) => [
                'id' => $sst->student->id,
                'name' => $sst->student->name,
                'team' => $sst->sportTeam->name ?? null,
            ])
            ->values();

        return response()->json($students);
    }
}