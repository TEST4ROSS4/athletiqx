<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
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
            "users" => User::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("UsersPage/Add");
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

        User::create(
            $request->only(["name", "email"])
                +
                ["password" => Hash::make($request->password)]
        );

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
            "user" => $user
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

        return to_route("users.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
