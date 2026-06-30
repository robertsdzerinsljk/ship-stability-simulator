<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApplicationRoles;
use App\Support\InstitutionalEmail;
use GuzzleHttp\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $driver = $this->googleDriver();

        if ($request->boolean('select_account')) {
            $driver->with(['prompt' => 'select_account']);
        }

        return $driver->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = $this->googleDriver()->stateless()->user();
        $email = mb_strtolower((string) $googleUser->getEmail());
        $role = InstitutionalEmail::roleFor($email);

        if ($role === null) {
            return redirect()
                ->route('login')
                ->with('error', 'Google pieslegsanai atlauti tikai @ljk.lv un @ljkstudents.lv konti.');
        }

        $user = User::query()->firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->fill([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: $email,
                'password' => Hash::make(Str::random(48)),
                'email_verified_at' => now(),
            ]);
        }

        $user->fill([
            'google_id' => $googleUser->getId(),
            'auth_provider' => 'google',
            'avatar' => $googleUser->getAvatar(),
        ]);

        if (! $user->email_verified_at) {
            $user->email_verified_at = now();
        }

        $user->save();

        if (! $user->hasAnyRole(['student', 'teacher', 'admin'])) {
            ApplicationRoles::ensureDefaults();
            $user->assignRole($role);
        }

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function googleDriver()
    {
        return Socialite::driver('google')->setHttpClient(
            new Client(config('services.google.guzzle', []))
        );
    }
}
