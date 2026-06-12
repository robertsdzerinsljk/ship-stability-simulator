<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Models\Assignment;
use App\Models\Scenario;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Support\ActiveVessel;
use App\Domain\Assignments\Services\AssignmentSolutionService;
use App\Support\ActiveAssignmentSolution;

class StudentTaskController extends Controller
{
    public function index(Request $request): Response
    {
    $assignments = Assignment::query()
        ->with([
            'scenario.vessel',
            'studentGroup',
            'submission',
        ])
        ->where('user_id', $request->user()->id)
        ->latest('assigned_at')
        ->latest('id')
        ->get();

    return Inertia::render('StudentTasks/Index', [
        'stats' => [
            'total' => $assignments->count(),
            'assigned' => $assignments->where('status', 'assigned')->count(),
            'in_progress' => $assignments->where('status', 'in_progress')->count(),
            'submitted' => $assignments->where('status', 'submitted')->count(),
            'graded' => $assignments->where('status', 'graded')->count(),
        ],
        'assignments' => $assignments
            ->map(fn (Assignment $assignment) => $this->mapStudentAssignment($assignment))
            ->values(),
    ]);
}

    public function show(Request $request, Assignment $assignment): Response
{
    abort_unless(
        $assignment->user_id === $request->user()->id || $request->user()->hasRole('admin'),
        403,
    );

    $assignment->load([
        'scenario.vessel',
        'studentGroup',
        'submission',
    ]);

    return Inertia::render('StudentTasks/Show', [
        'assignment' => $this->mapStudentAssignment($assignment),
    ]);
}

