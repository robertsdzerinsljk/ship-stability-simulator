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

class RealVesselSeeder extends Seeder
{
    public function run(): void
    {
        Vessel::query()
            ->where('name', 'MV Ocean Pioneer')
            ->update(['status' => 'archived']);

        $containerCargo = CargoType::updateOrCreate(
            ['name' => 'Containerized Cargo'],
            [
                'category' => 'container',
                'density' => 0.450,
                'stowage_factor' => 2.220,
                'notes' => 'Educational average density for mixed containerized cargo.',
                'status' => 'active',
            ],
        );

        $ironOre = CargoType::updateOrCreate(
            ['name' => 'Iron Ore'],
            [
                'category' => 'bulk',
                'density' => 2.600,
                'stowage_factor' => 0.385,
                'notes' => 'High-density ore cargo for bulk carrier training.',
                'status' => 'active',
            ],
        );

        $crudeOil = CargoType::updateOrCreate(
            ['name' => 'Crude Oil'],
            [
                'category' => 'liquid_bulk',
                'density' => 0.850,
                'stowage_factor' => 1.176,
                'notes' => 'Educational average density for crude oil cargo.',
                'status' => 'active',
            ],
        );

        $roRoCargo = CargoType::updateOrCreate(
            ['name' => 'Ro-Ro Units'],
            [
                'category' => 'ro_ro',
                'density' => 0.220,
                'stowage_factor' => 4.545,
                'notes' => 'Educational simplified cargo type for vehicles and trailers.',
                'status' => 'active',
            ],
        );

        $this->seedEverGiven($containerCargo);
        $this->seedGeostahl($ironOre);
        $this->seedSaEurope($crudeOil);
        $this->seedBalticQueen($roRoCargo);
    }

    private function seedEverGiven(CargoType $cargoType): void
    {
        $vessel = $this->upsertVessel([
            'name' => 'EVER GIVEN',
            'imo_number' => '9811000',
            'mmsi' => '353136000',
            'type' => 'Container Ship',
            'flag' => 'Panama',
            'class' => 'ABS',
            'operator' => 'Evergreen / training data',
            'built_year' => 2018,
            'length_overall' => 399.94,
            'length_between_perpendiculars' => 384.00,
            'breadth' => 58.80,
            'depth' => 32.90,
            'summer_draft' => 16.00,
            'dwt' => 199489.00,
            'gt' => 219079.00,
            'lightship_weight' => 70000.00,
            'km_default' => 18.500,
            'status' => 'active',
            'is_real_vessel' => true,
            'data_source_name' => 'VesselFinder / Port of Hamburg public particulars',
            'data_source_url' => 'https://www.vesselfinder.com/vessels/details/9811000 | https://www.hafen-hamburg.de/en/vessels/ever-given-48016/',
            'data_confidence' => 'public_particulars_with_training_approximations',
            'data_notes' => 'Public particulars used for IMO, type, LOA, beam, DWT, GT and year. Some sources differ slightly for GT/DWT/draft.',
            'hydrostatic_notes' => 'KM, lightship weight, compartments and ballast tanks are educational approximations, not certified hydrostatic data.',
        ]);

        $holds = [
            ['Bay Group 01', 'BG01', 15000, 42000, -168, 15.5, 0, 1],
            ['Bay Group 02', 'BG02', 17000, 46000, -126, 15.2, 0, 2],
            ['Bay Group 03', 'BG03', 18500, 50000, -84, 15.0, 0, 3],
            ['Bay Group 04', 'BG04', 20000, 53000, -42, 14.8, 0, 4],
            ['Bay Group 05', 'BG05', 21000, 56000, 0, 14.8, 0, 5],
            ['Bay Group 06', 'BG06', 20000, 53000, 42, 14.8, 0, 6],
            ['Bay Group 07', 'BG07', 18500, 50000, 84, 15.0, 0, 7],
            ['Bay Group 08', 'BG08', 17000, 46000, 126, 15.2, 0, 8],
            ['Bay Group 09', 'BG09', 15000, 42000, 168, 15.5, 0, 9],
        ];

        $tanks = [
            ['Fore Peak', 'FP', 'center', 6500, 6500, 1800, -184, 3.2, 0, 1],
            ['P DB 1', 'PDB1', 'port', 4200, 4200, 1900, -128, 2.4, -22, 2],
            ['S DB 1', 'SDB1', 'starboard', 4200, 4200, 1900, -128, 2.4, 22, 3],
            ['P DB 2', 'PDB2', 'port', 5000, 5000, 2300, -64, 2.3, -22, 4],
            ['S DB 2', 'SDB2', 'starboard', 5000, 5000, 2300, -64, 2.3, 22, 5],
            ['P DB 3', 'PDB3', 'port', 5000, 5000, 2300, 64, 2.3, -22, 6],
            ['S DB 3', 'SDB3', 'starboard', 5000, 5000, 2300, 64, 2.3, 22, 7],
            ['P DB 4', 'PDB4', 'port', 4200, 4200, 1900, 128, 2.4, -22, 8],
            ['S DB 4', 'SDB4', 'starboard', 4200, 4200, 1900, 128, 2.4, 22, 9],
            ['Aft Peak', 'AP', 'center', 6500, 6500, 2000, 184, 3.2, 0, 10],
        ];

        $cargo = [
            ['BG01', $cargoType, 'Containerized Cargo', 9800],
            ['BG02', $cargoType, 'Containerized Cargo', 12500],
            ['BG03', $cargoType, 'Containerized Cargo', 14100],
            ['BG04', $cargoType, 'Containerized Cargo', 15800],
            ['BG05', $cargoType, 'Containerized Cargo', 16600],
            ['BG06', $cargoType, 'Containerized Cargo', 15100],
            ['BG07', $cargoType, 'Containerized Cargo', 13500],
            ['BG08', $cargoType, 'Containerized Cargo', 11900],
            ['BG09', $cargoType, 'Containerized Cargo', 9200],
        ];

        $this->resetVesselOperationalData($vessel, $holds, $tanks, $cargo, 'Ever Given Training Loading Condition');

        $this->upsertLimits($vessel, [
            'min_gm' => 0.700,
            'max_draft' => 16.000,
            'max_trim' => 2.500,
            'max_heel' => 3.000,
            'load_line_note' => 'Public dimensions with educational training limits.',
        ]);
    }

