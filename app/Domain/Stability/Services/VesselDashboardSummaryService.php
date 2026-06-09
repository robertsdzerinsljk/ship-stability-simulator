<?php

namespace App\Domain\Stability\Services;

use App\Models\CargoPlan;
use App\Models\Vessel;

class VesselDashboardSummaryService
{
    public function build(Vessel $vessel, ?CargoPlan $cargoPlan): array
    {
        $compartments = $vessel->compartments;
        $ballastTanks = $vessel->ballastTanks;
        $limits = $vessel->limits;

        $cargoItems = $cargoPlan?->items ?? collect();

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

        $freeSurfaceCorrection = $this->calculateFreeSurfaceCorrection($vessel, $totalWeight);

        $gm = $km - $kg - $freeSurfaceCorrection;

        $lpp = max((float) ($vessel->length_between_perpendiculars ?? $vessel->length_overall ?? 1), 1);
        $trim = ($lcg / $lpp) * 5.0;

        $heel = min(abs($tcg) * 0.25, 10);

        $maxDisplacement = max((float) $vessel->lightship_weight + (float) $vessel->dwt, 1);
        $summerDraft = (float) ($vessel->summer_draft ?? 0);
        $meanDraft = $summerDraft > 0 ? ($summerDraft * ($totalWeight / $maxDisplacement)) : 0;

        $foreDraft = max($meanDraft - ($trim / 2), 0);
        $aftDraft = max($meanDraft + ($trim / 2), 0);

        $holds = $compartments->map(function ($compartment) use ($cargoItems) {
            $weight = (float) $cargoItems
                ->where('vessel_compartment_id', $compartment->id)
                ->sum('weight_tonnes');

            $capacity = max((float) $compartment->capacity_tonnes, 1);
            $loadPercent = ($weight / $capacity) * 100;

            return [
                'id' => $compartment->id,
                'name' => $compartment->name,
                'code' => $compartment->code,
                'weight_tonnes' => round($weight, 2),
                'capacity_tonnes' => round($capacity, 2),
                'load_percent' => round($loadPercent, 1),
                'status' => $this->holdStatus($loadPercent),
            ];
        })->values();

        $ballast = $ballastTanks->map(function ($tank) {
            $capacity = max((float) $tank->capacity_tonnes, 1);
            $current = (float) $tank->current_tonnes;
            $fillPercent = ($current / $capacity) * 100;

            return [
                'id' => $tank->id,
                'name' => $tank->name,
                'code' => $tank->code,
                'side' => $tank->side,
                'current_tonnes' => round($current, 2),
                'capacity_tonnes' => round($capacity, 2),
                'fill_percent' => round($fillPercent, 1),
                'free_surface_risk' => $fillPercent > 5 && $fillPercent < 95,
            ];
        })->values();

        $warnings = $this->buildWarnings(
            gm: $gm,
            trim: $trim,
            heel: $heel,
            holds: $holds->toArray(),
            limits: $limits,
        );

        $safetyLevel = $this->safetyLevel($warnings, $gm, $limits);

        return [
            'vessel' => [
                'id' => $vessel->id,
                'name' => $vessel->name,
                'type' => $vessel->type,
                'imo_number' => $vessel->imo_number,
                'flag' => $vessel->flag,
                'dwt' => round((float) $vessel->dwt, 2),
                'length_overall' => round((float) $vessel->length_overall, 2),
                'breadth' => round((float) $vessel->breadth, 2),
            ],

            'metrics' => [
                'safety_status' => [
                    'label' => $this->safetyLabel($safetyLevel),
                    'level' => $safetyLevel,
                    'description' => $this->safetyDescription($safetyLevel),
                ],
                'cargo_load' => [
                    'value' => round($cargoWeight > 0 && $vessel->dwt > 0 ? ($cargoWeight / (float) $vessel->dwt) * 100 : 0, 1),
                    'cargo_tonnes' => round($cargoWeight, 2),
                    'dwt' => round((float) $vessel->dwt, 2),
                ],
                'gm' => [
                    'value' => round($gm, 3),
                    'min' => round((float) ($limits?->min_gm ?? 0.5), 3),
                ],
                'trim' => [
                    'value' => round($trim, 3),
                    'direction' => $trim >= 0 ? 'uz pakaļgalu' : 'uz priekšgalu',
                ],
                'heel' => [
                    'value' => round($heel, 3),
                ],
                'ballast' => [
                    'value' => $this->ballastStatus($ballastWeight, $ballast->toArray()),
                    'tonnes' => round($ballastWeight, 2),
                ],
                'drafts' => [
                    'fore' => round($foreDraft, 2),
                    'aft' => round($aftDraft, 2),
                    'mean' => round($meanDraft, 2),
                ],
                'total_displacement' => round($totalWeight, 2),
            ],

            'holds' => $holds,
            'ballast_tanks' => $ballast,
            'warnings' => $warnings,
        ];
    }

