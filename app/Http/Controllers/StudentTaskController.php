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

class StudentTaskController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensurePublishedScenariosAreAssignedToCurrentUser($request);

        $assignments = Assignment::query()
            ->with([
                'scenario.vessel',
                'scenario.cargoPlan',
                'submission',
            ])
            ->where('user_id', $request->user()->id)
            ->latest('assigned_at')
            ->get()
            ->map(fn (Assignment $assignment) => $this->mapAssignment($assignment));

        return Inertia::render('StudentTasks/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function show(Request $request, Assignment $assignment): Response
    {
        abort_unless($assignment->user_id === $request->user()->id, 403);

        $assignment->load([
            'scenario.vessel',
            'scenario.cargoPlan',
            'submission',
        ]);

        if ($assignment->scenario?->vessel) {
            ActiveVessel::set($request, $assignment->scenario->vessel);
        }

        return Inertia::render('StudentTasks/Show', [
            'assignment' => $this->mapAssignment($assignment, includeDetails: true),
        ]);
    }

    public function start(Request $request, Assignment $assignment): RedirectResponse
    {
        abort_unless($assignment->user_id === $request->user()->id, 403);

        $assignment->load('scenario.vessel');

        if ($assignment->scenario?->vessel) {
            ActiveVessel::set($request, $assignment->scenario->vessel);
        }

        if ($assignment->status === 'assigned') {
            $assignment->update([
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
        }

        return redirect()
            ->route('student.tasks.show', $assignment)
            ->with('success', 'Uzdevuma risināšana sākta. Simulatora aktīvais kuģis pārslēgts uz scenārija kuģi.');
    }

    public function submit(
        Request $request,
        Assignment $assignment,
        StabilityAnalysisService $analysisService,
    ): RedirectResponse {
        abort_unless($assignment->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'student_comment' => ['nullable', 'string', 'max:5000'],
        ]);

        $assignment->load([
            'scenario.vessel.compartments',
            'scenario.vessel.ballastTanks',
            'scenario.vessel.limits',
            'scenario.cargoPlan.items.cargoType',
            'scenario.cargoPlan.items.compartment',
        ]);

        $scenario = $assignment->scenario;
        $vessel = $scenario->vessel;
        $cargoPlan = $scenario->cargoPlan;

        $analysis = $analysisService->build($vessel, $cargoPlan);

        Submission::updateOrCreate(
            ['assignment_id' => $assignment->id],
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
}