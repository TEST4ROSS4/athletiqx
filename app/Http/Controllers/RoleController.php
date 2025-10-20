<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::with('permissions')
            ->whereDoesntHave('permissions', function ($query) {
                $query->whereIn('module', ['super']);
            })
            ->get();

        return Inertia::render("RolesPage/Index", [
            "roles" => $roles
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = Permission::whereNotIn('module', ['super', 'school-admin'])->get();

        return Inertia::render("RolesPage/Add", [
            "permissions" => $permissions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "name" => "required",
            "permissions" => "required|array",
        ]);

        $role = Role::create(['name' => $request->name]);
        $allowed = Permission::whereNotIn('module', ['super', 'school-admin'])->pluck('name')->toArray();
        $filtered = array_intersect($request->permissions, $allowed);

        $role->syncPermissions($filtered);

        return to_route("roles.index");
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $role = Role::find($id);

        return Inertia::render("RolesPage/View", [
            "role" => $role,
            "permissions" => $role->permissions()->pluck("name")
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $role = Role::find($id);
        $permissions = Permission::whereNotIn('module', ['super', 'school-admin'])->get();

        return Inertia::render("RolesPage/Edit", [
            "role" => $role,
            "rolePermissions" => $role->permissions()->pluck("name"),
            "permissions" => $permissions
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            "name" => "required",
            "permissions" => "required|array",
        ]);

        $role = Role::find($id);
        $role->name = $request->name;
        $role->save();

        $allowed = Permission::whereNotIn('module', ['super', 'school-admin'])->pluck('name')->toArray();
        $filtered = array_intersect($request->permissions, $allowed);

        $role->syncPermissions($filtered);

        return to_route("roles.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Role::destroy($id);

        return to_route("roles.index");
    }
}