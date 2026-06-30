<?php

namespace Tests\Feature;

use App\Models\StudentGroup;
use App\Models\User;
use App\Support\ApplicationRoles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }

    public function test_student_profile_is_read_only(): void
    {
        ApplicationRoles::ensureDefaults();

        $student = User::factory()->create([
            'name' => 'Original Student',
            'email' => 'student@ljkstudents.lv',
        ]);
        $student->assignRole(ApplicationRoles::STUDENT);
        $this->attachStudentToGroup($student);

        $this
            ->actingAs($student)
            ->patch('/profile', [
                'name' => 'Changed Student',
                'email' => 'changed@ljkstudents.lv',
            ])
            ->assertForbidden();

        $student->refresh();

        $this->assertSame('Original Student', $student->name);
        $this->assertSame('student@ljkstudents.lv', $student->email);
    }

    public function test_student_cannot_delete_profile(): void
    {
        ApplicationRoles::ensureDefaults();

        $student = User::factory()->create([
            'email' => 'student@ljkstudents.lv',
        ]);
        $student->assignRole(ApplicationRoles::STUDENT);
        $this->attachStudentToGroup($student);

        $this
            ->actingAs($student)
            ->delete('/profile', [
                'password' => 'password',
            ])
            ->assertForbidden();

        $this->assertNotNull($student->fresh());
    }

    public function test_student_cannot_change_password_from_profile(): void
    {
        ApplicationRoles::ensureDefaults();

        $student = User::factory()->create([
            'email' => 'student@ljkstudents.lv',
        ]);
        $student->assignRole(ApplicationRoles::STUDENT);

        $this
            ->actingAs($student)
            ->put(route('password.update'), [
                'current_password' => 'password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ])
            ->assertForbidden();
    }

    private function attachStudentToGroup(User $student): void
    {
        $group = StudentGroup::query()->create([
            'name' => 'S-21',
            'code' => 'S-21',
            'academic_year' => '2025/2026',
            'type' => 'class',
            'external_source' => 'self_registration',
            'status' => 'active',
        ]);

        $student->studentGroups()->attach($group->id, [
            'member_role' => 'student',
            'status' => 'active',
            'external_source' => 'self_registration',
            'joined_at' => now(),
        ]);
    }
}
