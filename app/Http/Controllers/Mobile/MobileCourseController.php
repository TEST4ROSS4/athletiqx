<?php

namespace App\Http\Controllers\Mobile;

use App\Models\Course;
use App\Http\Controllers\Controller;
use App\Models\CourseSection;
use Illuminate\Support\Facades\Auth;

class MobileCourseController extends Controller
{

    public function getCoursesBySchool()
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $courses = CourseSection::with([
            'course.school',
            'section.school',
            'classSchedule',
            'professors.school',
            'students.school',
            'studentEnrollments',
            'professorAssignments',
        ])
            ->where('school_id', $schoolId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $courses,
            'token' => request()->bearerToken(),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'school_id' => $schoolId,
            ],
        ]);
    }
}