    private function seedGeostahl(CargoType $cargoType): void
    {
        $vessel = $this->upsertVessel([
            'name' => 'GEOSTAHL / ex BERGE STAHL',
            'imo_number' => '8420804',
            'mmsi' => '235089333',
            'type' => 'Bulk Carrier / Ore Carrier',
            'flag' => 'Comoros',
            'class' => 'Training reference',
            'operator' => 'Historical public vessel data',
            'built_year' => 1986,
            'length_overall' => 342.08,
            'length_between_perpendiculars' => 330.00,
            'breadth' => 63.53,
            'depth' => 30.00,
            'summer_draft' => 23.00,
            'dwt' => 364767.00,
            'gt' => 175720.00,
            'lightship_weight' => 61000.00,
            'km_default' => 21.000,
            'status' => 'active',
            'is_real_vessel' => true,
            'data_source_name' => 'Shipspotting / Shipnext public particulars',
            'data_source_url' => 'https://www.shipspotting.com/photos/3515441 | https://shipnext.com/vessel/8420804-berge-stahl',
            'data_confidence' => 'public_particulars_with_training_approximations',
            'data_notes' => 'Public particulars used for IMO, type, LOA, beam, DWT, GT and draft. Vessel was formerly known as Berge Stahl.',
            'hydrostatic_notes' => 'Hold layout, KM and lightship weight are simplified educational values.',
        ]);

        $holds = [
            ['Hold 1', 'H1', 33000, 13500, -135, 11.8, 0, 1],
            ['Hold 2', 'H2', 38000, 15000, -100, 11.5, 0, 2],
            ['Hold 3', 'H3', 41000, 16000, -66, 11.3, 0, 3],
            ['Hold 4', 'H4', 43000, 16500, -33, 11.2, 0, 4],
            ['Hold 5', 'H5', 45000, 17000, 0, 11.1, 0, 5],
            ['Hold 6', 'H6', 43000, 16500, 33, 11.2, 0, 6],
            ['Hold 7', 'H7', 41000, 16000, 66, 11.3, 0, 7],
            ['Hold 8', 'H8', 38000, 15000, 100, 11.5, 0, 8],
            ['Hold 9', 'H9', 33000, 13500, 135, 11.8, 0, 9],
        ];

        $tanks = [
            ['Fore Peak', 'FP', 'center', 9000, 9000, 4200, -156, 3.0, 0, 1],
            ['P WB 1', 'PWB1', 'port', 8000, 8000, 3600, -105, 2.6, -24, 2],
            ['S WB 1', 'SWB1', 'starboard', 8000, 8000, 3600, -105, 2.6, 24, 3],
            ['P WB 2', 'PWB2', 'port', 9500, 9500, 4300, -48, 2.5, -24, 4],
            ['S WB 2', 'SWB2', 'starboard', 9500, 9500, 4300, -48, 2.5, 24, 5],
            ['P WB 3', 'PWB3', 'port', 9500, 9500, 4300, 48, 2.5, -24, 6],
            ['S WB 3', 'SWB3', 'starboard', 9500, 9500, 4300, 48, 2.5, 24, 7],
            ['P WB 4', 'PWB4', 'port', 8000, 8000, 3600, 105, 2.6, -24, 8],
            ['S WB 4', 'SWB4', 'starboard', 8000, 8000, 3600, 105, 2.6, 24, 9],
            ['Aft Peak', 'AP', 'center', 9000, 9000, 4200, 156, 3.0, 0, 10],
        ];

        $cargo = [
            ['H1', $cargoType, 'Iron Ore', 26000],
            ['H2', $cargoType, 'Iron Ore', 33500],
            ['H3', $cargoType, 'Iron Ore', 37200],
            ['H4', $cargoType, 'Iron Ore', 40500],
            ['H5', $cargoType, 'Iron Ore', 43000],
            ['H6', $cargoType, 'Iron Ore', 40500],
            ['H7', $cargoType, 'Iron Ore', 37200],
            ['H8', $cargoType, 'Iron Ore', 33500],
            ['H9', $cargoType, 'Iron Ore', 26000],
        ];

        $this->resetVesselOperationalData($vessel, $holds, $tanks, $cargo, 'Ore Carrier Training Loading Condition');

        $this->upsertLimits($vessel, [
            'min_gm' => 0.800,
            'max_draft' => 23.000,
            'max_trim' => 2.800,
            'max_heel' => 3.000,
            'load_line_note' => 'Public particulars with educational bulk carrier stability limits.',
        ]);
    }

