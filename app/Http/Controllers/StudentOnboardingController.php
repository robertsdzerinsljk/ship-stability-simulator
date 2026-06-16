<?php

namespace App\Http\Controllers;

use App\Models\StudentGroup;
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
            'groups' => StudentGroup::query()
                ->where('status', 'active')
                ->orderByDesc('academic_year')
                ->orderBy('name')
                ->get()
                ->map(fn (StudentGroup $group) => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'code' => $group->code,
                    'academic_year' => $group->academic_year,
                ])
                ->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->hasRole('student'), 403);

        $validated = $request->validate([
            'academic_year' => ['required', 'string', 'max:20'],
            'group_mode' => ['required', Rule::in(['existing', 'new'])],
            'student_group_id' => ['nullable', 'required_if:group_mode,existing', 'exists:student_groups,id'],
            'group_code' => ['nullable', 'required_if:group_mode,new', 'string', 'max:30'],
        ]);

        if ($validated['group_mode'] === 'existing') {
            $group = StudentGroup::query()
                ->where('status', 'active')
                ->where('academic_year', $validated['academic_year'])
                ->findOrFail($validated['student_group_id']);
        } else {
            $code = mb_strtoupper(trim($validated['group_code']));

            $group = StudentGroup::query()->firstOrCreate(
                [
                    'name' => $code,
                    'academic_year' => $validated['academic_year'],
                ],
                [
                    'created_by_user_id' => $user->id,
                    'code' => $code,
                    'type' => 'class',
                    'external_source' => 'local',
                    'status' => 'active',
                ],
            );
        }

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
