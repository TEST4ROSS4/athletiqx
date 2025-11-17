<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\MobileAuthController;
use App\Http\Controllers\Mobile\MobileCourseController;
use App\Http\Controllers\Mobile\MobileProgramAssignmentController;
use App\Http\Controllers\Mobile\MobileProgramsController;
use App\Http\Controllers\Mobile\MobileProgramStudentController;
use App\Http\Controllers\Mobile\MobileSportsController;

//AUTH AND USERS
Route::post('/mobile-login', [MobileAuthController::class, 'mobileLogin']);
Route::get('/users', [MobileAuthController::class, 'getAllUsers']);
Route::middleware('auth:sanctum')->get('/user/permissions', [MobileAuthController::class, 'getCurrentUserPermissions']);

//ACADEMICS MODULE
Route::middleware('auth:sanctum')->get('/my-courses', [MobileCourseController::class, 'getCoursesBySchool']);
Route::middleware('auth:sanctum')->get('/my-courses/students/{courseSection}', [MobileCourseController::class, 'getStudentsByCourse']);

//COACH:TEAM MODULE
Route::middleware('auth:sanctum')->get('/my-sports', [MobileSportsController::class, 'getAssignedSportsToCoach']);
Route::middleware('auth:sanctum')->get('/my-sports/players/{sportTeam}', [MobileSportsController::class, 'getPlayers']);
Route::middleware('auth:sanctum')->get('/my-sports/players/{sportTeam}/create', [MobileSportsController::class, 'fetchTeamMembersCreate']);
Route::middleware('auth:sanctum')->put('/my-sports/players/{studentSportTeam}/update', [MobileSportsController::class, 'update']);
Route::middleware('auth:sanctum')->post('/my-sports/players/{sportTeam}/store', [MobileSportsController::class, 'store']);
Route::middleware('auth:sanctum')->delete('/my-sports/players/{studentSportTeam}/delete', [MobileSportsController::class, 'destroy']);


//COACH:TRANING MODULE
Route::middleware('auth:sanctum')->get('/my-programs', [MobileProgramsController::class, 'index']);
Route::middleware('auth:sanctum')->get('/my-programs/{program}', [MobileProgramsController::class, 'show']);
Route::middleware('auth:sanctum')->post('/my-programs', [MobileProgramsController::class, 'store']);
Route::middleware('auth:sanctum')->delete('/my-programs/{program}', [MobileProgramsController::class, 'destroy']);
Route::middleware('auth:sanctum')->put('/my-programs/{id}', [MobileProgramsController::class, 'update']);

//COACH PROGRAM ASSIGNMENT
Route::middleware('auth:sanctum')->get('/program-assignments', [MobileProgramAssignmentController::class, 'allProgramAssignments']);
Route::middleware('auth:sanctum')->get('/program-assignments/students', [MobileProgramAssignmentController::class, 'getTeamsAssignedToCoach']);
Route::middleware('auth:sanctum')->post('/program-assignments/{program}/assignments', [MobileProgramAssignmentController::class, 'store']);
Route::middleware('auth:sanctum')->get('/program-assignments/{program}/assignments', [MobileProgramAssignmentController::class, 'fetchAssignments']);
Route::middleware('auth:sanctum')->put('/program-assignments/{program}/assignments', [MobileProgramAssignmentController::class, 'update']);

//STUDENT PROGRAM ASSIGNMENT
Route::middleware('auth:sanctum')->get('/my-assigned-programs', [MobileProgramStudentController::class, 'programsAssignedToMe']);


Route::post('/mobile-logout', function (Request $request) {
    $user = $request->user();
    // Optional: Check if user has the correct role before allowing logout
    // if (!$user->hasRole('mobile-user')) {
    //     return response()->json(['message' => 'Unauthorized logout attempt.'], 403);
    // }

    // Delete current token
    $user->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out successfully']);
})->middleware('auth:sanctum');
// routes/api.php
Route::middleware('auth:sanctum')->get('/token', function (Request $request) {
    return response()->json([
        'token' => $request->bearerToken(),
        'user' => $request->user(),
    ]);
});