    private function seedSaEurope(CargoType $cargoType): void
    {
        $vessel = $this->upsertVessel([
            'name' => 'SA EUROPE / ex TI EUROPE',
            'imo_number' => '9235268',
            'mmsi' => '311001699',
            'type' => 'Crude Oil Tanker / FSO',
            'flag' => 'Bahamas',
            'class' => 'LR / training reference',
            'operator' => 'Public tanker data',
            'built_year' => 2002,
            'length_overall' => 380.00,
            'length_between_perpendiculars' => 366.00,
            'breadth' => 68.00,
            'depth' => 34.00,
            'summer_draft' => 24.53,
            'dwt' => 441561.00,
            'gt' => 234006.00,
            'lightship_weight' => 67923.00,
            'km_default' => 24.000,
            'status' => 'active',
            'is_real_vessel' => true,
            'data_source_name' => 'VesselFinder / Maritime Optima / Shipspotting public particulars',
            'data_source_url' => 'https://www.vesselfinder.com/vessels/details/9235268 | https://maritimeoptima.com/public/vessels/pages/imo%3A9235268/mmsi%3A311001699/SA_EUROPE.html | https://www.shipspotting.com/photos/830379',
            'data_confidence' => 'public_particulars_with_training_approximations',
            'data_notes' => 'Public particulars used for IMO, type, LOA, beam, DWT, GT, summer draft and year. Former TI Europe.',
            'hydrostatic_notes' => 'Cargo tank layout and training stability parameters are simplified for education.',
        ]);

        $holds = [
            ['Cargo Tank P1', 'P1', 35000, 41000, -150, 10.8, -24, 1],
            ['Cargo Tank S1', 'S1', 35000, 41000, -150, 10.8, 24, 2],
            ['Cargo Tank P2', 'P2', 37000, 43500, -90, 10.6, -24, 3],
            ['Cargo Tank S2', 'S2', 37000, 43500, -90, 10.6, 24, 4],
            ['Cargo Tank P3', 'P3', 39000, 45800, -30, 10.4, -24, 5],
            ['Cargo Tank S3', 'S3', 39000, 45800, -30, 10.4, 24, 6],
            ['Cargo Tank P4', 'P4', 39000, 45800, 30, 10.4, -24, 7],
            ['Cargo Tank S4', 'S4', 39000, 45800, 30, 10.4, 24, 8],
            ['Cargo Tank P5', 'P5', 37000, 43500, 90, 10.6, -24, 9],
            ['Cargo Tank S5', 'S5', 37000, 43500, 90, 10.6, 24, 10],
            ['Cargo Tank P6', 'P6', 35000, 41000, 150, 10.8, -24, 11],
            ['Cargo Tank S6', 'S6', 35000, 41000, 150, 10.8, 24, 12],
        ];

        $tanks = [
            ['Fore Peak', 'FP', 'center', 12000, 12000, 7000, -178, 3.0, 0, 1],
            ['Segregated Ballast P1', 'SBP1', 'port', 18000, 18000, 8500, -120, 2.8, -27, 2],
            ['Segregated Ballast S1', 'SBS1', 'starboard', 18000, 18000, 8500, -120, 2.8, 27, 3],
            ['Segregated Ballast P2', 'SBP2', 'port', 20000, 20000, 9500, -40, 2.6, -27, 4],
            ['Segregated Ballast S2', 'SBS2', 'starboard', 20000, 20000, 9500, -40, 2.6, 27, 5],
            ['Segregated Ballast P3', 'SBP3', 'port', 20000, 20000, 9500, 40, 2.6, -27, 6],
            ['Segregated Ballast S3', 'SBS3', 'starboard', 20000, 20000, 9500, 40, 2.6, 27, 7],
            ['Segregated Ballast P4', 'SBP4', 'port', 18000, 18000, 8500, 120, 2.8, -27, 8],
            ['Segregated Ballast S4', 'SBS4', 'starboard', 18000, 18000, 8500, 120, 2.8, 27, 9],
            ['Aft Peak', 'AP', 'center', 12000, 12000, 7000, 178, 3.0, 0, 10],
        ];

        $cargo = [
            ['P1', $cargoType, 'Crude Oil', 26000],
            ['S1', $cargoType, 'Crude Oil', 26000],
            ['P2', $cargoType, 'Crude Oil', 30000],
            ['S2', $cargoType, 'Crude Oil', 30000],
            ['P3', $cargoType, 'Crude Oil', 33500],
            ['S3', $cargoType, 'Crude Oil', 33500],
            ['P4', $cargoType, 'Crude Oil', 33500],
            ['S4', $cargoType, 'Crude Oil', 33500],
            ['P5', $cargoType, 'Crude Oil', 30000],
            ['S5', $cargoType, 'Crude Oil', 30000],
            ['P6', $cargoType, 'Crude Oil', 26000],
            ['S6', $cargoType, 'Crude Oil', 26000],
        ];

        $this->resetVesselOperationalData($vessel, $holds, $tanks, $cargo, 'Tanker Training Loading Condition');

        $this->upsertLimits($vessel, [
            'min_gm' => 1.000,
            'max_draft' => 24.530,
            'max_trim' => 3.000,
            'max_heel' => 3.000,
            'load_line_note' => 'Public particulars with educational tanker stability limits.',
        ]);
    }

