<?php

namespace App\Notifications;

use App\Models\Assignment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AssignmentOverdueNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Assignment $assignment,
        public string $recipientRole = 'student',
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        if ($this->recipientRole === 'teacher') {
            return [
                'title' => 'Uzdevumam beidzies termiņš',
                'message' => ($this->assignment->student?->name ?? 'Students').' nav iesniedzis uzdevumu “'.($this->assignment->scenario?->title ?? 'Uzdevums').'” līdz termiņam.',
                'href' => '/teacher/assignments',
                'type' => 'assignment_overdue_teacher',
                'assignment_id' => $this->assignment->id,
                'student_id' => $this->assignment->user_id,
                'scenario_id' => $this->assignment->scenario_id,
                'due_at' => $this->assignment->due_at?->format('d.m.Y H:i'),
            ];
        }

        return [
            'title' => 'Uzdevuma termiņš ir beidzies',
            'message' => 'Uzdevumam “'.($this->assignment->scenario?->title ?? 'Uzdevums').'” ir beidzies iesniegšanas termiņš.',
            'href' => '/student/tasks/'.$this->assignment->id,
            'type' => 'assignment_overdue_student',
            'assignment_id' => $this->assignment->id,
            'scenario_id' => $this->assignment->scenario_id,
            'due_at' => $this->assignment->due_at?->format('d.m.Y H:i'),
        ];
    }
}