    public function start(
        Request $request,
        Assignment $assignment,
        AssignmentSolutionService $solutionService,
    ): RedirectResponse {
        abort_unless($assignment->user_id === $request->user()->id, 403);

        $assignment->load('scenario.vessel');

        if ($assignment->scenario?->vessel) {
            ActiveVessel::set($request, $assignment->scenario->vessel);
        }

        $solutionService->startOrGet($assignment);
        ActiveAssignmentSolution::set($request, $assignment);

        if ($assignment->status === 'assigned') {
            $assignment->update([
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
        }

        return redirect()
            ->route('student.tasks.show', $assignment)
            ->with('success', 'Uzdevuma risināšana sākta. Izveidota privāta kravas un balasta kopija.');
    }

public function submit(
    Request $request,
    Assignment $assignment,
    StabilityAnalysisService $analysisService,
    AssignmentSolutionService $solutionService,
): RedirectResponse {
    abort_unless($assignment->user_id === $request->user()->id, 403);

    $validated = $request->validate([
        'student_comment' => ['nullable', 'string', 'max:3000'],
    ]);

    $assignment->loadMissing([
        'scenario',
        'solution',
    ]);

    $solution = $solutionService->startOrGet($assignment);

    $solution->load([
        'vessel.compartments',
        'vessel.limits',
        'cargoPlan.items.cargoType',
        'cargoPlan.items.compartment',
        'ballastTanks',
    ]);

    $scenario = $assignment->scenario;
    $vessel = $solution->vessel;
    $cargoPlan = $solution->cargoPlan;

    $analysis = $analysisService->build(
        $vessel,
        $cargoPlan,
        $solution->ballastTanks,
    );

    Submission::updateOrCreate(
        [
            'assignment_id' => $assignment->id,
        ],
        [
            'scenario_id' => $scenario->id,
            'user_id' => $request->user()->id,
            'cargo_plan_id' => $cargoPlan?->id,
            'status' => 'submitted',
            'stability_snapshot' => $analysis,
            'student_comment' => $validated['student_comment'] ?? null,
            'submitted_at' => now(),
        ],
    );

    $assignment->update([
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $solution->update([
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    return redirect()
        ->route('student.tasks.show', $assignment)
        ->with('success', 'Gala risinājums iesniegts.');
}

    private function ensurePublishedScenariosAreAssignedToCurrentUser(Request $request): void
    {
        $user = $request->user();

        Scenario::query()
            ->where('status', 'published')
            ->get()
            ->each(function (Scenario $scenario) use ($user) {
                Assignment::firstOrCreate(
                    [
                        'scenario_id' => $scenario->id,
                        'user_id' => $user->id,
                    ],
                    [
                        'assigned_by_user_id' => $scenario->created_by_user_id,
                        'status' => 'assigned',
                        'assigned_at' => now(),
                        'due_at' => $scenario->due_at,
                    ],
                );
            });
    }

    private function mapAssignment(Assignment $assignment, bool $includeDetails = false): array
    {
        $scenario = $assignment->scenario;
        $submission = $assignment->submission;

        $data = [
            'id' => $assignment->id,
            'status' => $assignment->status,
            'assigned_at_display' => $assignment->assigned_at?->format('d.m.Y H:i'),
            'started_at_display' => $assignment->started_at?->format('d.m.Y H:i'),
            'submitted_at_display' => $assignment->submitted_at?->format('d.m.Y H:i'),
            'due_at_display' => $assignment->due_at?->format('d.m.Y H:i'),

            'scenario' => [
                'id' => $scenario->id,
                'title' => $scenario->title,
                'short_description' => $scenario->short_description,
                'course' => $scenario->course,
                'difficulty' => $scenario->difficulty,
                'mode' => $scenario->mode,
                'estimated_minutes' => $scenario->estimated_minutes,
                'show_hints' => $scenario->show_hints,
                'allow_solution_comparison' => $scenario->allow_solution_comparison,
                'vessel_name' => $scenario->vessel?->name,
                'vessel_imo' => $scenario->vessel?->imo_number,
                'cargo_plan_name' => $scenario->cargoPlan?->name,
            ],

            'submission' => $submission ? [
                'id' => $submission->id,
                'status' => $submission->status,
                'student_comment' => $submission->student_comment,
                'teacher_comment' => $submission->teacher_comment,
                'score' => $submission->score,
                'submitted_at_display' => $submission->submitted_at?->format('d.m.Y H:i'),
            ] : null,
        ];

        if ($includeDetails) {
            $data['scenario'] = [
                ...$data['scenario'],
                'task_text' => $scenario->task_text,
                'final_requirements' => $scenario->final_requirements,
                'student_hints' => $scenario->student_hints,
            ];
        }

        return $data;
    }
    private function mapStudentAssignment(Assignment $assignment): array
{
    $submission = $assignment->submission;

    return [
        'id' => $assignment->id,
        'status' => $assignment->status,
        'assigned_at' => $assignment->assigned_at?->format('d.m.Y H:i'),
        'started_at' => $assignment->started_at?->format('d.m.Y H:i'),
        'submitted_at' => $assignment->submitted_at?->format('d.m.Y H:i'),
        'due_at' => $assignment->due_at?->format('d.m.Y H:i'),

        'is_assigned' => $assignment->status === 'assigned',
        'is_in_progress' => $assignment->status === 'in_progress',
        'is_submitted' => in_array($assignment->status, ['submitted', 'graded'], true),
        'is_graded' => $assignment->status === 'graded',

        'student_group' => $assignment->studentGroup ? [
            'id' => $assignment->studentGroup->id,
            'name' => $assignment->studentGroup->name,
            'code' => $assignment->studentGroup->code,
            'academic_year' => $assignment->studentGroup->academic_year,
        ] : null,

        'scenario' => [
            'id' => $assignment->scenario?->id,
            'title' => $assignment->scenario?->title ?? '-',
            'description' => $assignment->scenario?->description ?? null,
            'difficulty' => $assignment->scenario?->difficulty ?? '-',
            'mode' => $assignment->scenario?->mode ?? '-',
        ],

        'vessel' => [
            'id' => $assignment->scenario?->vessel?->id,
            'name' => $assignment->scenario?->vessel?->name ?? '-',
            'type' => $assignment->scenario?->vessel?->type ?? '-',
            'imo_number' => $assignment->scenario?->vessel?->imo_number ?? '-',
        ],

        'submission' => $submission ? [
            'id' => $submission->id,
            'status' => $submission->status,
            'submitted_at' => $submission->created_at?->format('d.m.Y H:i'),
            'score' => $submission->score !== null ? (float) $submission->score : null,
            'teacher_comment' => $submission->teacher_comment,
            'has_feedback' => $submission->score !== null || filled($submission->teacher_comment),
        ] : null,
    ];
    }
}