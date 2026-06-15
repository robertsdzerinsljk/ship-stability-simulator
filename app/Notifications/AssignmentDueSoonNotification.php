<?php

namespace App\Notifications;

use App\Models\Assignment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AssignmentDueSoonNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Assignment $assignment,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Tuvojas uzdevuma termiņš',
            'message' => 'Uzdevumam “'.($this->assignment->scenario?->title ?? 'Uzdevums').'” termiņš tuvojas.',
            'href' => '/student/tasks/'.$this->assignment->id,
            'type' => 'assignment_due_soon',
            'assignment_id' => $this->assignment->id,
            'scenario_id' => $this->assignment->scenario_id,
            'due_at' => $this->assignment->due_at?->format('d.m.Y H:i'),
        ];
    }
}