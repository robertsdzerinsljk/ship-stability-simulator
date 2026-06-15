<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Notifications\AssignmentGradedNotification;

class TeacherSubmissionController extends Controller
{
    public function index(): Response
    {
        $submissions = Submission::query()
            ->with([
                'student',
                'scenario.vessel',
                'assignment',
            ])
            ->latest('submitted_at')
            ->latest('id')
            ->get();

        $mappedSubmissions = $submissions
            ->map(fn (Submission $submission) => $this->mapSubmissionListItem($submission))
            ->values();

        $total = $submissions->count();
        $graded = $submissions->where('status', 'graded')->count();
        $pending = $submissions->where('status', 'submitted')->count();

        $averageScore = $submissions
            ->whereNotNull('score')
            ->avg('score');

        return Inertia::render('TeacherSubmissions/Index', [
            'stats' => [
                'total' => $total,
                'pending' => $pending,
                'graded' => $graded,
                'average_score' => $averageScore ? round((float) $averageScore, 2) : null,
            ],
            'submissions' => $mappedSubmissions,
        ]);
    }

    public function show(Submission $submission): Response
    {
        $submission->load([
            'student',
            'scenario.vessel',
            'assignment.solution.ballastTanks',
            'cargoPlan.items.cargoType',
            'cargoPlan.items.compartment',
        ]);

        $snapshot = $submission->stability_snapshot ?? [];

        return Inertia::render('TeacherSubmissions/Show', [
            'submission' => [
                'id' => $submission->id,
                'status' => $submission->status,
                'score' => $submission->score !== null ? (float) $submission->score : null,
                'student_comment' => $submission->student_comment,
                'teacher_comment' => $submission->teacher_comment,
                'submitted_at' => $submission->submitted_at?->format('d.m.Y H:i'),

                'student' => [
                    'id' => $submission->student?->id,
                    'name' => $submission->student?->name ?? '-',
                    'email' => $submission->student?->email ?? '-',
                ],

                'scenario' => [
                    'id' => $submission->scenario?->id,
                    'title' => $submission->scenario?->title ?? '-',
                    'difficulty' => $submission->scenario?->difficulty ?? '-',
                    'mode' => $submission->scenario?->mode ?? '-',
                    'task_text' => $submission->scenario?->task_text,
                ],

                'vessel' => [
                    'id' => $submission->scenario?->vessel?->id,
                    'name' => $submission->scenario?->vessel?->name ?? '-',
                    'type' => $submission->scenario?->vessel?->type ?? '-',
                    'imo_number' => $submission->scenario?->vessel?->imo_number ?? '-',
                ],

                'metrics' => $snapshot['metrics'] ?? [],
                'criteria' => $snapshot['criteria'] ?? [],
                'hold_loads' => $snapshot['hold_loads'] ?? [],
                'cargo_items' => $this->mapCargoItems($submission),
                'ballast_tanks' => $this->mapBallastTanks($submission),
            ],
        ]);
    }

    public function grade(Request $request, Submission $submission): RedirectResponse
    {
        $validated = $request->validate([
            'score' => ['required', 'numeric', 'min:0', 'max:10'],
            'teacher_comment' => ['nullable', 'string', 'max:5000'],
        ]);

        $submission->update([
            'status' => 'graded',
            'score' => $validated['score'],
            'teacher_comment' => $validated['teacher_comment'] ?? null,
        ]);

        $submission->loadMissing([
        'student',
        'assignment.scenario',
        ]);

        if ($submission->student) {
            $submission->student->notify(
                new AssignmentGradedNotification(
                    assignment: $submission->assignment,
                    submission: $submission,
                    teacher: $request->user(),
                ),
            );
        }

        $submission->assignment?->update([
            'status' => 'graded',
        ]);

        return back()->with('success', 'Vērtējums saglabāts.');
    }

    private function mapSubmissionListItem(Submission $submission): array
    {
        $snapshot = $submission->stability_snapshot ?? [];
        $metrics = $snapshot['metrics'] ?? [];
        $criteria = collect($snapshot['criteria'] ?? []);

        $failedCriteria = $criteria
            ->where('status', 'fail')
            ->count();

        $warningCriteria = $criteria
            ->where('status', 'warning')
            ->count();

        $passedCriteria = $criteria
            ->where('status', 'pass')
            ->count();

        return [
            'id' => $submission->id,
            'status' => $submission->status,
            'score' => $submission->score !== null ? (float) $submission->score : null,
            'submitted_at' => $submission->submitted_at?->format('d.m.Y H:i'),

            'student' => [
                'id' => $submission->student?->id,
                'name' => $submission->student?->name ?? '-',
                'email' => $submission->student?->email ?? '-',
            ],

            'scenario' => [
                'id' => $submission->scenario?->id,
                'title' => $submission->scenario?->title ?? '-',
                'difficulty' => $submission->scenario?->difficulty ?? '-',
                'mode' => $submission->scenario?->mode ?? '-',
            ],

            'vessel' => [
                'id' => $submission->scenario?->vessel?->id,
                'name' => $submission->scenario?->vessel?->name ?? '-',
                'type' => $submission->scenario?->vessel?->type ?? '-',
                'imo_number' => $submission->scenario?->vessel?->imo_number ?? '-',
            ],

            'metrics' => [
                'displacement' => $metrics['displacement'] ?? null,
                'gm' => $metrics['gm'] ?? null,
                'kg' => $metrics['kg'] ?? null,
                'trim' => $metrics['trim'] ?? null,
                'heel' => $metrics['heel'] ?? null,
                'fore_draft' => $metrics['fore_draft'] ?? null,
                'aft_draft' => $metrics['aft_draft'] ?? null,
            ],

            'criteria_summary' => [
                'total' => $criteria->count(),
                'pass' => $passedCriteria,
                'warning' => $warningCriteria,
                'fail' => $failedCriteria,
            ],
        ];
    }

    private function mapCargoItems(Submission $submission): array
    {
        return ($submission->cargoPlan?->items ?? collect())
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'compartment' => $item->compartment?->name ?? '-',
                    'compartment_code' => $item->compartment?->code ?? '-',
                    'cargo_type' => $item->cargoType?->name ?? '-',
                    'cargo_name' => $item->cargo_name ?? '-',
                    'weight_tonnes' => round((float) $item->weight_tonnes, 2),
                    'volume_m3' => round((float) $item->volume_m3, 2),
                    'loading_port' => $item->loading_port,
                    'discharge_port' => $item->discharge_port,
                    'status' => $item->status,
                ];
            })
            ->values()
            ->toArray();
    }

    private function mapBallastTanks(Submission $submission): array
    {
        $ballastTanks = $submission->assignment?->solution?->ballastTanks ?? collect();

        return $ballastTanks
            ->map(function ($tank) {
                $capacity = max((float) $tank->capacity_tonnes, 1);
                $current = (float) $tank->current_tonnes;
                $fillPercent = ($current / $capacity) * 100;

                return [
                    'id' => $tank->id,
                    'code' => $tank->code,
                    'name' => $tank->name,
                    'side' => $tank->side,
                    'capacity_tonnes' => round($capacity, 2),
                    'current_tonnes' => round($current, 2),
                    'fill_percent' => round($fillPercent, 1),
                    'free_surface_risk' => $fillPercent > 5 && $fillPercent < 95,
                ];
            })
            ->values()
            ->toArray();
    }
}