    private function seedBalticQueen(CargoType $cargoType): void
    {
        $vessel = $this->upsertVessel([
            'name' => 'BALTIC QUEEN',
            'imo_number' => '9443255',
            'mmsi' => '276779000',
            'type' => 'Ro-Ro/Passenger Ship',
            'flag' => 'Estonia',
            'class' => '1A Super / training reference',
            'operator' => 'Tallink / public ferry data',
            'built_year' => 2009,
            'length_overall' => 212.10,
            'length_between_perpendiculars' => 195.00,
            'breadth' => 29.00,
            'depth' => 15.00,
            'summer_draft' => 6.40,
            'dwt' => 6287.00,
            'gt' => 48915.00,
            'lightship_weight' => 24000.00,
            'km_default' => 13.800,
            'status' => 'active',
            'is_real_vessel' => true,
            'data_source_name' => 'VesselFinder / Shipspotting public particulars',
            'data_source_url' => 'https://www.vesselfinder.com/vessels/details/9443255 | https://www.shipspotting.com/photos/3563026?imo=9443255',
            'data_confidence' => 'public_particulars_with_training_approximations',
            'data_notes' => 'Public particulars used for IMO, type, LOA, beam, DWT, GT, draft and year.',
            'hydrostatic_notes' => 'Ro-Ro decks, lightship weight and KM are simplified for training. Real ferry stability data is not represented.',
        ]);

        $holds = [
            ['Lower Vehicle Deck', 'LVD', 1300, 5900, -45, 6.8, 0, 1],
            ['Main Vehicle Deck Forward', 'MVDF', 1200, 5450, -20, 9.8, 0, 2],
            ['Main Vehicle Deck Aft', 'MVDA', 1200, 5450, 20, 9.8, 0, 3],
            ['Upper Vehicle Deck', 'UVD', 900, 4090, 0, 12.5, 0, 4],
            ['Service / Stores', 'STR', 700, 3180, 55, 8.2, 0, 5],
        ];

        $tanks = [
            ['Fore Peak', 'FP', 'center', 450, 450, 180, -92, 1.8, 0, 1],
            ['P WB 1', 'PWB1', 'port', 360, 360, 160, -48, 1.6, -10, 2],
            ['S WB 1', 'SWB1', 'starboard', 360, 360, 160, -48, 1.6, 10, 3],
            ['P WB 2', 'PWB2', 'port', 420, 420, 180, 0, 1.5, -10, 4],
            ['S WB 2', 'SWB2', 'starboard', 420, 420, 180, 0, 1.5, 10, 5],
            ['P WB 3', 'PWB3', 'port', 360, 360, 160, 48, 1.6, -10, 6],
            ['S WB 3', 'SWB3', 'starboard', 360, 360, 160, 48, 1.6, 10, 7],
            ['Aft Peak', 'AP', 'center', 450, 450, 180, 92, 1.8, 0, 8],
        ];

        $cargo = [
            ['LVD', $cargoType, 'Vehicles and trailers', 760],
            ['MVDF', $cargoType, 'Vehicles and trailers', 680],
            ['MVDA', $cargoType, 'Vehicles and trailers', 720],
            ['UVD', $cargoType, 'Vehicles and trailers', 420],
            ['STR', $cargoType, 'Stores and service load', 260],
        ];

        $this->resetVesselOperationalData($vessel, $holds, $tanks, $cargo, 'Ro-Ro Passenger Training Loading Condition');

        $this->upsertLimits($vessel, [
            'min_gm' => 0.900,
            'max_draft' => 6.400,
            'max_trim' => 1.200,
            'max_heel' => 2.000,
            'load_line_note' => 'Public ferry particulars with stricter educational passenger vessel limits.',
        ]);
    }

