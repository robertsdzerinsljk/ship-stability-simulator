<?php

namespace Database\Seeders;

use App\Models\BallastTank;
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

        VesselCompartment::where('vessel_id', $vessel->id)->delete();

        $holds = [
            ['Hold 1', 'H1', 5200, 6400, -72.0, 7.2, 0.0, 1],
            ['Hold 2', 'H2', 6800, 8300, -48.0, 7.1, 0.0, 2],
            ['Hold 3', 'H3', 7200, 8700, -24.0, 7.0, 0.0, 3],
            ['Hold 4', 'H4', 7600, 9100, 0.0, 6.9, 0.0, 4],
            ['Hold 5', 'H5', 7200, 8700, 24.0, 7.0, 0.0, 5],
            ['Hold 6', 'H6', 6800, 8300, 48.0, 7.1, 0.0, 6],
            ['Hold 7', 'H7', 5200, 6400, 72.0, 7.2, 0.0, 7],
        ];

        foreach ($holds as [$name, $code, $tonnes, $m3, $lcg, $vcg, $tcg, $sortOrder]) {
            VesselCompartment::create([
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

        BallastTank::where('vessel_id', $vessel->id)->delete();

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
    }
}