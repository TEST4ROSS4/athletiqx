<?php

namespace App\Http\Controllers;

use App\Mail\DemoRequestAccepted;
use App\Mail\DemoRequestDeclined;
use App\Models\DemoRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class DemoRequestAdminController extends Controller
{
    public function index()
    {
        $this->authorizeSuperAdmin();

        $requests = DemoRequest::with('adminUser:id,name,email')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('SuperAdmin/DemoRequests', [
            'requests' => $requests,
        ]);
    }

    public function accept(DemoRequest $demoRequest)
    {
        $this->authorizeSuperAdmin();

        if ($demoRequest->status === 'accepted') {
            return back()->with('success', 'Demo request already accepted.');
        }

        // Ensure Admin role exists
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);

        $password = Str::random(12);

        // Create or update user
        $user = User::firstOrNew(['email' => $demoRequest->email]);
        $user->name = $user->name ?: 'Demo Admin';
        $user->password = Hash::make($password);
        $user->school_id = $user->school_id ?? null;
        $user->save();
        $user->syncRoles([$adminRole->name]);

        $demoRequest->status = 'accepted';
        $demoRequest->admin_user_id = $user->id;
        $demoRequest->save();

        $loginUrl = rtrim(config('app.url'), '/') . '/login';
        Mail::to($demoRequest->email)->send(new DemoRequestAccepted($demoRequest->email, $password, $loginUrl));

        return back()->with('success', 'Demo request accepted and admin credentials sent.');
    }

    public function decline(DemoRequest $demoRequest)
    {
        $this->authorizeSuperAdmin();

        $demoRequest->status = 'declined';
        $demoRequest->save();

        Mail::to($demoRequest->email)->send(new DemoRequestDeclined());

        return back()->with('success', 'Demo request declined and email sent.');
    }

    protected function authorizeSuperAdmin(): void
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user || !$user->hasRole('super_admin')) {
            abort(403);
        }
    }
}
