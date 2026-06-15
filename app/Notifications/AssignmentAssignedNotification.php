<?php

namespace App\Notifications;

use App\Models\Assignment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AssignmentAssignedNotification extends Notification
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
            'title' => 'Tev piešķirts jauns uzdevums',
            'message' => 'Tev piešķirts scenārijs “'.($this->assignment->scenario?->title ?? 'Uzdevums').'”.',
            'href' => '/student/tasks/'.$this->assignment->id,
            'type' => 'assignment_assigned',
            'assignment_id' => $this->assignment->id,
            'scenario_id' => $this->assignment->scenario_id,
        ];
    }
}