<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SchoolAdminController extends Controller
{
    /**
     * Ensure only super admins can access this controller.
     */
    protected function authorizeSuperAdmin(): void
    {
        /** @var \App\Models\User $authUser */
        $authUser = Auth::user();

        if (!$authUser->hasRole('super_admin')) {
            abort(403, 'Only super admins can access the School Admin module.');
        }
    }

    /**
     * Display a listing of all Admin accounts.
     */
    public function index()
    {
        $this->authorizeSuperAdmin();

        $users = User::with('roles', 'school')
            ->whereHas('roles', fn ($q) => $q->where('name', 'Admin'))
            ->get();

        return Inertia::render('SchoolAdminPage/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new Admin.
     */
    public function create()
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('SchoolAdminPage/Add', [
            'schools' => School::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created Admin in the database.
     */
    public function store(Request $request)
    {
        $this->authorizeSuperAdmin();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'school_id' => 'required|exists:schools,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'school_id' => $request->school_id,
        ]);

        $user->assignRole('Admin');

        return redirect()->route('school-admins.index')->with('success', 'Admin created successfully.');
    }

    /**
     * Display the specified Admin.
     */
    public function show(string $id)
    {
        $this->authorizeSuperAdmin();

        $user = User::with('school')->findOrFail($id);

        return Inertia::render('SchoolAdminPage/View', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified Admin.
     */
    public function edit(string $id)
    {
        $this->authorizeSuperAdmin();

        $user = User::with('roles')->findOrFail($id);

        return Inertia::render('SchoolAdminPage/Edit', [
            'user' => $user,
            'schools' => School::all(['id', 'name']),
        ]);
    }

    /**
     * Update the specified Admin in the database.
     */
    public function update(Request $request, string $id)
    {
        $this->authorizeSuperAdmin();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'school_id' => 'required|exists:schools,id',
        ]);

        $user = User::findOrFail($id);
        $user->name = $request->name;
        $user->email = $request->email;
        $user->school_id = $request->school_id;

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->route('school-admins.index')->with('success', 'Admin updated successfully.');
    }

    /**
     * Remove the specified Admin from the database.
     */
    public function destroy(string $id)
    {
        $this->authorizeSuperAdmin();

        User::findOrFail($id)->delete();

        return redirect()->route('school-admins.index')->with('success', 'Admin deleted successfully.');
    }
}