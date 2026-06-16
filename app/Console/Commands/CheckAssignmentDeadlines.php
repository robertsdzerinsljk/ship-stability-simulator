<?php

namespace App\Console\Commands;

use App\Domain\Assignments\Services\AssignmentDeadlineService;
use App\Models\Assignment;
use App\Notifications\AssignmentDueSoonNotification;
use Illuminate\Console\Command;

class CheckAssignmentDeadlines extends Command
{
    protected $signature = 'assignments:check-deadlines {--hours=24}';

    protected $description = 'Check assignment deadlines and send due soon or overdue notifications.';

    public function handle(AssignmentDeadlineService $deadlineService): int
    {
        $now = now();
        $hours = (int) $this->option('hours');
        $dueSoonUntil = $now->copy()->addHours($hours);

        $dueSoonCount = $this->notifyDueSoonAssignments($now, $dueSoonUntil);
        $overdueStats = $deadlineService->syncOverdueAssignments($now, notify: true);

        $this->info("Due soon notifications sent: {$dueSoonCount}");
        $this->info("Overdue assignments marked: {$overdueStats['marked']}");
        $this->info("Overdue notifications sent: {$overdueStats['notified']}");

        return self::SUCCESS;
    }

    private function notifyDueSoonAssignments($now, $dueSoonUntil): int
    {
        $assignments = Assignment::query()
            ->with(['student', 'scenario'])
            ->whereNotNull('due_at')
            ->whereNull('due_soon_notified_at')
            ->whereIn('status', ['assigned', 'in_progress'])
            ->whereBetween('due_at', [$now, $dueSoonUntil])
            ->get();

        foreach ($assignments as $assignment) {
            if ($assignment->student) {
                $assignment->student->notify(
                    new AssignmentDueSoonNotification($assignment)
                );
            }

            $assignment->update([
                'due_soon_notified_at' => now(),
            ]);
        }

        return $assignments->count();
    }
}
