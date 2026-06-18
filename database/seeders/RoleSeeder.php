<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\ApplicationRoles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        ApplicationRoles::ensureDefaults();

        $studentRole = Role::findByName(ApplicationRoles::STUDENT);
        $teacherRole = Role::findByName(ApplicationRoles::TEACHER);
        $adminRole = Role::findByName(ApplicationRoles::ADMIN);

        $student = User::firstOrCreate(
            ['email' => 'student@example.test'],
            [
                'name' => 'Demo Students',
                'password' => Hash::make('password'),
                'auth_provider' => 'local',
                'email_verified_at' => now(),
            ],
        );

        $teacher = User::firstOrCreate(
            ['email' => 'teacher@example.test'],
            [
                'name' => 'Demo Pasniedzējs',
                'password' => Hash::make('password'),
                'auth_provider' => 'local',
                'email_verified_at' => now(),
            ],
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.test'],
            [
                'name' => 'Demo Administrators',
                'password' => Hash::make('password'),
                'auth_provider' => 'local',
                'email_verified_at' => now(),
            ],
        );

        $student->syncRoles([$studentRole]);
        $teacher->syncRoles([$teacherRole]);
        $admin->syncRoles([$adminRole]);

        $localTestUser = User::where('email', 'test@test.lv')->first();

        if ($localTestUser) {
            $localTestUser->syncRoles([$adminRole]);
        }
    }
}
