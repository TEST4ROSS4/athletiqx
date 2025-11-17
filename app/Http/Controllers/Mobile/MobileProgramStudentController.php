<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ProgramAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MobileProgramStudentController extends Controller
{
    public function programsAssignedToMe()
    {
        $user = Auth::user();
        $schoolId = $user->school_id;
        $userId = $user->id;

        $assignments = ProgramAssignment::with(['program', 'student', 'creator', 'logs'])->where('student_id', $userId)
            ->whereHas('program', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }
}
