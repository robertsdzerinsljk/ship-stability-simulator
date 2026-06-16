<?php

namespace App\Http\Controllers;

use App\Domain\Assignments\Services\AssignmentDeadlineService;
use App\Models\Assignment;
use App\Models\StudentGroup;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class TeacherStudentController extends Controller
{
    public function index(): Response
    {
        $groups = StudentGroup::query()
            ->with(['students' => fn ($query) => $query->orderBy('name')])
            ->where('status', 'active')
            ->orderBy('academic_year')
            ->orderBy('name')
            ->get();

        $students = User::role('student')
            ->with(['studentGroups' => fn ($query) => $query->orderBy('name')])
            ->orderBy('name')
            ->get();

        return Inertia::render('TeacherStudents/Index', [
            'stats' => [
                'students' => $students->count(),
                'groups' => $groups->count(),
                'students_without_group' => $students
                    ->filter(fn (User $student) => $student->studentGroups->isEmpty())
                    ->count(),
            ],
            'groups' => $groups
                ->map(fn (StudentGroup $group) => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'code' => $group->code,
                    'academic_year' => $group->academic_year,
                    'type' => $group->type,
                    'external_source' => $group->external_source,
                    'external_id' => $group->external_id,
                    'description' => $group->description,
                    'status' => $group->status,
                    'synced_at' => $group->synced_at?->format('d.m.Y H:i'),
                    'students_count' => $group->students->count(),
                    'students' => $group->students
                        ->map(fn (User $student) => [
                            'id' => $student->id,
                            'name' => $student->name,
                            'email' => $student->email,
                        ])
                        ->values(),
                ])
                ->values(),
            'students' => $students
                ->map(fn (User $student) => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'groups' => $student->studentGroups
                        ->map(fn (StudentGroup $group) => [
                            'id' => $group->id,
                            'name' => $group->name,
                            'code' => $group->code,
                            'academic_year' => $group->academic_year,
                            'external_source' => $group->external_source,
                        ])
                        ->values(),
                ])
                ->values(),
        ]);
    }

    public function show(User $student, AssignmentDeadlineService $deadlineService): Response
    {
        abort_unless($student->hasRole('student'), 404);
        $teacher = request()->user();

        $deadlineService->syncOverdueAssignments();

        $student->load([
            'studentGroups' => fn ($query) => $query
                ->wherePivot('status', 'active')
                ->orderBy('academic_year')
                ->orderBy('name'),
        ]);

        $assignments = Assignment::query()
            ->with([
                'scenario.vessel',
                'studentGroup',
                'assignedBy',
                'submission',
            ])
            ->where('user_id', $student->id)
            ->when(
                ! $teacher->hasRole('admin'),
                fn ($query) => $query->where('assigned_by_user_id', $teacher->id),
            )
            ->latest('assigned_at')
            ->latest('id')
            ->get();

        return Inertia::render('TeacherStudents/Show', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'auth_provider' => $student->auth_provider ?? 'local',
                'created_at' => $student->created_at?->format('d.m.Y H:i'),
                'groups' => $student->studentGroups
                    ->map(fn ($group) => [
                        'id' => $group->id,
                        'name' => $group->name,
                        'code' => $group->code,
                        'academic_year' => $group->academic_year,
                    ])
                    ->values(),
            ],

            'stats' => [
                'total' => $assignments->count(),
                'assigned' => $assignments->where('status', 'assigned')->count(),
                'in_progress' => $assignments->where('status', 'in_progress')->count(),
                'submitted' => $assignments->where('status', 'submitted')->count(),
                'graded' => $assignments->where('status', 'graded')->count(),
                'overdue' => $assignments->where('status', 'overdue')->count(),
                'average_score' => round(
                    (float) $assignments
                        ->pluck('submission.score')
                        ->filter(fn ($score) => $score !== null)
                        ->avg(),
                    2
                ),
            ],

            'assignments' => $assignments
                ->map(fn (Assignment $assignment) => [
                    'id' => $assignment->id,
                    'status' => $assignment->status,
                    'assigned_at' => $assignment->assigned_at?->format('d.m.Y H:i'),
                    'started_at' => $assignment->started_at?->format('d.m.Y H:i'),
                    'submitted_at' => $assignment->submitted_at?->format('d.m.Y H:i'),
                    'due_at' => $assignment->due_at?->format('d.m.Y H:i'),
                    'scenario' => [
                        'id' => $assignment->scenario?->id,
                        'title' => $assignment->scenario?->title ?? '-',
                        'difficulty' => $assignment->scenario?->difficulty ?? '-',
                        'mode' => $assignment->scenario?->mode ?? '-',
                    ],
                    'vessel' => [
                        'id' => $assignment->scenario?->vessel?->id,
                        'name' => $assignment->scenario?->vessel?->name ?? '-',
                    ],
                    'student_group' => $assignment->studentGroup ? [
                        'id' => $assignment->studentGroup->id,
                        'name' => $assignment->studentGroup->name,
                        'code' => $assignment->studentGroup->code,
                    ] : null,
                    'assigned_by' => [
                        'id' => $assignment->assignedBy?->id,
                        'name' => $assignment->assignedBy?->name ?? '-',
                    ],
                    'submission' => $assignment->submission ? [
                        'id' => $assignment->submission->id,
                        'status' => $assignment->submission->status,
                        'score' => $assignment->submission->score,
                        'teacher_comment' => $assignment->submission->teacher_comment,
                        'student_comment' => $assignment->submission->student_comment,
                        'submitted_at' => $assignment->submission->submitted_at?->format('d.m.Y H:i'),
                    ] : null,
                ])
                ->values(),
        ]);
    }
}
