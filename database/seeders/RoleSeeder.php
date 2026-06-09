<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $studentRole = Role::firstOrCreate(['name' => 'student']);
        $teacherRole = Role::firstOrCreate(['name' => 'teacher']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

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