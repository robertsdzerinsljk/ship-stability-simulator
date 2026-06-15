<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->values()->toArray(),
                ] : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $request->user() ? [
            'unread_count' => $request->user()->unreadNotifications()->count(),
            'items' => $request->user()
                ->notifications()
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn ($notification) => [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? 'Paziņojums',
                    'message' => $notification->data['message'] ?? '',
                    'href' => $notification->data['href'] ?? '/dashboard',
                    'type' => $notification->data['type'] ?? 'general',
                    'read_at' => $notification->read_at?->format('d.m.Y H:i'),
                    'created_at' => $notification->created_at?->diffForHumans(),
                ])
                ->values(),
        ] : [
    'unread_count' => 0,
    'items' => [],
],
        ];
    }
}
