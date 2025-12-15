<?php

namespace App\Http\Controllers;

use App\Models\WellnessLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminWellnessController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 50);
        $days = $request->get('days', 30);

        $logs = WellnessLog::with(['student:id,name,email,school_id', 'student.school:id,name'])
            ->where('logged_at', '>=', now()->subDays($days))
            ->orderByDesc('logged_at')
            ->paginate($perPage);

        return Inertia::render('Admin/WellnessLogs', [
            'logs' => $logs,
            'days' => $days,
        ]);
    }
}
