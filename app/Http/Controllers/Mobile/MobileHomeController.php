<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ProgramAssignment;
use App\Models\ProgramExercise;
use Illuminate\Http\Request;

class MobileHomeController extends Controller
{
    public function getStudentLogs($studentId)
{
    // Fetch assignments for the student and eager-load logs + program + exercises
    $assignments = ProgramAssignment::with(['logs', 'program.exercises'])
        ->where('student_id', $studentId)
        ->get();

    // Transform the assignments so each includes exercise names with its logs
    $data = $assignments->map(function ($assignment) {
        return [
            'assignment_id'   => $assignment->id,
            'program_id'      => $assignment->program_id,
            'program_exercise_names' => $assignment->program 
                ? $assignment->program->exercises->pluck('name') // get all exercise names
                : [],
            'status'          => $assignment->status,
            'marked_done_at'  => $assignment->marked_done_at,
            'logs'            => $assignment->logs->map(function ($log) {
                return [
                    'id'             => $log->id,
                    'set_id'         => $log->set_id,
                    'inputs'         => $log->inputs,
                    'notes'          => $log->notes,
                    'marked_as_done' => $log->marked_as_done,
                    'created_at'     => $log->created_at,
                    'updated_at'     => $log->updated_at,
                ];
            }),
        ];
    });

    return response()->json([
        'student_id'  => $studentId,
        'assignments' => $data,
    ]);
}

    public function getStudentProgramName($studentId)
    {
        // Fetch a single assignment with status 'Assigned'
        $assignment = ProgramAssignment::with('program')
            ->where('student_id', $studentId)
            ->where('status', 'Assigned')
            ->orderBy('created_at', 'desc')
            ->first();

        // Return just the program name + timestamps
        return response()->json([
            'student_id'   => $studentId,
            'program_name' => $assignment && $assignment->program
                ? $assignment->program->name
                : null,
            'created_at'   => $assignment ? $assignment->created_at : null,
            'updated_at'   => $assignment ? $assignment->updated_at : null,
        ]);
    }

    public function getCoachProgramName($coachId)
    {
        // Fetch a single assignment with status 'Assigned'
        $assignment = ProgramAssignment::with('program')
            ->where('assigned_by', $coachId)
            ->where('status', 'Assigned')
            ->orderBy('created_at', 'desc')
            ->first();

        // Return just the program name + timestamps
        return response()->json([
            'assigned_by'   => $coachId,
            'program_name' => $assignment && $assignment->program
                ? $assignment->program->name
                : null,
            'created_at'   => $assignment ? $assignment->created_at : null,
            'updated_at'   => $assignment ? $assignment->updated_at : null,
        ]);
    }
}
