<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class SuperAdminDashboardController extends Controller
{
    public function index()
    {
        // Total schools registered
        $totalSchools = School::count();

        // Recently added schools (last 5)
        $recentSchools = School::orderByDesc('created_at')
            ->take(5)
            ->get(['name', 'code', 'created_at']);

        // ✅ Dynamic role distribution
        $roles = Role::all()->pluck('name');
        $roleDistribution = $roles->mapWithKeys(function ($role) {
            return [$role => User::role($role)->count()];
        });

        // Active users snapshot (approx via updated_at)
        $activeUsersToday = User::whereDate('updated_at', now()->toDateString())->count();
        $activeUsersWeek  = User::whereBetween('updated_at', [now()->startOfWeek(), now()->endOfWeek()])->count();

        // Top active schools (ranked by number of users updated this week)
        $topActiveSchools = User::select('school_id', DB::raw('COUNT(*) as users_count'))
            ->whereBetween('updated_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->groupBy('school_id')
            ->orderByDesc('users_count')
            ->take(5)
            ->with('school:id,name')
            ->get()
            ->map(fn($row) => [
                'name'   => $row->school->name ?? 'Unknown',
                'logins' => $row->users_count,
            ]);

        return Inertia::render('SuperAdminDashboard', [
            'totalSchools'     => $totalSchools,
            'recentSchools'    => $recentSchools,
            'roleDistribution' => $roleDistribution, // dynamic roles
            'activeUsersToday' => $activeUsersToday,
            'activeUsersWeek'  => $activeUsersWeek,
            'topActiveSchools' => $topActiveSchools,
        ]);
    }
}