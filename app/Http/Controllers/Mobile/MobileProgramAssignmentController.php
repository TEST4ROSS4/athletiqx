<?php

namespace App\Http\Controllers\Mobile;

use Illuminate\Http\Request;
use App\Models\ProgramAssignment;
use App\Http\Controllers\Controller;
use App\Models\CoachAssignment;
use App\Models\Program;
use App\Models\SportTeam;
use App\Models\StudentSportTeam;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class MobileProgramAssignmentController extends Controller
{
    public function allProgramAssignments()
    {
        $user = Auth::user();
        $schoolId = $user->school_id;
        $userId = $user->id;

        $assignments = ProgramAssignment::with(['program', 'student', 'creator', 'logs'])->where('assigned_by', $userId)
            ->whereHas('program', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }

    public function getTeamsAssignedToCoach()
    {
        $user = Auth::user();

        // Get direct team assignments
        $directTeamIds = CoachAssignment::where('coach_id', $user->id)
            ->where('school_id', $user->school_id)
            ->whereNotNull('sport_team_id')
            ->pluck('sport_team_id');

        // Get sport-based assignments
        $sportIds = CoachAssignment::where('coach_id', $user->id)
            ->where('school_id', $user->school_id)
            ->whereNotNull('sport_id')
            ->pluck('sport_id');

        // Get teams via sport
        $viaSportTeamIds = SportTeam::whereIn('sport_id', $sportIds)->pluck('id');

        // Merge and deduplicate
        $allTeamIds = $directTeamIds->merge($viaSportTeamIds)->unique();

        // Fetch teams with sport relationship
        $teams = SportTeam::select('id', 'sport_id', 'name')->with([
            'sport:id,name,category,is_active,division',
            'studentAssignments' => function ($query) {
                $query->select('id', 'sport_team_id', 'student_id', 'status', 'position');
            },
            'studentAssignments.student' => function ($query) {
                $query->select('id', 'name', 'email'); // only these from Student
            },
        ])
            ->whereIn('id', $allTeamIds)
            ->get();

        return response()->json([
            'data' => $teams,
        ]);
    }

    /**
     * Store new assignments via API.
     */
    public function store(Request $request, Program $program)
    {
        $this->syncAssignments($request, $program);

        return response()->json([
            'message' => 'Program assigned successfully.',
            'program_id' => $program->id,
            'assigned_students' => $program->assignments()->pluck('student_id'),
        ], 201);
    }

    public function fetchAssignments(Program $program)
    {
        $ssts = StudentSportTeam::with(['student', 'sportTeam'])->get();

        $teams = $ssts->pluck('sportTeam')->unique('id')->values()->map(function ($t) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'sport' => [
                    'id' => $t->sport->id ?? null,
                    'name' => $t->sport->name ?? null,
                    'category' => $t->sport->category ?? null,
                    'is_active' => $t->sport->is_active ?? null,
                    'division' => $t->sport->division ?? null,
                ],
            ];
        });

        $assignedStudents = $program->assignments()
            ->with('student.sportTeamAssignments.sportTeam')
            ->get()
            ->map(function ($assignment) {
                $student = $assignment->student;
                $team = $student->sportTeamAssignments->first()?->sportTeam;

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'assigned_at' => Carbon::parse($assignment->created_at)
                        ->timezone('Asia/Manila')
                        ->toIso8601String(), // or ->format('Y-m-d\TH:i:sP') for ISO 8601
                    'team' => [
                        'id' => $team?->id,
                        'name' => $team?->name,
                    ],
                ];
            });

        return response()->json([
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
            ],
            'teams' => $teams,
            'assigned_students' => $assignedStudents,
        ]);
    }





    /**
     * Update existing assignments via API.
     */
    public function update(Request $request, Program $program)
    {
        $this->syncAssignments($request, $program);

        return response()->json([
            'message' => 'Program assignments updated.',
            'program_id' => $program->id,
            'assigned_students' => $program->assignments()->pluck('student_id'),
        ], 200);
    }

    /**
     * Core logic for syncing assignments.
     */
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
}
