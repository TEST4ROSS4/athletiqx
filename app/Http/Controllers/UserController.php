<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("UsersPage/Index", [
            "users" => User::with("roles")->get()
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
        $request->validate([
            "name" => "required",
            "email" => "required",
            "password" => "required",
        ]);

        $user = User::create(
            $request->only(["name", "email"])
                +
                ["password" => Hash::make($request->password)]
        );

        $user->syncRoles($request->roles);

        return to_route("users.index");
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Inertia::render("UsersPage/View", [
            "user" => User::find($id)
            ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::find($id);

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
        
        $request->validate([
            "name" => "required",
            "email" => "required",
        ]);

        $user = User::find($id);
        $user->name = $request->name;
        $user->email = $request->email;

        if($request->password) {
            $user->password = Hash::make($request->password);
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
        User::destroy($id);

        return to_route("users.index");
    }
}
