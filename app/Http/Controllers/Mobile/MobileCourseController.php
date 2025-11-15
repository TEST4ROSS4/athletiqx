<?php

namespace App\Http\Controllers\Mobile;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Models\CourseSection;
use App\Http\Controllers\Controller;
use App\Models\StudentCourseSection;
use Illuminate\Support\Facades\Auth;

class MobileCourseController extends Controller
{

    public function getCoursesBySchool()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $schoolId = $user->school_id;
        $userId = $user->id;

        $query = CourseSection::with([
            'course.school',
            'section',
            'classSchedule',
            'professors',
            'students'
        ])
            ->where('school_id', $schoolId);

        if ($user->hasRole('Professor')) {
            $query->whereHas('professors', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            });
        }

        if ($user->hasRole('Student')) {
            $query->whereHas('students', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            });
        }

        $courses = $query->get();

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
    public function getStudentsByCourse(CourseSection $courseSection)
    {
        $courseSection->load(['students', 'course']);

        return response()->json([
            'data' => $courseSection
        ]);
    }
}
