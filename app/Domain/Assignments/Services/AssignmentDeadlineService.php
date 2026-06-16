<?php

namespace App\Domain\Assignments\Services;

use App\Models\Assignment;
use App\Notifications\AssignmentOverdueNotification;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Notification;

class AssignmentDeadlineService
{
    public function __construct(
        private AssignmentNotificationRecipientResolver $recipientResolver,
    ) {}

    public function syncOverdueAssignments(?CarbonInterface $now = null, bool $notify = false): array
    {
        $now ??= now();
        $marked = 0;
        $notified = 0;

        $assignments = Assignment::query()
            ->with(['student', 'scenario.creator', 'assignedBy'])
            ->whereNotNull('due_at')
            ->where('due_at', '<', $now)
            ->where(function ($query) use ($notify) {
                $query->whereIn('status', ['assigned', 'in_progress']);

                if ($notify) {
                    $query->orWhere(function ($query) {
                        $query
                            ->where('status', 'overdue')
                            ->whereNull('overdue_notified_at');
                    });
                }
            })
            ->get();

        foreach ($assignments as $assignment) {
            if (in_array($assignment->status, ['assigned', 'in_progress'], true)) {
                $assignment->update([
                    'status' => 'overdue',
                ]);

                $marked++;
            }

            if ($notify && $assignment->overdue_notified_at === null) {
                $this->notifyOverdueAssignment($assignment);

                $assignment->update([
                    'overdue_notified_at' => now(),
                ]);

                $notified++;
            }
        }

        return [
            'marked' => $marked,
            'notified' => $notified,
        ];
    }

    private function notifyOverdueAssignment(Assignment $assignment): void
    {
        if ($assignment->student) {
            $assignment->student->notify(
                new AssignmentOverdueNotification(
                    assignment: $assignment,
                    recipientRole: 'student',
                )
            );
        }

        Notification::send(
            $this->recipientResolver->teacherRecipients($assignment),
            new AssignmentOverdueNotification(
                assignment: $assignment,
                recipientRole: 'teacher',
            ),
        );
    }
}
