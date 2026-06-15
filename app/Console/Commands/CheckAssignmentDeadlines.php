<?php

namespace App\Console\Commands;

use App\Models\Assignment;
use App\Models\User;
use App\Notifications\AssignmentDueSoonNotification;
use App\Notifications\AssignmentOverdueNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class CheckAssignmentDeadlines extends Command
{
    protected $signature = 'assignments:check-deadlines {--hours=24}';

    protected $description = 'Check assignment deadlines and send due soon or overdue notifications.';

    public function handle(): int
    {
        $now = now();
        $hours = (int) $this->option('hours');
        $dueSoonUntil = $now->copy()->addHours($hours);

        $dueSoonCount = $this->notifyDueSoonAssignments($now, $dueSoonUntil);
        $overdueCount = $this->markAndNotifyOverdueAssignments($now);

        $this->info("Due soon notifications sent: {$dueSoonCount}");
        $this->info("Overdue assignments processed: {$overdueCount}");

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

    private function markAndNotifyOverdueAssignments($now): int
    {
        $assignments = Assignment::query()
            ->with(['student', 'scenario', 'assignedBy'])
            ->whereNotNull('due_at')
            ->whereNull('overdue_notified_at')
            ->whereIn('status', ['assigned', 'in_progress'])
            ->where('due_at', '<', $now)
            ->get();

        foreach ($assignments as $assignment) {
            $assignment->update([
                'status' => 'overdue',
                'overdue_notified_at' => now(),
            ]);

            if ($assignment->student) {
                $assignment->student->notify(
                    new AssignmentOverdueNotification(
                        assignment: $assignment,
                        recipientRole: 'student',
                    )
                );
            }

            $teacherRecipients = collect();

            if ($assignment->assignedBy) {
                $teacherRecipients->push($assignment->assignedBy);
            }

            if ($teacherRecipients->isEmpty()) {
                $teacherRecipients = User::role(['teacher', 'admin'])->get();
            }

            Notification::send(
                $teacherRecipients->unique('id')->values(),
                new AssignmentOverdueNotification(
                    assignment: $assignment,
                    recipientRole: 'teacher',
                ),
            );
        }

        return $assignments->count();
    }
}