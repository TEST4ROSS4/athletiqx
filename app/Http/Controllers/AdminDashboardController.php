<?php

namespace App\Http\Controllers;

use App\Models\NewsPost;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminDashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user || (!$user->hasRole('Admin') && !$user->hasRole('school-admin'))) {
            abort(403);
        }

        $schoolId = $user->school_id;

        // Fallback to avoid leaking platform-wide data if no school is set
        if (!$schoolId) {
            return Inertia::render('AdminDashboard', [
                'schoolName'        => $user->school->name ?? 'Your School',
                'totalUsers'        => 0,
                'activeUsersToday'  => 0,
                'activeUsersWeek'   => 0,
                'roleDistribution'  => collect(),
                'recentNews'        => [],
            ]);
        }

        $totalUsers = User::where('school_id', $schoolId)->count();
        $activeUsersToday = User::where('school_id', $schoolId)
            ->whereDate('updated_at', now()->toDateString())
            ->count();
        $activeUsersWeek = User::where('school_id', $schoolId)
            ->whereBetween('updated_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        // Exclude platform-level roles from school admin view
        $roles = Role::whereNotIn('name', ['super_admin', 'Admin'])->pluck('name');
        $roleDistribution = $roles->mapWithKeys(function ($role) use ($schoolId) {
            return [$role => User::role($role)->where('school_id', $schoolId)->count()];
        });

        $recentNews = NewsPost::with('user:id,name')
            ->where(function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId)->orWhere('is_global', true);
            })
            ->orderByDesc('created_at')
            ->take(5)
            ->get(['id', 'title', 'created_at', 'is_global', 'school_id', 'user_id'])
            ->map(fn($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'created_at' => $post->created_at,
                'is_global' => $post->is_global,
                'author' => $post->user->name ?? 'Unknown',
            ]);

        return Inertia::render('AdminDashboard', [
            'schoolName'        => $user->school->name ?? 'Your School',
            'totalUsers'        => $totalUsers,
            'activeUsersToday'  => $activeUsersToday,
            'activeUsersWeek'   => $activeUsersWeek,
            'roleDistribution'  => $roleDistribution,
            'recentNews'        => $recentNews,
        ]);
    }
}
