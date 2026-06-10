<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Scenario;
use App\Models\StudentGroup;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAssignmentController extends Controller
{
    public function index(): Response
    {
        $assignments = Assignment::query()
            ->with([
                'scenario.vessel',
                'student',
                'assignedBy',
                'studentGroup',
                'submission',
            ])
            ->latest('assigned_at')
            ->latest('id')
            ->get();

        $students = User::role('student')
            ->orderBy('name')
            ->get()
            ->map(fn (User $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'auth_provider' => $student->auth_provider ?? 'local',
            ])
            ->values();

        $groups = StudentGroup::query()
            ->with(['students' => fn ($query) => $query->orderBy('name')])
            ->where('status', 'active')
            ->orderBy('academic_year')
            ->orderBy('name')
            ->get()
            ->map(fn (StudentGroup $group) => [
                'id' => $group->id,
                'name' => $group->name,
                'code' => $group->code,
                'academic_year' => $group->academic_year,
                'type' => $group->type,
                'external_source' => $group->external_source,
                'external_id' => $group->external_id,
                'students_count' => $group->students->count(),
                'students' => $group->students
                    ->map(fn (User $student) => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                    ])
                    ->values(),
            ])
            ->values();

        $scenarios = Scenario::query()
            ->with('vessel')
            ->where('status', 'published')
            ->orderBy('title')
            ->get()
            ->map(fn (Scenario $scenario) => [
                'id' => $scenario->id,
                'title' => $scenario->title,
                'difficulty' => $scenario->difficulty,
                'mode' => $scenario->mode,
                'vessel' => [
                    'id' => $scenario->vessel?->id,
                    'name' => $scenario->vessel?->name ?? '-',
                    'imo_number' => $scenario->vessel?->imo_number ?? '-',
                ],
            ])
            ->values();

        return Inertia::render('TeacherAssignments/Index', [
            'stats' => [
                'total' => $assignments->count(),
                'assigned' => $assignments->where('status', 'assigned')->count(),
                'in_progress' => $assignments->where('status', 'in_progress')->count(),
                'submitted' => $assignments->where('status', 'submitted')->count(),
                'graded' => $assignments->where('status', 'graded')->count(),
                'students' => $students->count(),
                'groups' => $groups->count(),
            ],
            'assignments' => $assignments
                ->map(fn (Assignment $assignment) => $this->mapAssignment($assignment))
                ->values(),
            'students' => $students,
            'groups' => $groups,
            'scenarios' => $scenarios,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'scenario_id' => ['required', 'exists:scenarios,id'],
            'target_type' => ['required', 'in:student,group'],
            'student_id' => ['nullable', 'required_if:target_type,student', 'exists:users,id'],
            'student_group_id' => ['nullable', 'required_if:target_type,group', 'exists:student_groups,id'],
            'due_at' => ['nullable', 'date'],
        ]);

        $scenario = Scenario::query()
            ->where('status', 'published')
            ->findOrFail($validated['scenario_id']);

        if ($validated['target_type'] === 'student') {
            $student = User::role('student')->findOrFail($validated['student_id']);

            $createdCount = $this->assignScenarioToStudents(
                scenario: $scenario,
                students: collect([$student]),
                request: $request,
                dueAt: $validated['due_at'] ?? null,
                group: null,
            );

            return back()->with(
                'success',
                $createdCount > 0
                    ? 'Uzdevums piešķirts studentam.'
                    : 'Šim studentam šis scenārijs jau bija piešķirts. Dati tika atjaunoti.',
            );
        }

        $group = StudentGroup::query()
            ->with(['students' => fn ($query) => $query->role('student')])
            ->where('status', 'active')
            ->findOrFail($validated['student_group_id']);

        if ($group->students->isEmpty()) {
            return back()->with('error', 'Izvēlētajā klasē/grupā nav neviena aktīva studenta.');
        }

        $createdCount = $this->assignScenarioToStudents(
            scenario: $scenario,
            students: $group->students,
            request: $request,
            dueAt: $validated['due_at'] ?? null,
            group: $group,
        );

        return back()->with(
            'success',
            "Uzdevums piešķirts klasei/grupai. Jauni piešķīrumi: {$createdCount}.",
        );
    }

    private function assignScenarioToStudents(
        Scenario $scenario,
        Collection $students,
        Request $request,
        ?string $dueAt,
        ?StudentGroup $group,
    ): int {
        $createdCount = 0;

        foreach ($students as $student) {
            $assignment = Assignment::query()
                ->firstOrNew([
                    'scenario_id' => $scenario->id,
                    'user_id' => $student->id,
                ]);

            if (! $assignment->exists) {
                $assignment->status = 'assigned';
                $assignment->assigned_at = now();
                $createdCount++;
            }

            $assignment->fill([
                'assigned_by_user_id' => $request->user()->id,
                'student_group_id' => $group?->id,
                'due_at' => $dueAt,
            ]);

            $assignment->save();
        }

        return $createdCount;
    }

    private function mapAssignment(Assignment $assignment): array
    {
        return [
            'id' => $assignment->id,
            'status' => $assignment->status,
            'assigned_at' => $assignment->assigned_at?->format('d.m.Y H:i'),
            'started_at' => $assignment->started_at?->format('d.m.Y H:i'),
            'submitted_at' => $assignment->submitted_at?->format('d.m.Y H:i'),
            'due_at' => $assignment->due_at?->format('d.m.Y H:i'),
            'score' => $assignment->submission?->score !== null
                ? (float) $assignment->submission?->score
                : null,
            'submission_id' => $assignment->submission?->id,
            'student' => [
                'id' => $assignment->student?->id,
                'name' => $assignment->student?->name ?? '-',
                'email' => $assignment->student?->email ?? '-',
            ],
            'assigned_by' => [
                'id' => $assignment->assignedBy?->id,
                'name' => $assignment->assignedBy?->name ?? '-',
            ],
            'student_group' => $assignment->studentGroup ? [
                'id' => $assignment->studentGroup->id,
                'name' => $assignment->studentGroup->name,
                'code' => $assignment->studentGroup->code,
                'external_source' => $assignment->studentGroup->external_source,
            ] : null,
            'scenario' => [
                'id' => $assignment->scenario?->id,
                'title' => $assignment->scenario?->title ?? '-',
                'difficulty' => $assignment->scenario?->difficulty ?? '-',
                'mode' => $assignment->scenario?->mode ?? '-',
            ],
            'vessel' => [
                'id' => $assignment->scenario?->vessel?->id,
                'name' => $assignment->scenario?->vessel?->name ?? '-',
                'imo_number' => $assignment->scenario?->vessel?->imo_number ?? '-',
            ],
        ];
    }
}