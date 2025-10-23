<?php

namespace App\Http\Controllers\Mobile;

use App\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class MobileCourseController extends Controller
{

    public function getCoursesBySchool()
    {
        $user = Auth::user();
        $schoolId = $user->school_id;
        $courses = Course::where('school_id', $schoolId)->get();

        return response()->json([
            'success' => true,
            'data' => $courses,
            'token' => request()->bearerToken(), // ✅ include the token from the request
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'school_id' => $schoolId,
            ],
        ]);
    }
}
