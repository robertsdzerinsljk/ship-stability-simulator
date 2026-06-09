<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Scenario;
use App\Models\Submission;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAnalyticsController extends Controller
{
    public function index(): Response
    {
        $assignments = Assignment::query()
            ->with(['scenario.vessel', 'student'])
            ->get();

        $submissions = Submission::query()
            ->with(['student', 'scenario.vessel', 'assignment'])
            ->latest('submitted_at')
            ->get();

        $scenarios = Scenario::query()
            ->with(['vessel', 'assignments', 'submissions'])
            ->latest()
            ->get();

        $gradedSubmissions = $submissions->filter(fn (Submission $submission) => $submission->score !== null);

        return Inertia::render('TeacherAnalytics/Index', [
            'overview' => [
                'assignments_count' => $assignments->count(),
                'submissions_count' => $submissions->count(),
                'graded_count' => $gradedSubmissions->count(),
                'students_count' => $assignments->pluck('user_id')->unique()->count(),
                'scenarios_count' => $scenarios->count(),
                'average_score' => $gradedSubmissions->count() > 0
                    ? round($gradedSubmissions->avg(fn (Submission $submission) => (float) $submission->score), 2)
                    : null,
            ],

            'assignmentStatusStats' => $this->buildAssignmentStatusStats($assignments),
            'scenarioStats' => $this->buildScenarioStats($scenarios),
            'criteriaStats' => $this->buildCriteriaStats($submissions),
            'scoreDistribution' => $this->buildScoreDistribution($gradedSubmissions),
            'vesselTypeStats' => $this->buildVesselTypeStats($submissions),
            'recentSubmissions' => $this->buildRecentSubmissions($submissions),
        ]);
    }

    private function buildAssignmentStatusStats(Collection $assignments): array
    {
        $statuses = [
            'assigned' => 'Piešķirti',
            'in_progress' => 'Procesā',
            'submitted' => 'Iesniegti',
            'graded' => 'Novērtēti',
        ];

        return collect($statuses)
            ->map(fn (string $label, string $status) => [
                'status' => $status,
                'label' => $label,
                'count' => $assignments->where('status', $status)->count(),
            ])
            ->values()
            ->toArray();
    }

    private function buildScenarioStats(Collection $scenarios): array
    {
        return $scenarios
            ->map(function (Scenario $scenario) {
                $submissions = $scenario->submissions;
                $graded = $submissions->filter(fn (Submission $submission) => $submission->score !== null);

                $failedCriteria = $this->countCriteriaByStatus($submissions, 'fail');
                $warningCriteria = $this->countCriteriaByStatus($submissions, 'warning');

                return [
                    'id' => $scenario->id,
                    'title' => $scenario->title,
                    'mode' => $scenario->mode,
                    'difficulty' => $scenario->difficulty,
                    'vessel_name' => $scenario->vessel?->name,
                    'vessel_type' => $scenario->vessel?->type,
                    'assignments_count' => $scenario->assignments->count(),
                    'submissions_count' => $submissions->count(),
                    'graded_count' => $graded->count(),
                    'average_score' => $graded->count() > 0
                        ? round($graded->avg(fn (Submission $submission) => (float) $submission->score), 2)
                        : null,
                    'failed_criteria' => $failedCriteria,
                    'warning_criteria' => $warningCriteria,
                ];
            })
            ->values()
            ->toArray();
    }

    private function buildCriteriaStats(Collection $submissions): array
    {
        $stats = [];

        foreach ($submissions as $submission) {
            $snapshot = $submission->stability_snapshot ?? [];
            $criteria = $snapshot['criteria'] ?? [];

            foreach ($criteria as $criterion) {
                $name = $criterion['name'] ?? 'Nezināms kritērijs';
                $status = $criterion['status'] ?? 'unknown';

                if (! isset($stats[$name])) {
                    $stats[$name] = [
                        'name' => $name,
                        'pass' => 0,
                        'warning' => 0,
                        'fail' => 0,
                        'total' => 0,
                    ];
                }

                if (in_array($status, ['pass', 'warning', 'fail'], true)) {
                    $stats[$name][$status]++;
                }

                $stats[$name]['total']++;
            }
        }

        return collect($stats)
            ->map(function (array $item) {
                $item['issues'] = $item['warning'] + $item['fail'];

                return $item;
            })
            ->sortByDesc('issues')
            ->values()
            ->toArray();
    }

    private function buildScoreDistribution(Collection $gradedSubmissions): array
    {
        $buckets = [
            '0-3' => 0,
            '4-5' => 0,
            '6-7' => 0,
            '8-9' => 0,
            '10' => 0,
        ];

        foreach ($gradedSubmissions as $submission) {
            $score = (float) $submission->score;

            if ($score < 4) {
                $buckets['0-3']++;
            } elseif ($score < 6) {
                $buckets['4-5']++;
            } elseif ($score < 8) {
                $buckets['6-7']++;
            } elseif ($score < 10) {
                $buckets['8-9']++;
            } else {
                $buckets['10']++;
            }
        }

        return collect($buckets)
            ->map(fn (int $count, string $range) => [
                'range' => $range,
                'count' => $count,
            ])
            ->values()
            ->toArray();
    }

    private function buildVesselTypeStats(Collection $submissions): array
    {
        return $submissions
            ->groupBy(fn (Submission $submission) => $submission->scenario?->vessel?->type ?? 'Nezināms tips')
            ->map(fn (Collection $items, string $type) => [
                'type' => $type,
                'submissions' => $items->count(),
                'average_score' => $items->filter(fn (Submission $submission) => $submission->score !== null)->count() > 0
                    ? round($items->filter(fn (Submission $submission) => $submission->score !== null)->avg(fn (Submission $submission) => (float) $submission->score), 2)
                    : null,
            ])
            ->values()
            ->toArray();
    }

    private function buildRecentSubmissions(Collection $submissions): array
    {
        return $submissions
            ->take(8)
            ->map(fn (Submission $submission) => [
                'id' => $submission->id,
                'student_name' => $submission->student?->name,
                'student_email' => $submission->student?->email,
                'scenario_title' => $submission->scenario?->title,
                'vessel_name' => $submission->scenario?->vessel?->name,
                'status' => $submission->status,
                'score' => $submission->score !== null ? (float) $submission->score : null,
                'submitted_at_display' => $submission->submitted_at?->format('d.m.Y H:i'),
            ])
            ->values()
            ->toArray();
    }

    private function countCriteriaByStatus(Collection $submissions, string $status): int
    {
        $count = 0;

        foreach ($submissions as $submission) {
            $snapshot = $submission->stability_snapshot ?? [];
            $criteria = $snapshot['criteria'] ?? [];

            foreach ($criteria as $criterion) {
                if (($criterion['status'] ?? null) === $status) {
                    $count++;
                }
            }
        }

        return $count;
    }
}