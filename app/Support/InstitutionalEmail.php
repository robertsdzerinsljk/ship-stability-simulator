<?php

namespace App\Support;

class InstitutionalEmail
{
    public static function roleFor(string $email): ?string
    {
        $email = mb_strtolower(trim($email));

        if (str_ends_with($email, '@ljk.lv')) {
            return 'teacher';
        }

        if (str_ends_with($email, '@ljkstudents.lv')) {
            return 'student';
        }

        return null;
    }

    public static function isAllowed(string $email): bool
    {
        return self::roleFor($email) !== null;
    }
}
