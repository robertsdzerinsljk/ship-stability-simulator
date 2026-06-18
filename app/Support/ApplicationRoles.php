<?php

namespace App\Support;

use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class ApplicationRoles
{
    public const STUDENT = 'student';

    public const TEACHER = 'teacher';

    public const ADMIN = 'admin';

    /**
     * Ensure the built-in roles exist before assigning roles on fresh databases.
     */
    public static function ensureDefaults(): void
    {
        foreach ([self::STUDENT, self::TEACHER, self::ADMIN] as $role) {
            Role::query()->firstOrCreate([
                'name' => $role,
                'guard_name' => 'web',
            ]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
