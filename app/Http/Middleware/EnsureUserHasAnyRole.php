<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasAnyRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_unless($user, 403);

        if ($user->hasRole('admin')) {
            return $next($request);
        }

        abort_unless($user->hasAnyRole($roles), 403);

        return $next($request);
    }
}