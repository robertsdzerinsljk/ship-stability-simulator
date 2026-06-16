<?php

namespace App\Http\Controllers;

use App\Domain\Assignments\Services\AssignmentDeadlineService;
use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Models\Assignment;
use App\Models\Scenario;
use App\Models\Submission;
use App\Models\User;
use App\Models\Vessel;
use App\Support\ActiveAssignmentSolution;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(
        Request $request,
        StabilityAnalysisService $analysisService,
        AssignmentDeadlineService $deadlineService,
    ): Response {
        $deadlineService->syncOverdueAssignments();

        $user = $request->user();

        if ($user->hasRole('admin')) {
            $mode = 'admin';
        } elseif ($user->hasRole('teacher')) {
            $mode = 'teacher';
        } else {
            $mode = 'student';
        }

        $analysis = null;
        $workspace = null;

        if ($mode === 'student') {
            [$analysis, $workspace] = $this->buildStudentAnalysis($request, $analysisService);
        }

        return Inertia::render('Dashboard', [
            'mode' => $mode,
            'analysis' => $analysis,
            'workspace' => $workspace,
            'studentDashboard' => $mode === 'student' ? $this->buildStudentDashboard($request) : null,
            'teacherDashboard' => $mode === 'teacher' ? $this->buildTeacherDashboard($request) : null,
            'adminDashboard' => $mode === 'admin' ? $this->buildAdminDashboard() : null,
        ]);
    }

    private function buildStudentAnalysis(Request $request, StabilityAnalysisService $analysisService): array
    {
        $solution = ActiveAssignmentSolution::current($request);

        if (! $solution) {
            $assignment = Assignment::query()
                ->with([
                    'scenario.vessel',
                    'solution.vessel.compartments',
                    'solution.vessel.limits',
                    'solution.cargoPlan.items.cargoType',
                    'solution.cargoPlan.items.compartment',
                    'solution.ballastTanks',
                    'submission',
                ])
                ->where('user_id', $request->user()->id)
                ->whereIn('status', ['in_progress', 'submitted', 'graded'])
                ->orderByRaw("
                    CASE status
                        WHEN 'in_progress' THEN 1
                        WHEN 'submitted' THEN 2
                        WHEN 'graded' THEN 3
                        ELSE 4
                    END
                ")
                ->latest('updated_at')
                ->first();

            $solution = $assignment?->solution;
        }

        if (! $solution) {
            return [null, null];
        }

        $solution->loadMissing([
            'assignment.scenario',
            'assignment.submission',
            'student',
            'vessel.compartments',
            'vessel.limits',
            'cargoPlan.items.cargoType',
            'cargoPlan.items.compartment',
            'ballastTanks',
        ]);

        $analysis = $analysisService->build(
            $solution->vessel,
            $solution->cargoPlan,
            $solution->ballastTanks,
        );

        $workspace = [
            'mode' => 'student_solution',
            'assignment_id' => $solution->assignment_id,
            'solution_id' => $solution->id,
            'status' => $solution->status,
            'is_locked' => $solution->status !== 'in_progress'
                || in_array($solution->assignment?->status, ['submitted', 'graded', 'overdue'], true),
            'scenario_title' => $solution->assignment?->scenario?->title,
            'score' => $solution->assignment?->submission?->score !== null
                ? (float) $solution->assignment?->submission?->score
                : null,
            'teacher_comment' => $solution->assignment?->submission?->teacher_comment,
        ];

        return [$analysis, $workspace];
    }

    private function buildStudentDashboard(Request $request): array
    {
        $user = $request->user();

        $assignments = Assignment::query()
            ->with([
                'scenario.vessel',
                'submission',
                'solution',
            ])
            ->where('user_id', $user->id)
            ->latest('updated_at')
            ->get();

        $currentAssignment = $assignments
            ->sortBy(function (Assignment $assignment) {
                return match ($assignment->status) {
                    'in_progress' => 1,
                    'assigned' => 2,
                    'submitted' => 3,
                    'graded' => 4,
                    default => 5,
                };
            })
            ->first();

        return [
            'stats' => [
                'total' => $assignments->count(),
                'assigned' => $assignments->where('status', 'assigned')->count(),
                'in_progress' => $assignments->where('status', 'in_progress')->count(),
                'submitted' => $assignments->where('status', 'submitted')->count(),
                'graded' => $assignments->where('status', 'graded')->count(),
                'overdue' => $assignments->where('status', 'overdue')->count(),
            ],
            'current_assignment' => $currentAssignment ? $this->mapStudentAssignment($currentAssignment) : null,
            'recent_assignments' => $assignments
                ->take(5)
                ->map(fn (Assignment $assignment) => $this->mapStudentAssignment($assignment))
                ->values()
                ->toArray(),
        ];
    }

    private function buildTeacherDashboard(Request $request): array
    {
        $teacher = $request->user();

        $submissions = Submission::query()
            ->with([
                'student',
                'scenario.vessel',
            ])
            ->whereHas(
                'assignment',
                fn ($query) => $query->where('assigned_by_user_id', $teacher->id),
            )
            ->latest('submitted_at')
            ->latest('id')
            ->get();

        $scenarios = Scenario::query()
            ->where('created_by_user_id', $teacher->id)
            ->get();

        $recentSubmissions = $submissions
            ->take(5)
            ->map(fn (Submission $submission) => $this->mapSubmission($submission))
            ->values()
            ->toArray();

        $averageScore = $submissions
            ->whereNotNull('score')
            ->avg('score');

        return [
            'stats' => [
                'submissions_total' => $submissions->count(),
                'submissions_pending' => $submissions->where('status', 'submitted')->count(),
                'submissions_graded' => $submissions->where('status', 'graded')->count(),
                'average_score' => $averageScore ? round((float) $averageScore, 2) : null,
                'scenarios_total' => $scenarios->count(),
                'scenarios_published' => $scenarios->where('status', 'published')->count(),
                'vessels_total' => Vessel::where('status', 'active')->count(),
            ],
            'recent_submissions' => $recentSubmissions,
        ];
    }

    private function buildAdminDashboard(): array
    {
        $recentSubmissions = Submission::query()
            ->with([
                'student',
                'scenario.vessel',
            ])
            ->latest('submitted_at')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(fn (Submission $submission) => $this->mapSubmission($submission))
            ->values()
            ->toArray();

        return [
            'stats' => [
                'users_total' => User::count(),
                'students_total' => User::role('student')->count(),
                'teachers_total' => User::role('teacher')->count(),
                'admins_total' => User::role('admin')->count(),
                'vessels_total' => Vessel::count(),
                'active_vessels_total' => Vessel::where('status', 'active')->count(),
                'scenarios_total' => Scenario::count(),
                'published_scenarios_total' => Scenario::where('status', 'published')->count(),
                'submissions_total' => Submission::count(),
                'graded_submissions_total' => Submission::where('status', 'graded')->count(),
            ],
            'recent_submissions' => $recentSubmissions,
        ];
    }

    private function mapStudentAssignment(Assignment $assignment): array
    {
        return [
            'id' => $assignment->id,
            'status' => $assignment->status,
            'assigned_at' => $assignment->assigned_at?->format('d.m.Y H:i'),
            'started_at' => $assignment->started_at?->format('d.m.Y H:i'),
            'submitted_at' => $assignment->submitted_at?->format('d.m.Y H:i'),
            'due_at' => $assignment->due_at?->format('d.m.Y H:i'),
            'has_solution' => (bool) $assignment->solution,
            'score' => $assignment->submission?->score !== null
                ? (float) $assignment->submission?->score
                : null,
            'teacher_comment' => $assignment->submission?->teacher_comment,
            'scenario' => [
                'id' => $assignment->scenario?->id,
                'title' => $assignment->scenario?->title ?? '-',
                'difficulty' => $assignment->scenario?->difficulty ?? '-',
                'mode' => $assignment->scenario?->mode ?? '-',
            ],
            'vessel' => [
                'id' => $assignment->scenario?->vessel?->id,
                'name' => $assignment->scenario?->vessel?->name ?? '-',
                'type' => $assignment->scenario?->vessel?->type ?? '-',
                'imo_number' => $assignment->scenario?->vessel?->imo_number ?? '-',
            ],
        ];
    }

    private function mapSubmission(Submission $submission): array
    {
        $snapshot = $submission->stability_snapshot ?? [];
        $metrics = $snapshot['metrics'] ?? [];
        $criteria = collect($snapshot['criteria'] ?? []);

        return [
            'id' => $submission->id,
            'status' => $submission->status,
            'score' => $submission->score !== null ? (float) $submission->score : null,
            'submitted_at' => $submission->submitted_at?->format('d.m.Y H:i'),
            'student' => [
                'name' => $submission->student?->name ?? '-',
                'email' => $submission->student?->email ?? '-',
            ],
            'scenario' => [
                'title' => $submission->scenario?->title ?? '-',
            ],
            'vessel' => [
                'name' => $submission->scenario?->vessel?->name ?? '-',
                'imo_number' => $submission->scenario?->vessel?->imo_number ?? '-',
            ],
            'metrics' => [
                'gm' => $metrics['gm'] ?? null,
                'trim' => $metrics['trim'] ?? null,
                'heel' => $metrics['heel'] ?? null,
                'displacement' => $metrics['displacement'] ?? null,
            ],
            'criteria_summary' => [
                'total' => $criteria->count(),
                'fail' => $criteria->where('status', 'fail')->count(),
                'warning' => $criteria->where('status', 'warning')->count(),
                'pass' => $criteria->where('status', 'pass')->count(),
            ],
        ];
    }
}