    private function upsertVessel(array $data): Vessel
    {
        return Vessel::updateOrCreate(
            ['imo_number' => $data['imo_number']],
            $data,
        );
    }

    private function resetVesselOperationalData(
        Vessel $vessel,
        array $holds,
        array $tanks,
        array $cargoRows,
        string $cargoPlanName,
    ): void {
        CargoPlan::query()
            ->where('vessel_id', $vessel->id)
            ->delete();

        VesselCompartment::query()
            ->where('vessel_id', $vessel->id)
            ->delete();

        BallastTank::query()
            ->where('vessel_id', $vessel->id)
            ->delete();

        $createdHolds = [];

        foreach ($holds as [$name, $code, $capacityTonnes, $capacityM3, $lcg, $vcg, $tcg, $sortOrder]) {
            $createdHolds[$code] = VesselCompartment::create([
                'vessel_id' => $vessel->id,
                'name' => $name,
                'code' => $code,
                'type' => 'cargo',
                'capacity_tonnes' => $capacityTonnes,
                'capacity_m3' => $capacityM3,
                'lcg' => $lcg,
                'vcg' => $vcg,
                'tcg' => $tcg,
                'max_load_percent' => 100,
                'allowed_cargo_type' => 'training',
                'sort_order' => $sortOrder,
                'status' => 'available',
            ]);
        }

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

        $cargoPlan = CargoPlan::create([
            'vessel_id' => $vessel->id,
            'name' => $cargoPlanName,
            'mode' => 'training',
            'status' => 'active',
            'notes' => 'Training cargo plan based on public vessel particulars and educational loading assumptions.',
        ]);

        foreach ($cargoRows as [$holdCode, $cargoType, $cargoName, $weight]) {
            $compartment = $createdHolds[$holdCode] ?? null;

            if (! $compartment) {
                continue;
            }

            $density = max((float) ($cargoType->density ?? 1), 0.1);

            CargoPlanItem::create([
                'cargo_plan_id' => $cargoPlan->id,
                'vessel_compartment_id' => $compartment->id,
                'cargo_type_id' => $cargoType->id,
                'cargo_name' => $cargoName,
                'weight_tonnes' => $weight,
                'volume_m3' => round($weight / $density, 2),
                'loading_port' => 'Training Port A',
                'discharge_port' => 'Training Port B',
                'priority' => 1,
                'status' => 'planned',
            ]);
        }
    }

    private function upsertLimits(Vessel $vessel, array $limits): void
    {
        VesselLimit::updateOrCreate(
            ['vessel_id' => $vessel->id],
            [
                'min_gm' => $limits['min_gm'],
                'max_draft' => $limits['max_draft'],
                'max_trim' => $limits['max_trim'],
                'max_heel' => $limits['max_heel'],
                'max_compartment_load_percent' => 100.00,
                'max_sf_percent' => 100.00,
                'max_bm_percent' => 100.00,
                'load_line_note' => $limits['load_line_note'],
            ],
        );
    }
}