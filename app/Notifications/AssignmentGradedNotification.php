<?php

namespace App\Notifications;

use App\Models\Assignment;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AssignmentGradedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Assignment $assignment,
        public Submission $submission,
        public User $teacher,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $scoreText = $this->submission->score !== null
            ? ' Vērtējums: '.$this->submission->score.'/10.'
            : '';

        return [
            'title' => 'Darbs ir novērtēts',
            'message' => 'Pasniedzējs novērtēja uzdevumu “'.($this->assignment->scenario?->title ?? 'Uzdevums').'”.'.$scoreText,
            'href' => '/student/tasks/'.$this->assignment->id,
            'type' => 'assignment_graded',
            'assignment_id' => $this->assignment->id,
            'submission_id' => $this->submission->id,
            'teacher_id' => $this->teacher->id,
        ];
    }
}