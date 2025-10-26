<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\ClassSchedule;
use App\Models\CourseSection;
use Illuminate\Support\Facades\Auth;

class ClassScheduleController extends Controller
{
    public function index()
    {
        $schedules = ClassSchedule::with([
            'courseSection.course',
            'courseSection.section'
        ])
            ->where('school_id', Auth::user()->school_id)
            ->get();

        return Inertia::render('ClassSchedulePage/Index', [
            'schedules' => $schedules,
        ]);
    }

    public function create()
    {
        $courseSections = CourseSection::with(['course', 'section'])
            ->where('school_id', Auth::user()->school_id)
            ->doesntHave('classSchedule')
            ->get();

        return Inertia::render('ClassSchedulePage/Add', [
            'courseSections' => $courseSections,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_section_id' => 'required|exists:course_section,id',
            'days' => 'required|string|max:50',
            'time' => 'required|string|max:100',
            'room' => 'required|string|max:50',
        ]);

        if ($validated['course_section_id'] === 0) {
            return back()->withErrors([
                'course_section_id' => 'Please select a valid course section.',
            ]);
        }

        $schoolId = Auth::user()->school_id;

        $courseSection = CourseSection::with('section')
            ->where('id', $validated['course_section_id'])
            ->where('school_id', $schoolId)
            ->firstOrFail();

        $validated['days'] = trim($validated['days']);
        $validated['time'] = trim($validated['time']);
        $validated['room'] = trim($validated['room']);

        $isOnline = strtolower($validated['room']) === 'online';
        $validated['room'] = $isOnline ? 'ONLINE' : $validated['room'];

        if (in_array($courseSection->status, ['upcoming', 'ongoing']) && !$isOnline) {
            $sectionId = $courseSection->section_id;
            $daysArray = explode('/', $validated['days']);
            $timeArray = explode('/', $validated['time']);
            $roomArray = explode('/', $validated['room']);

            foreach ($daysArray as $i => $day) {
                $timeRange = $timeArray[$i] ?? null;
                $room = $roomArray[$i] ?? null;

                $roomConflict = ClassSchedule::where('school_id', $schoolId)
                    ->whereRaw("FIND_IN_SET('$day', days)")
                    ->whereRaw("FIND_IN_SET('$timeRange', time)")
                    ->whereRaw("FIND_IN_SET('$room', room)")
                    ->exists();

                if ($roomConflict) {
                    return back()->withErrors([
                        'room' => "Conflict: Room '$room' is already booked on $day at $timeRange.",
                    ]);
                }

                $sectionConflict = ClassSchedule::where('school_id', $schoolId)
                    ->whereRaw("FIND_IN_SET('$day', days)")
                    ->whereRaw("FIND_IN_SET('$timeRange', time)")
                    ->whereHas('courseSection', function ($q) use ($sectionId, $courseSection) {
                        $q->where('section_id', $sectionId)
                            ->where('id', '!=', $courseSection->id);
                    })
                    ->exists();

                if ($sectionConflict) {
                    return back()->withErrors([
                        'time' => "Conflict: Another subject for this section overlaps on $day at $timeRange.",
                    ]);
                }
            }
        }

        ClassSchedule::create([
            ...$validated,
            'school_id' => $schoolId,
        ]);

        return redirect()->route('class-schedules.index')->with('success', 'Schedule created successfully.');
    }

    public function show(ClassSchedule $classSchedule)
    {
        $this->authorizeSchoolAccess($classSchedule);

        return Inertia::render('ClassSchedulePage/View', [
            'classSchedule' => $classSchedule->load('courseSection.course', 'courseSection.section'), // ✅ renamed
        ]);
    }

    public function edit(ClassSchedule $classSchedule)
    {
        $this->authorizeSchoolAccess($classSchedule);

        $courseSections = CourseSection::with(['course', 'section'])
            ->where('school_id', Auth::user()->school_id)
            ->get();

        return Inertia::render('ClassSchedulePage/Edit', [
            'classSchedule' => $classSchedule, // ✅ renamed
            'courseSections' => $courseSections,
        ]);
    }

    public function update(Request $request, ClassSchedule $classSchedule)
    {
        $this->authorizeSchoolAccess($classSchedule);

        $validated = $request->validate([
            'course_section_id' => 'required|exists:course_section,id',
            'days' => 'required|string|max:50',
            'time' => 'required|string|max:100',
            'room' => 'required|string|max:50',
        ]);

        if ($validated['course_section_id'] === 0) {
            return back()->withErrors([
                'course_section_id' => 'Please select a valid course section.',
            ]);
        }

        $schoolId = Auth::user()->school_id;

        $courseSection = CourseSection::with('section')
            ->where('id', $validated['course_section_id'])
            ->where('school_id', $schoolId)
            ->firstOrFail();

        $validated['days'] = trim($validated['days']);
        $validated['time'] = trim($validated['time']);
        $validated['room'] = trim($validated['room']);

        $isOnline = strtolower($validated['room']) === 'online';
        $validated['room'] = $isOnline ? 'ONLINE' : $validated['room'];

        if (in_array($courseSection->status, ['upcoming', 'ongoing']) && !$isOnline) {
            $sectionId = $courseSection->section_id;
            $daysArray = explode('/', $validated['days']);
            $timeArray = explode('/', $validated['time']);
            $roomArray = explode('/', $validated['room']);

            foreach ($daysArray as $i => $day) {
                $timeRange = $timeArray[$i] ?? null;
                $room = $roomArray[$i] ?? null;

                $roomConflict = ClassSchedule::where('school_id', $schoolId)
                    ->whereRaw("FIND_IN_SET('$day', days)")
                    ->whereRaw("FIND_IN_SET('$timeRange', time)")
                    ->whereRaw("FIND_IN_SET('$room', room)")
                    ->where('id', '!=', $classSchedule->id)
                    ->exists();

                if ($roomConflict) {
                    return back()->withErrors([
                        'room' => "Conflict: Room '$room' is already booked on $day at $timeRange.",
                    ]);
                }

                $sectionConflict = ClassSchedule::where('school_id', $schoolId)
                    ->whereRaw("FIND_IN_SET('$day', days)")
                    ->whereRaw("FIND_IN_SET('$timeRange', time)")
                    ->whereHas('courseSection', function ($q) use ($sectionId, $courseSection) {
                        $q->where('section_id', $sectionId)
                            ->where('id', '!=', $courseSection->id);
                    })
                    ->where('id', '!=', $classSchedule->id)
                    ->exists();

                if ($sectionConflict) {
                    return back()->withErrors([
                        'time' => "Conflict: Another subject for this section overlaps on $day at $timeRange.",
                    ]);
                }
            }
        }

        $classSchedule->update($validated);

        return redirect()->route('class-schedules.index')->with('success', 'Schedule updated successfully.');
    }

    public function destroy(ClassSchedule $classSchedule)
    {
        $this->authorizeSchoolAccess($classSchedule);

        $classSchedule->delete();

        return redirect()->route('class-schedules.index')->with('success', 'Schedule deleted successfully.');
    }

    protected function authorizeSchoolAccess(ClassSchedule $classSchedule)
    {
        if ($classSchedule->school_id !== Auth::user()->school_id) {
            abort(403, 'Unauthorized access to schedule.');
        }
    }
}