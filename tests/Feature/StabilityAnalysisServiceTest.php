<?php

namespace Tests\Feature;

use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Models\BallastTank;
use App\Models\CargoPlan;
use App\Models\Vessel;
use Database\Seeders\RealVesselSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\ScenarioSeeder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class StabilityAnalysisServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach ([RoleSeeder::class, RealVesselSeeder::class, ScenarioSeeder::class] as $seeder) {
            if (class_exists($seeder)) {
                $this->seed($seeder);
            }
        }
    }

    public function test_stability_service_returns_core_metrics(): void
    {
        [$vessel, $cargoPlan, $ballastTanks] = $this->analysisInput();

        $analysis = $this->buildAnalysis($vessel, $cargoPlan, $ballastTanks);

        $this->assertIsArray($analysis);

        $this->requireMetric($analysis, $this->totalWeightPaths(), 'total weight / displacement');
        $this->requireMetric($analysis, $this->kgPaths(), 'KG');
        $this->requireMetric($analysis, $this->gmPaths(), 'GM');
        $this->requireMetric($analysis, $this->trimPaths(), 'trim');
        $this->requireMetric($analysis, $this->heelPaths(), 'heel');

        $criteria = data_get($analysis, 'criteria')
            ?? data_get($analysis, 'stability_criteria')
            ?? data_get($analysis, 'checks');

        $this->assertNotEmpty(
            $criteria,
            'Analysis should contain criteria/check results. Top-level keys: '.implode(', ', array_keys($analysis)),
        );
    }

    public function test_higher_compartment_vertical_center_reduces_gm(): void
    {
        [$vessel, $cargoPlan, $ballastTanks] = $this->analysisInput();

        $this->prepareSingleHeavyCargoItem($cargoPlan);
        $this->zeroBallast($ballastTanks);

        $vcgColumn = $this->setColumnForAllReferencedCompartments(
            $cargoPlan,
            $this->vcgColumns(),
            2.0,
        );

        if (! $vcgColumn) {
            $this->markTestSkipped('Compartment VCG/KG column was not found. Adjust vcgColumns() for your schema.');
        }

        $lowKgAnalysis = $this->buildAnalysis(
            $vessel,
            $this->reloadCargoPlan($cargoPlan),
            $this->reloadBallastTanks($vessel),
        );

        $lowKgGm = $this->requireMetric($lowKgAnalysis, $this->gmPaths(), 'GM with low compartment VCG');

        $this->setColumnForAllReferencedCompartments(
            $cargoPlan,
            $this->vcgColumns(),
            25.0,
        );

        $highKgAnalysis = $this->buildAnalysis(
            $vessel,
            $this->reloadCargoPlan($cargoPlan),
            $this->reloadBallastTanks($vessel),
        );

        $highKgGm = $this->requireMetric($highKgAnalysis, $this->gmPaths(), 'GM with high compartment VCG');

        $this->assertLessThan(
            $lowKgGm,
            $highKgGm,
            "When cargo compartment VCG/KG is raised, GM should decrease. Used column: {$vcgColumn}",
        );
    }

    public function test_off_center_compartment_changes_heel(): void
    {
        [$vessel, $cargoPlan, $ballastTanks] = $this->analysisInput();

        $this->prepareSingleHeavyCargoItem($cargoPlan);
        $this->zeroBallast($ballastTanks);

        $tcgColumn = $this->setColumnForAllReferencedCompartments(
            $cargoPlan,
            $this->tcgColumns(),
            0.0,
        );

        if (! $tcgColumn) {
            $this->markTestSkipped('Compartment TCG column was not found. Adjust tcgColumns() for your schema.');
        }

        $centeredAnalysis = $this->buildAnalysis(
            $vessel,
            $this->reloadCargoPlan($cargoPlan),
            $this->reloadBallastTanks($vessel),
        );

        $centeredHeel = abs($this->requireMetric($centeredAnalysis, $this->heelPaths(), 'heel with centered cargo'));

        $this->setColumnForFirstReferencedCompartment(
            $cargoPlan,
            $this->tcgColumns(),
            8.0,
        );

        $offsetAnalysis = $this->buildAnalysis(
            $vessel,
            $this->reloadCargoPlan($cargoPlan),
            $this->reloadBallastTanks($vessel),
        );

        $offsetHeel = abs($this->requireMetric($offsetAnalysis, $this->heelPaths(), 'heel with off-center cargo'));

        $this->assertGreaterThan(
            0.001,
            abs($offsetHeel - $centeredHeel),
            "When cargo compartment TCG is moved away from centerline, heel should change. Used column: {$tcgColumn}",
        );

        $this->assertGreaterThanOrEqual(
            $centeredHeel,
            $offsetHeel,
            "Off-center cargo should not reduce heel in this normalized test case. Used column: {$tcgColumn}",
        );
    }

    public function test_longitudinal_compartment_shift_changes_trim(): void
    {
        [$vessel, $cargoPlan, $ballastTanks] = $this->analysisInput();

        $this->prepareSingleHeavyCargoItem($cargoPlan);
        $this->zeroBallast($ballastTanks);

        $lcgColumn = $this->setColumnForAllReferencedCompartments(
            $cargoPlan,
            $this->lcgColumns(),
            0.0,
        );

        if (! $lcgColumn) {
            $this->markTestSkipped('Compartment LCG column was not found. Adjust lcgColumns() for your schema.');
        }

        $centeredAnalysis = $this->buildAnalysis(
            $vessel,
            $this->reloadCargoPlan($cargoPlan),
            $this->reloadBallastTanks($vessel),
        );

        $centeredTrim = $this->requireMetric($centeredAnalysis, $this->trimPaths(), 'trim with centered cargo');

        $this->setColumnForFirstReferencedCompartment(
            $cargoPlan,
            $this->lcgColumns(),
            45.0,
        );

        $shiftedAnalysis = $this->buildAnalysis(
            $vessel,
            $this->reloadCargoPlan($cargoPlan),
            $this->reloadBallastTanks($vessel),
        );

        $shiftedTrim = $this->requireMetric($shiftedAnalysis, $this->trimPaths(), 'trim with shifted cargo');

        $this->assertGreaterThan(
            0.001,
            abs($shiftedTrim - $centeredTrim),
            "When cargo compartment LCG is shifted longitudinally, trim should change. Used column: {$lcgColumn}",
        );
    }

    private function analysisInput(): array
    {
        $cargoPlan = CargoPlan::query()
            ->with(['items.compartment', 'items.cargoType'])
            ->whereHas('items')
            ->first();

        $this->assertNotNull($cargoPlan, 'No cargo plan with cargo items found. Check RealVesselSeeder/ScenarioSeeder.');

        $vessel = Vessel::query()
            ->with(['limits', 'compartments'])
            ->find($cargoPlan->vessel_id);

        $this->assertNotNull($vessel, 'No vessel found for cargo plan.');

        $ballastTanks = BallastTank::query()
            ->where('vessel_id', $vessel->id)
            ->get();

        return [$vessel, $cargoPlan, $ballastTanks];
    }

    private function buildAnalysis(Vessel $vessel, CargoPlan $cargoPlan, EloquentCollection $ballastTanks): array
    {
        return app(StabilityAnalysisService::class)->build($vessel, $cargoPlan, $ballastTanks);
    }

    private function reloadCargoPlan(CargoPlan $cargoPlan): CargoPlan
    {
        return CargoPlan::query()
            ->with(['items.compartment', 'items.cargoType'])
            ->findOrFail($cargoPlan->id);
    }

    private function reloadBallastTanks(Vessel $vessel): EloquentCollection
    {
        return BallastTank::query()
            ->where('vessel_id', $vessel->id)
            ->get();
    }

    private function prepareSingleHeavyCargoItem(CargoPlan $cargoPlan): void
    {
        $items = $cargoPlan->items()->get();

        if ($items->isEmpty()) {
            $this->markTestSkipped('Cargo plan has no cargo items.');
        }

        foreach ($items as $index => $item) {
            $item->weight_tonnes = $index === 0 ? 10000 : 0;
            $item->volume_m3 = $index === 0 ? 10000 : 0;
            $item->save();
        }
    }

    private function zeroBallast(EloquentCollection $ballastTanks): void
    {
        foreach ($ballastTanks as $tank) {
            if (Schema::hasColumn($tank->getTable(), 'current_tonnes')) {
                $tank->current_tonnes = 0;
            }

            if (Schema::hasColumn($tank->getTable(), 'fill_percent')) {
                $tank->fill_percent = 0;
            }

            $tank->save();
        }
    }

    private function setColumnForAllReferencedCompartments(CargoPlan $cargoPlan, array $candidateColumns, float $value): ?string
    {
        $items = $cargoPlan->items()
            ->with('compartment')
            ->get();

        if ($items->isEmpty()) {
            $this->markTestSkipped('Cargo plan has no cargo items.');
        }

        $usedColumn = null;

        $compartments = $items
            ->pluck('compartment')
            ->filter()
            ->unique('id')
            ->values();

        if ($compartments->isEmpty()) {
            $this->markTestSkipped('Cargo plan items have no related compartments.');
        }

        foreach ($compartments as $compartment) {
            $column = $this->setFirstExistingColumn($compartment, $candidateColumns, $value);

            if ($column) {
                $usedColumn = $column;
                $compartment->save();
            }
        }

        return $usedColumn;
    }

    private function setColumnForFirstReferencedCompartment(CargoPlan $cargoPlan, array $candidateColumns, float $value): ?string
    {
        $item = $cargoPlan->items()
            ->with('compartment')
            ->first();

        if (! $item || ! $item->compartment) {
            $this->markTestSkipped('Cargo plan first item has no related compartment.');
        }

        $column = $this->setFirstExistingColumn($item->compartment, $candidateColumns, $value);

        if ($column) {
            $item->compartment->save();
        }

        return $column;
    }

    private function setFirstExistingColumn(Model $model, array $candidateColumns, float $value): ?string
    {
        foreach ($candidateColumns as $column) {
            if (Schema::hasColumn($model->getTable(), $column)) {
                $model->{$column} = $value;

                return $column;
            }
        }

        return null;
    }

    private function requireMetric(array $analysis, array $paths, string $label): float
    {
        $value = $this->metric($analysis, $paths);

        $this->assertNotNull(
            $value,
            "Metric '{$label}' was not found. Checked paths: ".implode(', ', $paths).
            '. Top-level analysis keys: '.implode(', ', array_keys($analysis)),
        );

        return $value;
    }

    private function metric(array $analysis, array $paths): ?float
    {
        foreach ($paths as $path) {
            $value = data_get($analysis, $path);

            if (is_numeric($value)) {
                return (float) $value;
            }
        }

        return null;
    }

    private function totalWeightPaths(): array
    {
        return [
            'metrics.displacement',
            'metrics.total_weight',
            'metrics.totalWeight',
            'summary.displacement',
            'summary.total_weight',
            'weights.total',
            'displacement',
            'total_weight',
            'totalWeight',
        ];
    }

    private function kgPaths(): array
    {
        return [
            'metrics.kg',
            'metrics.KG',
            'metrics.vertical_center_of_gravity',
            'summary.kg',
            'kg',
            'KG',
        ];
    }

    private function gmPaths(): array
    {
        return [
            'metrics.gm',
            'metrics.GM',
            'metrics.corrected_gm',
            'summary.gm',
            'summary.corrected_gm',
            'stability.gm',
            'gm',
            'GM',
            'corrected_gm',
        ];
    }

    private function trimPaths(): array
    {
        return [
            'metrics.trim',
            'metrics.trim_m',
            'metrics.trimMeters',
            'summary.trim',
            'trim',
            'trim_m',
        ];
    }

    private function heelPaths(): array
    {
        return [
            'metrics.heel',
            'metrics.heel_deg',
            'metrics.heelAngle',
            'summary.heel',
            'heel',
            'heel_deg',
        ];
    }

    private function vcgColumns(): array
    {
        return [
            'vcg',
            'vcg_m',
            'kg',
            'kg_m',
            'vertical_center',
            'vertical_center_m',
            'vertical_center_of_gravity',
        ];
    }

    private function tcgColumns(): array
    {
        return [
            'tcg',
            'tcg_m',
            'transverse_center',
            'transverse_center_m',
            'transverse_center_of_gravity',
        ];
    }

    private function lcgColumns(): array
    {
        return [
            'lcg',
            'lcg_m',
            'longitudinal_center',
            'longitudinal_center_m',
            'longitudinal_center_of_gravity',
        ];
    }
}