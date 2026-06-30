<?php

namespace Tests\Feature;

use App\Models\StudentGroup;
use App\Models\User;
use App\Support\ApplicationRoles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentOnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_select_allowed_group_code(): void
    {
        ApplicationRoles::ensureDefaults();

        $student = User::factory()->create([
            'email' => 'student@ljkstudents.lv',
        ]);
        $student->assignRole(ApplicationRoles::STUDENT);

        $this->actingAs($student)
            ->post(route('onboarding.student-group.update'), [
                'academic_year' => '2025/2026',
                'group_code' => 'S-21',
            ])
            ->assertRedirect(route('dashboard', absolute: false));

        $group = StudentGroup::query()
            ->where('name', 'S-21')
            ->where('academic_year', '2025/2026')
            ->firstOrFail();

        $this->assertTrue($student->studentGroups()->whereKey($group->id)->exists());
    }

    public function test_student_cannot_select_group_outside_catalog(): void
    {
        ApplicationRoles::ensureDefaults();

        $student = User::factory()->create([
            'email' => 'student@ljkstudents.lv',
        ]);
        $student->assignRole(ApplicationRoles::STUDENT);

        $this->actingAs($student)
            ->from(route('onboarding.student-group'))
            ->post(route('onboarding.student-group.update'), [
                'academic_year' => '2025/2026',
                'group_code' => 'CUSTOM-1',
            ])
            ->assertRedirect(route('onboarding.student-group'));

        $this->assertDatabaseMissing('student_groups', [
            'name' => 'CUSTOM-1',
            'academic_year' => '2025/2026',
        ]);
        $this->assertFalse($student->studentGroups()->exists());
    }
}
