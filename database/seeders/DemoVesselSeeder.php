<?php

namespace Database\Seeders;

use App\Models\BallastTank;
use App\Models\CargoPlan;
use App\Models\CargoPlanItem;
use App\Models\CargoType;
use App\Models\Vessel;
use App\Models\VesselCompartment;
use App\Models\VesselLimit;
use Illuminate\Database\Seeder;

class DemoVesselSeeder extends Seeder
{
    public function run(): void
    {
        $vessel = Vessel::updateOrCreate(
            ['name' => 'MV Ocean Pioneer'],
            [
                'imo_number' => '9876543',
                'mmsi' => '275000001',
                'type' => 'Bulk Carrier',
                'flag' => 'Latvia',
                'class' => 'DNV',
                'operator' => 'Training Fleet',
                'built_year' => 2015,
                'length_overall' => 190.00,
                'length_between_perpendiculars' => 182.00,
                'breadth' => 32.26,
                'depth' => 18.20,
                'summer_draft' => 11.20,
                'dwt' => 50801.00,
                'gt' => 32567.00,
                'lightship_weight' => 11250.00,
                'km_default' => 8.420,
                'status' => 'active',
            ],
        );

        CargoPlan::where('vessel_id', $vessel->id)->delete();
        VesselCompartment::where('vessel_id', $vessel->id)->delete();
        BallastTank::where('vessel_id', $vessel->id)->delete();

        $ironOre = CargoType::updateOrCreate(
            ['name' => 'Iron Ore'],
            [
                'category' => 'bulk',
                'density' => 2.600,
                'stowage_factor' => 0.385,
                'notes' => 'High-density bulk cargo for training scenarios.',
                'status' => 'active',
            ],
        );

        $coal = CargoType::updateOrCreate(
            ['name' => 'Coal'],
            [
                'category' => 'bulk',
                'density' => 0.850,
                'stowage_factor' => 1.176,
                'notes' => 'Medium-density bulk cargo.',
                'status' => 'active',
            ],
        );

        $grain = CargoType::updateOrCreate(
            ['name' => 'Grain'],
            [
                'category' => 'bulk',
                'density' => 0.770,
                'stowage_factor' => 1.299,
                'notes' => 'Educational grain cargo example.',
                'status' => 'active',
            ],
        );

        $holds = [
            ['Hold 1', 'H1', 5200, 6400, -72.0, 7.2, 0.0, 1],
            ['Hold 2', 'H2', 6800, 8300, -48.0, 7.1, 0.0, 2],
            ['Hold 3', 'H3', 7200, 8700, -24.0, 7.0, 0.0, 3],
            ['Hold 4', 'H4', 7600, 9100, 0.0, 6.9, 0.0, 4],
            ['Hold 5', 'H5', 7200, 8700, 24.0, 7.0, 0.0, 5],
            ['Hold 6', 'H6', 6800, 8300, 48.0, 7.1, 0.0, 6],
            ['Hold 7', 'H7', 5200, 6400, 72.0, 7.2, 0.0, 7],
        ];

        $createdHolds = [];

        foreach ($holds as [$name, $code, $tonnes, $m3, $lcg, $vcg, $tcg, $sortOrder]) {
            $createdHolds[$code] = VesselCompartment::create([
                'vessel_id' => $vessel->id,
                'name' => $name,
                'code' => $code,
                'type' => 'cargo',
                'capacity_tonnes' => $tonnes,
                'capacity_m3' => $m3,
                'lcg' => $lcg,
                'vcg' => $vcg,
                'tcg' => $tcg,
                'max_load_percent' => 100,
                'allowed_cargo_type' => 'bulk',
                'sort_order' => $sortOrder,
                'status' => 'available',
            ]);
        }

        $tanks = [
            ['Fore Peak', 'FP', 'center', 900, 900, 320, -88.0, 2.1, 0.0, 1],
            ['P/S WB 1', 'PWB1', 'port', 650, 650, 410, -62.0, 2.0, -12.5, 2],
            ['S/S WB 1', 'SWB1', 'starboard', 650, 650, 410, -62.0, 2.0, 12.5, 3],
            ['P/S WB 2', 'PWB2', 'port', 760, 760, 190, -32.0, 2.0, -12.5, 4],
            ['S/S WB 2', 'SWB2', 'starboard', 760, 760, 190, -32.0, 2.0, 12.5, 5],
            ['Centre Tank', 'CT', 'center', 1100, 1100, 770, 0.0, 1.8, 0.0, 6],
            ['P/S WB 3', 'PWB3', 'port', 760, 760, 330, 32.0, 2.0, -12.5, 7],
            ['S/S WB 3', 'SWB3', 'starboard', 760, 760, 330, 32.0, 2.0, 12.5, 8],
            ['P/S WB 4', 'PWB4', 'port', 650, 650, 280, 62.0, 2.0, -12.5, 9],
            ['S/S WB 4', 'SWB4', 'starboard', 650, 650, 280, 62.0, 2.0, 12.5, 10],
            ['Aft Peak', 'AP', 'center', 900, 900, 260, 88.0, 2.1, 0.0, 11],
        ];

        foreach ($tanks as [$name, $code, $side, $capacityTonnes, $capacityM3, $currentTonnes, $lcg, $vcg, $tcg, $sortOrder]) {
            BallastTank::create([
                'vessel_id' => $vessel->id,
                'name' => $name,
                'code' => $code,
                'side' => $side,
                'capacity_tonnes' => $capacityTonnes,
                'capacity_m3' => $capacityM3,
                'current_tonnes' => $currentTonnes,
                'lcg' => $lcg,
                'vcg' => $vcg,
                'tcg' => $tcg,
                'max_fill_percent' => 100,
                'free_surface_coefficient' => 0.015,
                'sort_order' => $sortOrder,
                'status' => 'available',
            ]);
        }

        VesselLimit::updateOrCreate(
            ['vessel_id' => $vessel->id],
            [
                'min_gm' => 0.500,
                'max_draft' => 11.200,
                'max_trim' => 2.000,
                'max_heel' => 3.000,
                'max_compartment_load_percent' => 100.00,
                'max_sf_percent' => 100.00,
                'max_bm_percent' => 100.00,
                'load_line_note' => 'Training vessel limits for educational simulation.',
            ],
        );

        $cargoPlan = CargoPlan::create([
            'vessel_id' => $vessel->id,
            'name' => 'Demo Loading Condition',
            'mode' => 'training',
            'status' => 'active',
            'notes' => 'Initial demo cargo plan used for dashboard calculations.',
        ]);

        $cargoItems = [
            ['H1', $grain, 'Grain', 3328.00],
            ['H2', $ironOre, 'Iron Ore', 6188.00],
            ['H3', $coal, 'Coal', 5112.00],
            ['H4', $ironOre, 'Iron Ore', 7600.00],
            ['H5', $grain, 'Grain', 3024.00],
            ['H6', $coal, 'Coal', 3672.00],
            ['H7', $grain, 'Grain', 1612.00],
        ];

        foreach ($cargoItems as [$holdCode, $cargoType, $cargoName, $weight]) {
            $compartment = $createdHolds[$holdCode];

            CargoPlanItem::create([
                'cargo_plan_id' => $cargoPlan->id,
                'vessel_compartment_id' => $compartment->id,
                'cargo_type_id' => $cargoType->id,
                'cargo_name' => $cargoName,
                'weight_tonnes' => $weight,
                'volume_m3' => round($weight / max((float) $cargoType->density, 0.1), 2),
                'loading_port' => 'Liepāja',
                'discharge_port' => 'Rotterdam',
                'priority' => 1,
                'status' => 'planned',
            ]);
        }
    }
}