<?php

namespace App\Http\Controllers;

use App\Models\StudentGroup;
use App\Support\StudentGroupCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentOnboardingController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->hasRole('student'), 403);

        if ($user->studentGroups()->exists()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding/StudentGroup', [
            'academicYears' => $this->academicYears(),
            'groupCodes' => StudentGroupCatalog::codes(),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->hasRole('student'), 403);

        $validated = $request->validate([
            'academic_year' => ['required', 'string', 'max:20'],
            'group_code' => ['required', 'string', Rule::in(StudentGroupCatalog::codes())],
        ]);

        $code = trim($validated['group_code']);

        $group = StudentGroup::query()->firstOrCreate(
            [
                'name' => $code,
                'academic_year' => $validated['academic_year'],
            ],
            [
                'created_by_user_id' => $user->id,
                'code' => $code,
                'type' => 'class',
                'external_source' => 'self_registration',
                'status' => 'active',
            ],
        );

        $user->studentGroups()->syncWithoutDetaching([
            $group->id => [
                'member_role' => 'student',
                'status' => 'active',
                'external_source' => 'self_registration',
                'joined_at' => now(),
            ],
        ]);

        return redirect()->route('dashboard')->with('success', 'Grupa piesaistita profilam.');
    }

    private function academicYears(): array
    {
        $year = (int) now()->format('Y');

        return collect(range($year - 2, $year + 2))
            ->map(fn (int $start) => "{$start}/".($start + 1))
            ->values()
            ->toArray();
    }
}
