<?php

namespace App\Notifications;

use App\Models\Assignment;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AssignmentSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Assignment $assignment,
        public Submission $submission,
        public User $student,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Jauns iesniegums vērtēšanai',
            'message' => $this->student->name.' iesniedza uzdevumu “'.($this->assignment->scenario?->title ?? 'Uzdevums').'”.',
            'href' => '/teacher/submissions/'.$this->submission->id,
            'type' => 'submission_submitted',
            'assignment_id' => $this->assignment->id,
            'submission_id' => $this->submission->id,
            'student_id' => $this->student->id,
        ];
    }
}