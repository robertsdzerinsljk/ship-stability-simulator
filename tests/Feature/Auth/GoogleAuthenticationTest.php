<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Support\ApplicationRoles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_login_links_existing_local_account_by_email(): void
    {
        ApplicationRoles::ensureDefaults();

        $existingUser = User::factory()->create([
            'name' => 'Local Student',
            'email' => 'student@ljkstudents.lv',
            'password' => Hash::make('local-password'),
            'auth_provider' => 'local',
            'google_id' => null,
        ]);
        $existingUser->assignRole(ApplicationRoles::STUDENT);

        $this->mockGoogleUser([
            'id' => 'google-student-1',
            'name' => 'Google Student',
            'email' => 'student@ljkstudents.lv',
            'avatar' => 'https://example.test/student.png',
        ]);

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticatedAs($existingUser);
        $this->assertSame(1, User::query()->count());
        $this->assertDatabaseHas('users', [
            'id' => $existingUser->id,
            'email' => 'student@ljkstudents.lv',
            'google_id' => 'google-student-1',
            'auth_provider' => 'google',
            'avatar' => 'https://example.test/student.png',
        ]);
        $this->assertTrue(Hash::check('local-password', $existingUser->refresh()->password));
    }

    public function test_google_login_creates_missing_default_roles(): void
    {
        Role::query()->delete();

        $this->mockGoogleUser([
            'id' => 'google-teacher-1',
            'name' => 'Google Teacher',
            'email' => 'teacher@ljk.lv',
            'avatar' => 'https://example.test/avatar.png',
        ]);

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('roles', [
            'name' => 'teacher',
            'guard_name' => 'web',
        ]);
        $this->assertTrue(auth()->user()->hasRole('teacher'));
    }

    /**
     * @param  array{id: string, name: string, email: string, avatar: string}  $attributes
     */
    private function mockGoogleUser(array $attributes): void
    {
        $googleUser = (new SocialiteUser)->map($attributes);

        $provider = Mockery::mock();
        $provider->shouldReceive('setHttpClient')->once()->andReturnSelf();
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($googleUser);

        Socialite::shouldReceive('driver')
            ->once()
            ->with('google')
            ->andReturn($provider);
    }
}
