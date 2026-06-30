<?php

namespace App\Support;

final class StudentGroupCatalog
{
    public const CODES = [
        '51 BT',
        'APM_I',
        'APM_II',
        'APM_III',
        'APV_I',
        'APV_II',
        'APV_III',
        'AVM_I',
        'AVM_II',
        'AVM_III',
        'AVM_IV',
        'AVV_I',
        'AVV_II',
        'AVV_III',
        'AVV_IV',
        'L-11A',
        'L-21A',
        'LS_II',
        'LS_III',
        'M-11',
        'M-12',
        'M-21',
        'M-31',
        'M-41',
        'M-21A',
        'M-31A',
        'M-51A',
        'M-61A',
        'S-11',
        'S-12',
        'S-21',
        'S-22',
        'S-31',
        'S-32',
        'S-41',
        'S-11A',
        'S-21A',
        'S-31A',
        'S-51A',
        'S-61A',
    ];

    public static function codes(): array
    {
        return self::CODES;
    }
}
