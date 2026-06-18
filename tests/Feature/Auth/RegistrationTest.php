<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'Student',
            'email' => 'test@ljkstudents.lv',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('roles', [
            'name' => 'student',
            'guard_name' => 'web',
        ]);
        $this->assertTrue(auth()->user()->hasRole('student'));
    }

    public function test_registration_creates_missing_default_roles(): void
    {
        Role::query()->delete();

        $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'Teacher',
            'email' => 'teacher@ljk.lv',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('roles', [
            'name' => 'teacher',
            'guard_name' => 'web',
        ]);
        $this->assertTrue(auth()->user()->hasRole('teacher'));
    }
}
