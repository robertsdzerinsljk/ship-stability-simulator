<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_login_creates_missing_default_roles(): void
    {
        Role::query()->delete();

        $googleUser = (new SocialiteUser)->map([
            'id' => 'google-teacher-1',
            'name' => 'Google Teacher',
            'email' => 'teacher@ljk.lv',
            'avatar' => 'https://example.test/avatar.png',
        ]);

        $provider = Mockery::mock();
        $provider->shouldReceive('setHttpClient')->once()->andReturnSelf();
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($googleUser);

        Socialite::shouldReceive('driver')
            ->once()
            ->with('google')
            ->andReturn($provider);

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('roles', [
            'name' => 'teacher',
            'guard_name' => 'web',
        ]);
        $this->assertTrue(auth()->user()->hasRole('teacher'));
    }
}
