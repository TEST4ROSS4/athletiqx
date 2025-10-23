<?php

use App\Http\Controllers\Auth\MobileAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/mobile-login', [MobileAuthController::class, 'mobileLogin']);
Route::get('/users', [MobileAuthController::class, 'getAllUsers']);
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




