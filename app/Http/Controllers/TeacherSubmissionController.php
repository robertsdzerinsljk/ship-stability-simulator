<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherSubmissionController extends Controller
{
    public function index(): Response
    {
        $submissions = Submission::query()
            ->with([
                'student',
                'scenario.vessel',
                'scenario.cargoPlan',
                'assignment',
            ])
            ->latest('submitted_at')
            ->get()
            ->map(fn (Submission $submission) => $this->mapSubmission($submission));

        return Inertia::render('TeacherSubmissions/Index', [
            'submissions' => $submissions,
        ]);
    }

    public function show(Submission $submission): Response
    {
        $submission->load([
            'student',
            'scenario.vessel',
            'scenario.cargoPlan',
            'assignment',
        ]);

        return Inertia::render('TeacherSubmissions/Show', [
            'submission' => $this->mapSubmission($submission, includeSnapshot: true),
        ]);
    }

    public function grade(Request $request, Submission $submission): RedirectResponse
    {
        $validated = $request->validate([
            'score' => ['required', 'numeric', 'min:0', 'max:10'],
            'teacher_comment' => ['nullable', 'string', 'max:5000'],
        ]);

        $submission->update([
            'score' => $validated['score'],
            'teacher_comment' => $validated['teacher_comment'] ?? null,
            'status' => 'graded',
        ]);

        $submission->assignment?->update([
            'status' => 'graded',
        ]);

        return back()->with('success', 'Vērtējums saglabāts.');
    }

    private function mapSubmission(Submission $submission, bool $includeSnapshot = false): array
    {
        $snapshot = $submission->stability_snapshot ?? [];

        $criteria = collect($snapshot['criteria'] ?? []);
        $failedCriteria = $criteria->where('status', 'fail')->count();
        $warningCriteria = $criteria->where('status', 'warning')->count();

        $data = [
            'id' => $submission->id,
            'status' => $submission->status,
            'score' => $submission->score !== null ? (float) $submission->score : null,
            'student_comment' => $submission->student_comment,
            'teacher_comment' => $submission->teacher_comment,
            'submitted_at_display' => $submission->submitted_at?->format('d.m.Y H:i'),

            'student' => [
                'id' => $submission->student?->id,
                'name' => $submission->student?->name,
                'email' => $submission->student?->email,
            ],

            'scenario' => [
                'id' => $submission->scenario?->id,
                'title' => $submission->scenario?->title,
                'course' => $submission->scenario?->course,
                'mode' => $submission->scenario?->mode,
                'difficulty' => $submission->scenario?->difficulty,
                'vessel_name' => $submission->scenario?->vessel?->name,
                'vessel_imo' => $submission->scenario?->vessel?->imo_number,
                'cargo_plan_name' => $submission->scenario?->cargoPlan?->name,
            ],

            'summary' => [
                'gm' => $snapshot['metrics']['gm'] ?? null,
                'trim' => $snapshot['metrics']['trim'] ?? null,
                'heel' => $snapshot['metrics']['heel'] ?? null,
                'displacement' => $snapshot['metrics']['displacement'] ?? null,
                'failed_criteria' => $failedCriteria,
                'warning_criteria' => $warningCriteria,
                'criteria_count' => $criteria->count(),
            ],
        ];

        if ($includeSnapshot) {
            $data['snapshot'] = [
                'metrics' => $snapshot['metrics'] ?? [],
                'criteria' => $snapshot['criteria'] ?? [],
                'hold_loads' => $snapshot['hold_loads'] ?? [],
                'charts' => $snapshot['charts'] ?? [],
            ];
        }

        return $data;
    }
}