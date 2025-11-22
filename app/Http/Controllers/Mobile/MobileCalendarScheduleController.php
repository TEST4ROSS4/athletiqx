<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\CalendarSchedule;
use App\Models\CoachAssignment;
use App\Models\CourseSection;
use App\Models\SportTeam;
use App\Models\StudentCourseSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MobileCalendarScheduleController extends Controller
{
    //List schedules created by or assigned to current user
    public function index()
    {
        $userId = Auth::id();

        $mySchedules = CalendarSchedule::with(['creator', 'students'])
            ->where('created_by', $userId)
            ->orWhereHas('students', function ($query) use ($userId) {
                $query->where('users.id', $userId);
            })
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'my_schedules' => $mySchedules,
        ]);
    }

    public function coachTeams()
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

    public function professorCourseSections()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $schoolId = $user->school_id;
        $userId = $user->id;

        $courses = CourseSection::with([
            'course:id,title',           // only id & title
            'section:id,code',           // only id & code
            'students:id,name'           // only id & name
        ])
            ->where('school_id', $schoolId)
            ->when($user->hasRole('Professor'), function ($query) use ($userId) {
                $query->whereHas('professors', function ($q) use ($userId) {
                    $q->where('users.id', $userId);
                });
            })
            ->get(['id', 'course_id', 'section_id']); // only main fields

        return response()->json([
            'data' => $courses,
        ]);
    }






    //Create new schedule
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => 'required|string|max:100',
            'description' => 'nullable|string',

            // Separate date and times
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'student_ids' => 'nullable|array',
            'student_ids' => 'array|exists:users,id',
        ]);

        $schedule = CalendarSchedule::create([
            'created_by'  => Auth::id(),
            'title'       => $validated['title'],
            'type'        => $validated['type'],
            'description' => $validated['description'] ?? null,

            // Save separately
            'date'        => $validated['date'],
            'start_time'  => $validated['start_time'],
            'end_time'    => $validated['end_time'],
        ]);

        if (!empty($validated['student_ids'])) {
            $schedule->students()->sync($validated['student_ids']);
        }

        return response()->json(['schedule' => $schedule->load(['creator', 'students'])], 201);
    }

    //Show single schedule
    public function show($id)
    {
        $schedule = CalendarSchedule::with(['creator', 'students'])->findOrFail($id);
        return response()->json($schedule);
    }

    //Update schedule
    public function update(Request $request, $id)
    {
        $schedule = CalendarSchedule::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => 'required|string|max:100',
            'description' => 'nullable|string',

            // Separate date and times
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',

            'student_ids' => 'array|exists:users,id',
        ]);

        $schedule->update([
            'title'       => $validated['title'],
            'type'        => $validated['type'],
            'description' => $validated['description'] ?? null,

            // Save separately
            'date'        => $validated['date'],
            'start_time'  => $validated['start_time'],
            'end_time'    => $validated['end_time'],
        ]);

        if (isset($validated['student_ids'])) {
            $schedule->students()->sync($validated['student_ids']);
        }

        return response()->json(['schedule' => $schedule->load(['creator', 'students'])]);
    }

    //Delete schedule
    public function destroy($id)
    {
        CalendarSchedule::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
