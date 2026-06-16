<?php

namespace App\Http\Controllers;

use App\Models\CargoType;
use App\Models\StudentGroup;
use App\Models\User;
use App\Models\Vessel;
use App\Models\VesselLimit;
use App\Support\InstitutionalEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $roles = Role::query()
            ->orderBy('name')
            ->pluck('name')
            ->values();

        return Inertia::render('Settings/Index', [
            'stats' => [
                'users' => User::count(),
                'students' => User::role('student')->count(),
                'teachers' => User::role('teacher')->count(),
                'admins' => User::role('admin')->count(),
                'cargo_types' => CargoType::count(),
                'vessel_limits' => VesselLimit::count(),
            ],
            'roles' => $roles,
            'users' => User::query()
                ->with(['roles', 'studentGroups'])
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'auth_provider' => $user->auth_provider ?? 'local',
                    'roles' => $user->roles->pluck('name')->values(),
                    'student_group_id' => $user->studentGroups->first()?->id,
                    'student_group_name' => $user->studentGroups->first()?->name,
                ])
                ->values(),
            'studentGroups' => StudentGroup::query()
                ->withCount('students')
                ->where('status', 'active')
                ->orderByDesc('academic_year')
                ->orderBy('name')
                ->get()
                ->map(fn (StudentGroup $group) => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'code' => $group->code,
                    'academic_year' => $group->academic_year,
                    'students_count' => $group->students_count,
                ])
                ->values(),
            'vesselLimits' => VesselLimit::query()
                ->with('vessel')
                ->orderBy(
                    Vessel::select('name')
                        ->whereColumn('vessels.id', 'vessel_limits.vessel_id')
                        ->limit(1),
                )
                ->get()
                ->map(fn (VesselLimit $limit) => [
                    'id' => $limit->id,
                    'vessel_name' => $limit->vessel?->name ?? '-',
                    'min_gm' => (float) $limit->min_gm,
                    'max_draft' => (float) $limit->max_draft,
                    'max_trim' => (float) $limit->max_trim,
                    'max_heel' => (float) $limit->max_heel,
                    'max_compartment_load_percent' => (float) $limit->max_compartment_load_percent,
                    'load_line_note' => $limit->load_line_note,
                ])
                ->values(),
            'cargoTypes' => CargoType::query()
                ->orderBy('category')
                ->orderBy('name')
                ->get()
                ->map(fn (CargoType $cargoType) => [
                    'id' => $cargoType->id,
                    'name' => $cargoType->name,
                    'category' => $cargoType->category,
                    'density' => $cargoType->density !== null ? (float) $cargoType->density : null,
                    'stowage_factor' => $cargoType->stowage_factor !== null ? (float) $cargoType->stowage_factor : null,
                    'status' => $cargoType->status,
                    'notes' => $cargoType->notes,
                ])
                ->values(),
        ]);
    }

    public function storeUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:users,email',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (! InstitutionalEmail::isAllowed((string) $value)) {
                        $fail('Lietotajam jaizmanto @ljk.lv vai @ljkstudents.lv e-pasts.');
                    }
                },
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'student_group_id' => ['nullable', 'exists:student_groups,id'],
        ]);

        $defaultRole = InstitutionalEmail::roleFor($validated['email']);
        $roles = collect($validated['roles'] ?? [$defaultRole])
            ->filter()
            ->values()
            ->all();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'auth_provider' => 'local',
        ]);

        $user->syncRoles($roles);

        if ($user->hasRole('student') && ! empty($validated['student_group_id'])) {
            $this->syncStudentGroup($user, (int) $validated['student_group_id']);
        }

        return back()->with('success', 'Lietotajs izveidots.');
    }

    public function updateUserRoles(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user->syncRoles($validated['roles']);

        return back()->with('success', 'Lietotaja lomas atjauninatas.');
    }

    public function updateUserGroup(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'student_group_id' => ['nullable', 'exists:student_groups,id'],
        ]);

        if (! $user->hasRole('student')) {
            return back()->with('error', 'Grupu var piesaistit tikai studentam.');
        }

        $user->studentGroups()->detach();

        if (! empty($validated['student_group_id'])) {
            $this->syncStudentGroup($user, (int) $validated['student_group_id']);
        }

        return back()->with('success', 'Studenta grupa atjauninata.');
    }

    public function destroyUser(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            return back()->with('error', 'Savu administratora kontu nevar izdzest.');
        }

        $user->delete();

        return back()->with('success', 'Lietotajs izdzests.');
    }

    public function storeStudentGroup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:30'],
            'academic_year' => ['required', 'string', 'max:20'],
            'type' => ['required', Rule::in(['class', 'course', 'group'])],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        StudentGroup::query()->firstOrCreate(
            [
                'name' => mb_strtoupper(trim($validated['name'])),
                'academic_year' => $validated['academic_year'],
            ],
            [
                'created_by_user_id' => $request->user()->id,
                'code' => filled($validated['code'] ?? null) ? mb_strtoupper(trim($validated['code'])) : null,
                'type' => $validated['type'],
                'external_source' => 'local',
                'description' => $validated['description'] ?? null,
                'status' => 'active',
            ],
        );

        return back()->with('success', 'Grupa izveidota.');
    }

    public function updateVesselLimit(Request $request, VesselLimit $vesselLimit): RedirectResponse
    {
        $validated = $request->validate([
            'min_gm' => ['required', 'numeric', 'min:0'],
            'max_draft' => ['required', 'numeric', 'min:0'],
            'max_trim' => ['required', 'numeric', 'min:0'],
            'max_heel' => ['required', 'numeric', 'min:0'],
            'max_compartment_load_percent' => ['required', 'numeric', 'min:1', 'max:150'],
            'load_line_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $vesselLimit->update($validated);

        return back()->with('success', 'Kuga stabilitates robezas atjauninatas.');
    }

    public function updateCargoType(Request $request, CargoType $cargoType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'density' => ['nullable', 'numeric', 'min:0'],
            'stowage_factor' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:active,inactive'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $cargoType->update($validated);

        return back()->with('success', 'Kravas tips atjauninats.');
    }

    private function syncStudentGroup(User $user, int $studentGroupId): void
    {
        $user->studentGroups()->syncWithoutDetaching([
            $studentGroupId => [
                'member_role' => 'student',
                'status' => 'active',
                'external_source' => 'admin',
                'joined_at' => now(),
            ],
        ]);
    }
}
