<?php

namespace App\Domain\Stability\Services;

use App\Models\CargoPlan;
use App\Models\Vessel;

class StabilityAnalysisService
{
    public function build(Vessel $vessel, ?CargoPlan $cargoPlan, $ballastTanksOverride = null): array
    {
        $cargoItems = $cargoPlan?->items ?? collect();
        $ballastTanks = $ballastTanksOverride ?? $vessel->ballastTanks;
        $limits = $vessel->limits;

        $cargoWeight = (float) $cargoItems->sum('weight_tonnes');
        $ballastWeight = (float) $ballastTanks->sum('current_tonnes');
        $lightshipWeight = (float) ($vessel->lightship_weight ?? 0);

        $totalWeight = max($lightshipWeight + $cargoWeight + $ballastWeight, 1);

        $lightshipKg = 6.300;
        $lightshipLcg = 0.000;
        $lightshipTcg = 0.000;

        $verticalMoment = $lightshipWeight * $lightshipKg;
        $longitudinalMoment = $lightshipWeight * $lightshipLcg;
        $transverseMoment = $lightshipWeight * $lightshipTcg;

        foreach ($cargoItems as $item) {
            $weight = (float) $item->weight_tonnes;
            $compartment = $item->compartment;

            if (! $compartment) {
                continue;
            }

            $verticalMoment += $weight * (float) $compartment->vcg;
            $longitudinalMoment += $weight * (float) $compartment->lcg;
            $transverseMoment += $weight * (float) $compartment->tcg;
        }

        foreach ($ballastTanks as $tank) {
            $weight = (float) $tank->current_tonnes;

            $verticalMoment += $weight * (float) $tank->vcg;
            $longitudinalMoment += $weight * (float) $tank->lcg;
            $transverseMoment += $weight * (float) $tank->tcg;
        }

        $kg = $verticalMoment / $totalWeight;
        $lcg = $longitudinalMoment / $totalWeight;
        $tcg = $transverseMoment / $totalWeight;

        $km = (float) ($vessel->km_default ?? 0);
        $freeSurfaceCorrection = $this->calculateFreeSurfaceCorrection($ballastTanks, $totalWeight);
        $gm = $km - $kg - $freeSurfaceCorrection;

        $lpp = max((float) ($vessel->length_between_perpendiculars ?? $vessel->length_overall ?? 1), 1);
        $trim = ($lcg / $lpp) * 5.0;
        $heel = min(abs($tcg) * 0.25, 10);

        $maxDisplacement = max((float) $vessel->lightship_weight + (float) $vessel->dwt, 1);
        $summerDraft = (float) ($vessel->summer_draft ?? 0);
        $meanDraft = $summerDraft > 0 ? ($summerDraft * ($totalWeight / $maxDisplacement)) : 0;

        $foreDraft = max($meanDraft - ($trim / 2), 0);
        $aftDraft = max($meanDraft + ($trim / 2), 0);

        $holdLoads = $vessel->compartments->map(function ($compartment) use ($cargoItems) {
            $weight = (float) $cargoItems
                ->where('vessel_compartment_id', $compartment->id)
                ->sum('weight_tonnes');

            $capacity = max((float) $compartment->capacity_tonnes, 1);
            $loadPercent = ($weight / $capacity) * 100;

            return [
                'name' => $compartment->name,
                'code' => $compartment->code,
                'weight_tonnes' => round($weight, 2),
                'capacity_tonnes' => round($capacity, 2),
                'load_percent' => round($loadPercent, 1),
                'lcg' => round((float) $compartment->lcg, 2),
            ];
        })->values();

        $gzCurve = $this->buildGzCurve($gm);
        $gzSummary = $this->summarizeGzCurve($gzCurve);

        $shearForce = $this->buildShearForceProfile($vessel, $cargoItems, $ballastTanks, $totalWeight);
        $bendingMoment = $this->buildBendingMomentProfile($shearForce);

        $criteria = $this->buildCriteria(
            gm: $gm,
            trim: $trim,
            heel: $heel,
            foreDraft: $foreDraft,
            aftDraft: $aftDraft,
            holdLoads: $holdLoads->toArray(),
            freeSurfaceCount: $this->freeSurfaceTankCount($ballastTanks),
            gzSummary: $gzSummary,
            limits: $limits,
        );

        return [
            'vessel' => [
                'id' => $vessel->id,
                'name' => $vessel->name,
                'type' => $vessel->type,
                'imo_number' => $vessel->imo_number,
                'length_overall' => round((float) $vessel->length_overall, 2),
                'breadth' => round((float) $vessel->breadth, 2),
                'dwt' => round((float) $vessel->dwt, 2),
            ],

            'condition' => [
                'cargo_plan_name' => $cargoPlan?->name ?? 'Nav aktīva kravas plāna',
                'mode' => $cargoPlan?->mode ?? 'training',
            ],

            'metrics' => [
                'displacement' => round($totalWeight, 2),
                'lightship_weight' => round($lightshipWeight, 2),
                'cargo_weight' => round($cargoWeight, 2),
                'ballast_weight' => round($ballastWeight, 2),

                'kg' => round($kg, 3),
                'km' => round($km, 3),
                'gm' => round($gm, 3),
                'free_surface_correction' => round($freeSurfaceCorrection, 4),

                'lcg' => round($lcg, 3),
                'tcg' => round($tcg, 3),
                'trim' => round($trim, 3),
                'trim_direction' => $trim >= 0 ? 'uz pakaļgalu' : 'uz priekšgalu',
                'heel' => round($heel, 3),

                'fore_draft' => round($foreDraft, 2),
                'aft_draft' => round($aftDraft, 2),
                'mean_draft' => round($meanDraft, 2),

                'max_gz' => $gzSummary['max_gz'],
                'angle_at_max_gz' => $gzSummary['angle_at_max_gz'],
                'gz_area' => $gzSummary['area'],
            ],

            'criteria' => $criteria,
            'hold_loads' => $holdLoads,
            'charts' => [
                'gz_curve' => $gzCurve,
                'shear_force' => $shearForce,
                'bending_moment' => $bendingMoment,
            ],
        ];
    }

