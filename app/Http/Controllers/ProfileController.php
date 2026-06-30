<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Assignment;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'isStudentProfile' => $user->hasRole('student'),
            'studentProfile' => $user->hasRole('student')
                ? $this->studentProfileData($user)
                : null,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        abort_if($request->user()->hasRole('student'), 403);

        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        abort_if($request->user()->hasRole('student'), 403);

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    private function studentProfileData($user): array
    {
        $groups = $user->studentGroups()
            ->orderByDesc('student_group_user.joined_at')
            ->orderBy('student_groups.name')
            ->get()
            ->map(fn ($group) => [
                'id' => $group->id,
                'name' => $group->name,
                'code' => $group->code,
                'academic_year' => $group->academic_year,
            ])
            ->values();

        $tasks = Assignment::query()
            ->with(['scenario.vessel', 'submission'])
            ->where('user_id', $user->id)
            ->latest('assigned_at')
            ->latest('id')
            ->get()
            ->map(fn (Assignment $assignment) => [
                'id' => $assignment->id,
                'status' => $assignment->status,
                'assigned_at' => $assignment->assigned_at?->format('d.m.Y H:i'),
                'due_at' => $assignment->due_at?->format('d.m.Y H:i'),
                'submitted_at' => $assignment->submitted_at?->format('d.m.Y H:i'),
                'scenario_title' => $assignment->scenario?->title ?? '-',
                'vessel_name' => $assignment->scenario?->vessel?->name,
                'score' => $assignment->submission?->score !== null
                    ? (float) $assignment->submission->score
                    : null,
                'teacher_comment' => $assignment->submission?->teacher_comment,
            ])
            ->values();

        return [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at?->format('d.m.Y'),
            ],
            'groups' => $groups,
            'tasks' => $tasks,
        ];
    }
}
