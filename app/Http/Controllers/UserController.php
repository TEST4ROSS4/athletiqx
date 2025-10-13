<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $query = User::with('roles');

        if ($user && !$user->hasRole('super_admin')) {
            $query->where('school_id', $user->school_id);
        }

        return Inertia::render("UsersPage/Index", [
            "users" => $query->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("UsersPage/Add", [
            "roles" => Role::pluck("name"),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        /** @var \App\Models\User $authUser */
        $authUser = Auth::user();

        $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email",
            "password" => "required|string|min:6",
            "roles" => "array",
            "school_id" => "nullable|exists:schools,id",
        ]);

        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => Hash::make($request->password),
            "school_id" => $authUser->hasRole('super_admin')
                ? $request->school_id
                : $authUser->school_id,
        ]);

        $user->syncRoles($request->roles);

        return to_route("users.index");
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with('roles')->findOrFail($id);

        $this->authorizeSchoolAccess($user);

        return Inertia::render("UsersPage/View", [
            "user" => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::findOrFail($id);

        $this->authorizeSchoolAccess($user);

        return Inertia::render("UsersPage/Edit", [
            "user" => $user,
            "userRole" => $user->roles()->pluck("name"),
            "roles" => Role::pluck("name"),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        /** @var \App\Models\User $authUser */
        $authUser = Auth::user();

        $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email," . $id,
            "password" => "nullable|string|min:6",
            "roles" => "array",
            "school_id" => "nullable|exists:schools,id",
        ]);

        $user = User::findOrFail($id);

        $this->authorizeSchoolAccess($user);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        if ($authUser->hasRole('super_admin') && $request->school_id) {
            $user->school_id = $request->school_id;
        }

        $user->save();

        $user->syncRoles($request->roles);

        return to_route("users.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        $this->authorizeSchoolAccess($user);

        $user->delete();

        return to_route("users.index");
    }

    /**
     * Restrict access to users outside current school.
     */
    protected function authorizeSchoolAccess(User $user)
    {
        /** @var \App\Models\User $authUser */
        $authUser = Auth::user();

        if (
            !$authUser->hasRole('super_admin') &&
            $user->school_id !== $authUser->school_id
        ) {
            abort(403, 'Unauthorized access to user.');
        }
    }
}