    private function calculateFreeSurfaceCorrection($ballastTanks, float $totalWeight): float
    {
        $correction = 0;

        foreach ($ballastTanks as $tank) {
            $capacity = max((float) $tank->capacity_tonnes, 1);
            $current = (float) $tank->current_tonnes;
            $fillPercent = ($current / $capacity) * 100;

            if ($fillPercent > 5 && $fillPercent < 95) {
                $correction += $current * (float) $tank->free_surface_coefficient;
            }
        }

        return $correction / max($totalWeight, 1);
    }

    private function freeSurfaceTankCount($ballastTanks): int
    {
        return collect($ballastTanks)
            ->filter(function ($tank) {
                $capacity = max((float) $tank->capacity_tonnes, 1);
                $current = (float) $tank->current_tonnes;
                $fillPercent = ($current / $capacity) * 100;

                return $fillPercent > 5 && $fillPercent < 95;
            })
            ->count();
    }

    private function buildGzCurve(float $gm): array
    {
        $points = [];

        for ($angle = 0; $angle <= 80; $angle += 5) {
            $radians = deg2rad($angle);
            $shapeFactor = max(0, 1 - ($angle / 120));
            $gz = max(0, $gm * sin($radians) * $shapeFactor);

            $criteriaLine = match (true) {
                $angle < 10 => 0,
                $angle < 30 => 0.10,
                $angle < 60 => 0.20,
                default => 0.12,
            };

            $points[] = [
                'angle' => $angle,
                'gz' => round($gz, 3),
                'criteria' => round($criteriaLine, 3),
            ];
        }

        return $points;
    }

    private function summarizeGzCurve(array $gzCurve): array
    {
        $maxPoint = collect($gzCurve)->sortByDesc('gz')->first();

        $area = 0;

        for ($i = 1; $i < count($gzCurve); $i++) {
            $previous = $gzCurve[$i - 1];
            $current = $gzCurve[$i];

            $deltaAngleRadians = deg2rad($current['angle'] - $previous['angle']);
            $area += (($previous['gz'] + $current['gz']) / 2) * $deltaAngleRadians;
        }

        return [
            'max_gz' => round((float) ($maxPoint['gz'] ?? 0), 3),
            'angle_at_max_gz' => (int) ($maxPoint['angle'] ?? 0),
            'area' => round($area, 4),
        ];
    }

    private function buildShearForceProfile(Vessel $vessel, $cargoItems, $ballastTanks, float $totalWeight): array
    {
        $lpp = max((float) ($vessel->length_between_perpendiculars ?? $vessel->length_overall ?? 180), 1);
        $halfLength = $lpp / 2;

        $loads = [
            [
                'position' => 0,
                'weight' => (float) $vessel->lightship_weight,
            ],
        ];

        foreach ($cargoItems as $item) {
            if (! $item->compartment) {
                continue;
            }

            $loads[] = [
                'position' => (float) $item->compartment->lcg,
                'weight' => (float) $item->weight_tonnes,
            ];
        }

        foreach ($ballastTanks as $tank) {
            $loads[] = [
                'position' => (float) $tank->lcg,
                'weight' => (float) $tank->current_tonnes,
            ];
        }

        $points = [];

        for ($x = -$halfLength; $x <= $halfLength; $x += 15) {
            $weightToLeft = collect($loads)
                ->filter(fn (array $load) => $load['position'] <= $x)
                ->sum('weight');

            $buoyancyToLeft = $totalWeight * (($x + $halfLength) / $lpp);
            $shear = ($buoyancyToLeft - $weightToLeft) / 1000;

            $points[] = [
                'station' => round($x, 1),
                'shear' => round($shear, 3),
                'limit_positive' => 18,
                'limit_negative' => -18,
            ];
        }

        return $points;
    }

