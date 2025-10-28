<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
    public function mobileLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $user = $request->user();

        // Optional: Check for specific role or permission
        // if (!$user->hasRole('mobile-user')) {
        //     throw ValidationException::withMessages([
        //         'email' => ['Access denied. You do not have the required role.'],
        //     ]);
        // }

        // Generate token (Sanctum)
        $token = $user->createToken('mobile', $user->getAllPermissions()->pluck('name')->toArray())->plainTextToken;

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(), // Optional: return roles
            'permissions' => $user->getAllPermissions()->pluck('name'), // Optional: return permissions
            'token' => $token,
        ]);
    }

    public function getAllUsers()
{
    $users = User::with(['roles', 'permissions'])->get();

    $formatted = $users->map(function ($user) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames(), // returns a collection of role names
            'permissions' => $user->getAllPermissions()->pluck('name'), // returns a collection of permission names
        ];
    });

    return response()->json([
        'users' => $formatted,
    ]);
}

}