    private function calculateFreeSurfaceCorrection(Vessel $vessel, float $totalWeight): float
    {
        $correction = 0;

        foreach ($vessel->ballastTanks as $tank) {
            $capacity = max((float) $tank->capacity_tonnes, 1);
            $current = (float) $tank->current_tonnes;
            $fillPercent = ($current / $capacity) * 100;

            if ($fillPercent > 5 && $fillPercent < 95) {
                $correction += $current * (float) $tank->free_surface_coefficient;
            }
        }

        return $correction / max($totalWeight, 1);
    }

    private function holdStatus(float $loadPercent): string
    {
        if ($loadPercent >= 100) {
            return 'Pārslogots';
        }

        if ($loadPercent >= 95) {
            return 'Pilns';
        }

        if ($loadPercent >= 85) {
            return 'Brīdinājums';
        }

        if ($loadPercent >= 65) {
            return 'Pieņemams';
        }

        return 'Labi';
    }

    private function buildWarnings(float $gm, float $trim, float $heel, array $holds, mixed $limits): array
    {
        $warnings = [];

        $minGm = (float) ($limits?->min_gm ?? 0.5);
        $maxTrim = (float) ($limits?->max_trim ?? 2.0);
        $maxHeel = (float) ($limits?->max_heel ?? 3.0);

        foreach ($holds as $hold) {
            if ($hold['load_percent'] >= 100) {
                $warnings[] = [
                    'level' => 'danger',
                    'title' => "{$hold['name']} ir pārslogota",
                    'description' => "Tilpnes noslodze ir {$hold['load_percent']} %. Nepieciešams samazināt kravu.",
                ];
            } elseif ($hold['load_percent'] >= 90) {
                $warnings[] = [
                    'level' => 'warning',
                    'title' => "{$hold['name']} tuvojas maksimālajai noslodzei",
                    'description' => "Tilpnes aizpildījums ir {$hold['load_percent']} %. Ieteicams pārskatīt kravas sadali.",
                ];
            }
        }

        if ($gm < $minGm) {
            $warnings[] = [
                'level' => 'danger',
                'title' => 'GM ir zem minimālās robežas',
                'description' => "Aprēķinātais GM ir " . round($gm, 3) . " m, bet minimālā robeža ir {$minGm} m.",
            ];
        } elseif ($gm < ($minGm + 0.25)) {
            $warnings[] = [
                'level' => 'warning',
                'title' => 'GM rezerve ir zema',
                'description' => "Stabilitāte ir pieļaujama, bet GM rezerve ir neliela.",
            ];
        }

        if (abs($trim) > $maxTrim) {
            $warnings[] = [
                'level' => 'danger',
                'title' => 'Trims pārsniedz pieļaujamo robežu',
                'description' => "Aprēķinātais trims ir " . round($trim, 2) . " m.",
            ];
        } elseif (abs($trim) > ($maxTrim * 0.65)) {
            $warnings[] = [
                'level' => 'warning',
                'title' => 'Trims tuvojas robežvērtībai',
                'description' => "Balasta korekcija var uzlabot kuģa garenisko līdzsvaru.",
            ];
        }

        if ($heel > $maxHeel) {
            $warnings[] = [
                'level' => 'danger',
                'title' => 'Sasvērums pārsniedz pieļaujamo robežu',
                'description' => "Aprēķinātais sasvērums ir " . round($heel, 2) . "°.",
            ];
        }

        return $warnings;
    }

    private function safetyLevel(array $warnings, float $gm, mixed $limits): string
    {
        $hasDanger = collect($warnings)->contains(fn (array $warning) => $warning['level'] === 'danger');

        if ($hasDanger) {
            return 'danger';
        }

        if (count($warnings) > 0) {
            return 'warning';
        }

        return 'good';
    }

    private function safetyLabel(string $level): string
    {
        return match ($level) {
            'danger' => 'Nedroši',
            'warning' => 'Jāpārbauda',
            default => 'Droši',
        };
    }

    private function safetyDescription(string $level): string
    {
        return match ($level) {
            'danger' => 'Ir pārsniegtas kritiskās robežas',
            'warning' => 'Ir brīdinājumi, bet kritiskie limiti nav pārsniegti',
            default => 'Visi kritiskie limiti izpildīti',
        };
    }

    private function ballastStatus(float $ballastWeight, array $ballast): string
    {
        if ($ballastWeight <= 0) {
            return 'Nav balasta';
        }

        $port = collect($ballast)
            ->where('side', 'port')
            ->sum('current_tonnes');

        $starboard = collect($ballast)
            ->where('side', 'starboard')
            ->sum('current_tonnes');

        if (abs($port - $starboard) > 100) {
            return 'Jāpārbauda';
        }

        return 'Līdzsvarots';
    }
}