    private function buildBendingMomentProfile(array $shearForce): array
    {
        $points = [];
        $moment = 0;

        for ($i = 0; $i < count($shearForce); $i++) {
            if ($i > 0) {
                $dx = $shearForce[$i]['station'] - $shearForce[$i - 1]['station'];
                $averageShear = ($shearForce[$i]['shear'] + $shearForce[$i - 1]['shear']) / 2;
                $moment += $averageShear * $dx;
            }

            $points[] = [
                'station' => $shearForce[$i]['station'],
                'moment' => round($moment, 3),
                'limit_positive' => 850,
                'limit_negative' => -850,
            ];
        }

        return $points;
    }

    private function buildCriteria(
        float $gm,
        float $trim,
        float $heel,
        float $foreDraft,
        float $aftDraft,
        array $holdLoads,
        int $freeSurfaceCount,
        array $gzSummary,
        mixed $limits,
    ): array {
        $minGm = (float) ($limits?->min_gm ?? 0.5);
        $maxDraft = (float) ($limits?->max_draft ?? 11.2);
        $maxTrim = (float) ($limits?->max_trim ?? 2.0);
        $maxHeel = (float) ($limits?->max_heel ?? 3.0);

        $maxHoldLoad = collect($holdLoads)->max('load_percent') ?? 0;

        return [
            [
                'name' => 'Minimālais GM',
                'requirement' => "≥ {$minGm} m",
                'actual' => round($gm, 3) . ' m',
                'status' => $gm >= $minGm ? 'pass' : 'fail',
                'comment' => $gm >= $minGm
                    ? 'Kuģim ir pietiekama sākotnējā stabilitātes rezerve.'
                    : 'GM ir zem robežas, nepieciešams samazināt KG vai koriģēt balastu.',
            ],
            [
                'name' => 'Maksimālā iegrime',
                'requirement' => "≤ {$maxDraft} m",
                'actual' => round(max($foreDraft, $aftDraft), 2) . ' m',
                'status' => max($foreDraft, $aftDraft) <= $maxDraft ? 'pass' : 'fail',
                'comment' => 'Tiek pārbaudīta lielākā no priekšgala un pakaļgala iegrimēm.',
            ],
            [
                'name' => 'Trima robeža',
                'requirement' => "≤ {$maxTrim} m",
                'actual' => round(abs($trim), 3) . ' m',
                'status' => abs($trim) <= $maxTrim ? 'pass' : 'fail',
                'comment' => abs($trim) <= $maxTrim
                    ? 'Trims ir pieļaujamās robežās.'
                    : 'Trims pārsniedz robežu, jāpārskata gareniskais svara sadalījums.',
            ],
            [
                'name' => 'Sasvēruma robeža',
                'requirement' => "≤ {$maxHeel}°",
                'actual' => round($heel, 3) . '°',
                'status' => $heel <= $maxHeel ? 'pass' : 'fail',
                'comment' => $heel <= $maxHeel
                    ? 'Sasvērums ir pieļaujams.'
                    : 'Sasvērums ir pārāk liels, jāpārbauda bortu balanss.',
            ],
            [
                'name' => 'Tilpņu noslodze',
                'requirement' => '≤ 100%',
                'actual' => round($maxHoldLoad, 1) . '%',
                'status' => $maxHoldLoad <= 100 ? ($maxHoldLoad >= 90 ? 'warning' : 'pass') : 'fail',
                'comment' => $maxHoldLoad >= 90
                    ? 'Vismaz viena tilpne tuvojas maksimālajai noslodzei.'
                    : 'Tilpņu noslodze ir pieņemama.',
            ],
            [
                'name' => 'Brīvās virsmas efekts',
                'requirement' => 'Pēc iespējas mazāks',
                'actual' => "{$freeSurfaceCount} tanki",
                'status' => $freeSurfaceCount > 0 ? 'warning' : 'pass',
                'comment' => $freeSurfaceCount > 0
                    ? 'Daļēji piepildīti tanki var samazināt GM rezervi.'
                    : 'Nav būtiska brīvās virsmas riska.',
            ],
            [
                'name' => 'Maksimālais GZ',
                'requirement' => '≥ 0.20 m',
                'actual' => $gzSummary['max_gz'] . ' m',
                'status' => $gzSummary['max_gz'] >= 0.20 ? 'pass' : 'warning',
                'comment' => 'Vienkāršotajā mācību modelī tiek pārbaudīta GZ līknes maksimālā vērtība.',
            ],
            [
                'name' => 'Leņķis pie maksimālā GZ',
                'requirement' => '≥ 25°',
                'actual' => $gzSummary['angle_at_max_gz'] . '°',
                'status' => $gzSummary['angle_at_max_gz'] >= 25 ? 'pass' : 'warning',
                'comment' => 'Lielāks leņķis pie maksimālā GZ parasti norāda uz labāku stabilitātes rezervi.',
            ],
        ];
    }
}