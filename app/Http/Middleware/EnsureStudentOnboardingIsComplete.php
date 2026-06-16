<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentOnboardingIsComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user
            && $user->hasRole('student')
            && ! $user->hasRole('admin')
            && ! $request->routeIs('onboarding.*')
            && ! $request->routeIs('logout')
            && ! $user->studentGroups()->exists()
        ) {
            return redirect()->route('onboarding.student-group');
        }

        return $next($request);
    }
}
