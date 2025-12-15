<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RejectStudentWebAccess
{
    /**
     * Prevent Student role from accessing the web app.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('Student')) {
            abort(403, 'Students can use the mobile app only.');
        }

        return $next($request);
    }
}
