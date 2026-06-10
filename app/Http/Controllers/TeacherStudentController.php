<?php

namespace App\Http\Controllers;

use App\Models\StudentGroup;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class TeacherStudentController extends Controller
{
    public function index(): Response
    {
        $groups = StudentGroup::query()
            ->with(['students' => fn ($query) => $query->orderBy('name')])
            ->where('status', 'active')
            ->orderBy('academic_year')
            ->orderBy('name')
            ->get();

        $students = User::role('student')
            ->with(['studentGroups' => fn ($query) => $query->orderBy('name')])
            ->orderBy('name')
            ->get();

        return Inertia::render('TeacherStudents/Index', [
            'stats' => [
                'students' => $students->count(),
                'groups' => $groups->count(),
                'students_without_group' => $students
                    ->filter(fn (User $student) => $student->studentGroups->isEmpty())
                    ->count(),
            ],
            'groups' => $groups
                ->map(fn (StudentGroup $group) => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'code' => $group->code,
                    'academic_year' => $group->academic_year,
                    'type' => $group->type,
                    'external_source' => $group->external_source,
                    'external_id' => $group->external_id,
                    'description' => $group->description,
                    'status' => $group->status,
                    'synced_at' => $group->synced_at?->format('d.m.Y H:i'),
                    'students_count' => $group->students->count(),
                    'students' => $group->students
                        ->map(fn (User $student) => [
                            'id' => $student->id,
                            'name' => $student->name,
                            'email' => $student->email,
                        ])
                        ->values(),
                ])
                ->values(),
            'students' => $students
                ->map(fn (User $student) => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'groups' => $student->studentGroups
                        ->map(fn (StudentGroup $group) => [
                            'id' => $group->id,
                            'name' => $group->name,
                            'code' => $group->code,
                            'academic_year' => $group->academic_year,
                            'external_source' => $group->external_source,
                        ])
                        ->values(),
                ])
                ->values(),
        ]);
    }
}