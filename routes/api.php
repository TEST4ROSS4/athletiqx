<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\MobileAuthController;
use App\Http\Controllers\Mobile\MobileCourseController;
use App\Http\Controllers\Mobile\MobileSportsController;


Route::post('/mobile-login', [MobileAuthController::class, 'mobileLogin']);
Route::get('/users', [MobileAuthController::class, 'getAllUsers']);
Route::middleware('auth:sanctum')->get('/my-courses', [MobileCourseController::class, 'getCoursesBySchool']);
Route::middleware('auth:sanctum')->get('/my-sports', [MobileSportsController::class, 'getAssignedSportsToCoach']);
Route::middleware('auth:sanctum')->get('/my-sports/players/{sportTeam}', [MobileSportsController::class, 'getPlayers']);
Route::middleware('auth:sanctum')->get('/my-sports/players/{sportTeam}/create', [MobileSportsController::class, 'fetchTeamMembersCreate']);
Route::middleware('auth:sanctum')->post('/my-sports/players/{sportTeam}/store', [MobileSportsController::class, 'store']);
Route::middleware('auth:sanctum')->delete('/my-sports/players/{studentSportTeam}/delete', [MobileSportsController::class, 'destroy']);

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




