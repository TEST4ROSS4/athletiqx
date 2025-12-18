<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scholarship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScholarshipAlertController extends Controller
{
    /**
     * Return the latest scholarship setting for the user's school.
     * Used by mobile to alert students when requirements change.
     */
    public function latest(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $setting = Scholarship::where('school_id', $schoolId)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'min_grade_percentage' => $setting?->min_grade_percentage,
                'updated_at' => $setting?->updated_at?->toIso8601String(),
            ],
        ]);
    }
}
