<?php

namespace Database\Seeders;

use App\Models\StudentGroup;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentGroupSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            [
                'name' => 'Demo Students',
                'email' => 'student@example.test',
                'group' => 'LJK-3LJ',
            ],
            [
                'name' => 'Anna Liepiņa',
                'email' => 'anna.student@example.test',
                'group' => 'LJK-3LJ',
            ],
            [
                'name' => 'Jānis Ozols',
                'email' => 'janis.student@example.test',
                'group' => 'LJK-3LJ',
            ],
            [
                'name' => 'Laura Kalniņa',
                'email' => 'laura.student@example.test',
                'group' => 'LJK-4LJ',
            ],
            [
                'name' => 'Mārtiņš Bērziņš',
                'email' => 'martins.student@example.test',
                'group' => 'LJK-4LJ',
            ],
        ];

        $createdStudents = collect();

        foreach ($students as $studentData) {
            $student = User::query()->updateOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ],
            );

            if (! $student->hasRole('student')) {
                $student->assignRole('student');
            }

            $createdStudents->push([
                'user' => $student,
                'group' => $studentData['group'],
            ]);
        }

        $groups = [
            [
                'key' => 'LJK-3LJ',
                'name' => '3LJ kuģu vadītāji',
                'code' => '3LJ',
                'academic_year' => '2025/2026',
                'type' => 'class',
                'external_source' => 'institution_demo',
                'external_id' => 'LJK-3LJ-2025',
                'description' => 'Demo klase kuģu vadītāju stabilitātes simulatora testēšanai.',
            ],
            [
                'key' => 'LJK-4LJ',
                'name' => '4LJ kuģu mehāniķi',
                'code' => '4LJ',
                'academic_year' => '2025/2026',
                'type' => 'class',
                'external_source' => 'institution_demo',
                'external_id' => 'LJK-4LJ-2025',
                'description' => 'Demo klase kuģu mehāniķu stabilitātes simulatora testēšanai.',
            ],
        ];

        foreach ($groups as $groupData) {
            $group = StudentGroup::query()->updateOrCreate(
                [
                    'external_source' => $groupData['external_source'],
                    'external_id' => $groupData['external_id'],
                ],
                [
                    'name' => $groupData['name'],
                    'code' => $groupData['code'],
                    'academic_year' => $groupData['academic_year'],
                    'type' => $groupData['type'],
                    'description' => $groupData['description'],
                    'status' => 'active',
                    'synced_at' => now(),
                ],
            );

            $studentIds = $createdStudents
                ->filter(fn ($item) => $item['group'] === $groupData['key'])
                ->map(fn ($item) => $item['user']->id)
                ->values();

            $syncPayload = $studentIds
                ->mapWithKeys(fn ($studentId) => [
                    $studentId => [
                        'member_role' => 'student',
                        'status' => 'active',
                        'external_source' => 'institution_demo',
                        'external_membership_id' => $groupData['external_id'] . '-USER-' . $studentId,
                        'joined_at' => now(),
                        'synced_at' => now(),
                    ],
                ])
                ->toArray();

            $group->members()->sync($syncPayload);
        }
    }
}