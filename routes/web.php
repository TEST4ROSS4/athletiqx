<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SchoolAdminController;
use App\Http\Controllers\ClassScheduleController;
use App\Http\Controllers\CourseSectionController;
use App\Http\Controllers\StudentCourseSectionController;
use App\Http\Controllers\ProfessorCourseSectionController;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Route::resource('users', UserController::class);

    // Route::resource('roles', RoleController::class)
    //                 ->only(["create", "store"])
    //                 ->middleware("permission:roles.create");

    // Route::resource('roles', RoleController::class);

    Route::get('users', [UserController::class, 'index'])->name('users.index')->middleware('permission:users.view');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create')->middleware('permission:users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store')->middleware('permission:users.create');
    Route::get('users/{user}', [UserController::class, 'show'])->name('users.show')->middleware('permission:users.view');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit')->middleware('permission:users.edit');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update')->middleware('permission:users.edit');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:users.delete');



    Route::get('roles', [RoleController::class, 'index'])->name('roles.index')->middleware('permission:roles.view');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create')->middleware('permission:roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store')->middleware('permission:roles.create');
    Route::get('roles/{role}', [RoleController::class, 'show'])->name('roles.show')->middleware('permission:roles.view');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit')->middleware('permission:roles.edit');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update')->middleware('permission:roles.edit');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->middleware('permission:roles.delete');


    Route::get('courses', [CourseController::class, 'index'])->name('courses.index')->middleware('permission:courses.view');
    Route::get('courses/create', [CourseController::class, 'create'])->name('courses.create')->middleware('permission:courses.create');
    Route::post('courses', [CourseController::class, 'store'])->name('courses.store')->middleware('permission:courses.create');
    Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show')->middleware('permission:courses.view');
    Route::get('courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit')->middleware('permission:courses.edit');
    Route::put('courses/{course}', [CourseController::class, 'update'])->name('courses.update')->middleware('permission:courses.edit');
    Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy')->middleware('permission:courses.delete');

    Route::get('schools', [SchoolController::class, 'index'])->name('schools.index')->middleware('permission:schools.view');
    Route::get('schools/create', [SchoolController::class, 'create'])->name('schools.create')->middleware('permission:schools.create');
    Route::post('schools', [SchoolController::class, 'store'])->name('schools.store')->middleware('permission:schools.create');
    Route::get('schools/{school}', [SchoolController::class, 'show'])->name('schools.show')->middleware('permission:schools.view');
    Route::get('schools/{school}/edit', [SchoolController::class, 'edit'])->name('schools.edit')->middleware('permission:schools.edit');
    Route::put('schools/{school}', [SchoolController::class, 'update'])->name('schools.update')->middleware('permission:schools.edit');
    Route::delete('schools/{school}', [SchoolController::class, 'destroy'])->name('schools.destroy')->middleware('permission:schools.delete');

    Route::get('school-admins', [SchoolAdminController::class, 'index'])->name('school-admins.index')->middleware('permission:school-admins.view');
    Route::get('school-admins/create', [SchoolAdminController::class, 'create'])->name('school-admins.create')->middleware('permission:school-admins.create');
    Route::post('school-admins', [SchoolAdminController::class, 'store'])->name('school-admins.store')->middleware('permission:school-admins.create');
    Route::get('school-admins/{user}', [SchoolAdminController::class, 'show'])->name('school-admins.show')->middleware('permission:school-admins.view');
    Route::get('school-admins/{user}/edit', [SchoolAdminController::class, 'edit'])->name('school-admins.edit')->middleware('permission:school-admins.edit');
    Route::put('school-admins/{user}', [SchoolAdminController::class, 'update'])->name('school-admins.update')->middleware('permission:school-admins.edit');
    Route::delete('school-admins/{user}', [SchoolAdminController::class, 'destroy'])->name('school-admins.destroy')->middleware('permission:school-admins.delete');

    Route::get('sections', [SectionController::class, 'index'])->name('sections.index')->middleware('permission:sections.view');
    Route::get('sections/create', [SectionController::class, 'create'])->name('sections.create')->middleware('permission:sections.create');
    Route::post('sections', [SectionController::class, 'store'])->name('sections.store')->middleware('permission:sections.create');
    Route::get('sections/{section}', [SectionController::class, 'show'])->name('sections.show')->middleware('permission:sections.view');
    Route::get('sections/{section}/edit', [SectionController::class, 'edit'])->name('sections.edit')->middleware('permission:sections.edit');
    Route::put('sections/{section}', [SectionController::class, 'update'])->name('sections.update')->middleware('permission:sections.edit');
    Route::delete('sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy')->middleware('permission:sections.delete');

    Route::get('course-sections', [CourseSectionController::class, 'index'])->name('course-sections.index')->middleware('permission:course-sections.view');
    Route::get('course-sections/create', [CourseSectionController::class, 'create'])->name('course-sections.create')->middleware('permission:course-sections.create');
    Route::post('course-sections', [CourseSectionController::class, 'store'])->name('course-sections.store')->middleware('permission:course-sections.create');
    Route::get('course-sections/{courseSection}', [CourseSectionController::class, 'show'])->name('course-sections.show')->middleware('permission:course-sections.view');
    Route::get('course-sections/{courseSection}/edit', [CourseSectionController::class, 'edit'])->name('course-sections.edit')->middleware('permission:course-sections.edit');
    Route::put('course-sections/{courseSection}', [CourseSectionController::class, 'update'])->name('course-sections.update')->middleware('permission:course-sections.edit');
    Route::delete('course-sections/{courseSection}', [CourseSectionController::class, 'destroy'])->name('course-sections.destroy')->middleware('permission:course-sections.delete');

    Route::get('class-schedules', [ClassScheduleController::class, 'index'])->name('class-schedules.index')->middleware('permission:class-schedules.view');
    Route::get('class-schedules/create', [ClassScheduleController::class, 'create'])->name('class-schedules.create')->middleware('permission:class-schedules.create');
    Route::post('class-schedules', [ClassScheduleController::class, 'store'])->name('class-schedules.store')->middleware('permission:class-schedules.create');
    Route::get('class-schedules/{classSchedule}', [ClassScheduleController::class, 'show'])->name('class-schedules.show')->middleware('permission:class-schedules.view');
    Route::get('class-schedules/{classSchedule}/edit', [ClassScheduleController::class, 'edit'])->name('class-schedules.edit')->middleware('permission:class-schedules.edit');
    Route::put('class-schedules/{classSchedule}', [ClassScheduleController::class, 'update'])->name('class-schedules.update')->middleware('permission:class-schedules.edit');
    Route::delete('class-schedules/{classSchedule}', [ClassScheduleController::class, 'destroy'])->name('class-schedules.destroy')->middleware('permission:class-schedules.delete');

    Route::get('professor-course-sections', [ProfessorCourseSectionController::class, 'index'])->name('professor-course-sections.index')->middleware('permission:professor-course-sections.view');
    Route::get('professor-course-sections/create', [ProfessorCourseSectionController::class, 'create'])->name('professor-course-sections.create')->middleware('permission:professor-course-sections.create');
    Route::post('professor-course-sections', [ProfessorCourseSectionController::class, 'store'])->name('professor-course-sections.store')->middleware('permission:professor-course-sections.create');
    Route::get('professor-course-sections/{professorCourseSection}', [ProfessorCourseSectionController::class, 'show'])->name('professor-course-sections.show')->middleware('permission:professor-course-sections.view');
    Route::get('professor-course-sections/{professorCourseSection}/edit', [ProfessorCourseSectionController::class, 'edit'])->name('professor-course-sections.edit')->middleware('permission:professor-course-sections.edit');
    Route::put('professor-course-sections/{professorCourseSection}', [ProfessorCourseSectionController::class, 'update'])->name('professor-course-sections.update')->middleware('permission:professor-course-sections.edit');
    Route::delete('professor-course-sections/{professorCourseSection}', [ProfessorCourseSectionController::class, 'destroy'])->name('professor-course-sections.destroy')->middleware('permission:professor-course-sections.delete');

    Route::get('student-course-sections', [StudentCourseSectionController::class, 'index'])->name('student-course-sections.index')->middleware('permission:student-course-sections.view');
    Route::get('student-course-sections/create', [StudentCourseSectionController::class, 'create'])->name('student-course-sections.create')->middleware('permission:student-course-sections.create');
    Route::post('student-course-sections', [StudentCourseSectionController::class, 'store'])->name('student-course-sections.store')->middleware('permission:student-course-sections.create');
    Route::get('student-course-sections/{studentCourseSection}', [StudentCourseSectionController::class, 'show'])->name('student-course-sections.show')->middleware('permission:student-course-sections.view');
    Route::get('student-course-sections/{studentCourseSection}/edit', [StudentCourseSectionController::class, 'edit'])->name('student-course-sections.edit')->middleware('permission:student-course-sections.edit');
    Route::put('student-course-sections/{studentCourseSection}', [StudentCourseSectionController::class, 'update'])->name('student-course-sections.update')->middleware('permission:student-course-sections.edit');
    Route::delete('student-course-sections/{studentCourseSection}', [StudentCourseSectionController::class, 'destroy'])->name('student-course-sections.destroy')->middleware('permission:student-course-sections.delete');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
