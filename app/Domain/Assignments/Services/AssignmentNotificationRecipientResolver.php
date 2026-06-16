<?php

namespace App\Domain\Assignments\Services;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Support\Collection;

class AssignmentNotificationRecipientResolver
{
    public function teacherRecipients(Assignment $assignment): Collection
    {
        $assignment->loadMissing(['scenario.creator', 'assignedBy']);

        $recipients = collect();

        if ($assignment->assignedBy) {
            $recipients->push($assignment->assignedBy);
        }

        if ($recipients->isEmpty() && $assignment->scenario?->creator) {
            $recipients->push($assignment->scenario->creator);
        }

        if ($recipients->isEmpty()) {
            $recipients = User::role('admin')->get();
        }

        return $recipients->unique('id')->values();
    }
}
