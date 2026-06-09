@php
    $vessel = $reportData['vessel'] ?? [];
    $condition = $reportData['condition'] ?? [];
    $metrics = $reportData['metrics'] ?? [];
    $criteria = $reportData['criteria'] ?? [];
    $holdLoads = $reportData['hold_loads'] ?? [];
    $cargoItems = $reportData['cargo_items'] ?? [];
    $ballastTanks = $reportData['ballast_tanks'] ?? [];
    $workspace = $reportData['workspace'] ?? null;
    $generatedAt = $reportData['generated_at'] ?? now()->format('d.m.Y H:i');

    $fmt = fn ($value, $digits = 2) => number_format((float) ($value ?? 0), $digits, ',', ' ');

    $statusLabel = function ($status) {
        return match ($status) {
            'pass' => 'Atbilst',
            'warning' => 'Jāpārbauda',
            'fail' => 'Neatbilst',
            default => $status ?: '-',
        };
    };

    $statusClass = function ($status) {
        return match ($status) {
            'pass' => 'status-pass',
            'warning' => 'status-warning',
            'fail' => 'status-fail',
            default => 'status-default',
        };
    };

    $sideLabel = function ($side) {
        return match ($side) {
            'port' => 'Kreisais borts',
            'starboard' => 'Labais borts',
            'center' => 'Centrs',
            default => $side ?: '-',
        };
    };
@endphp

<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <title>Ship Stability Simulator pārskats</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #0f172a;
            line-height: 1.45;
            margin: 0;
            padding: 0;
        }

        .page {
            padding: 28px;
        }

        .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }

        h1 {
            font-size: 22px;
            margin: 0 0 4px 0;
            color: #0f172a;
        }

        h2 {
            font-size: 15px;
            margin: 20px 0 8px 0;
            color: #0f172a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
        }

        h3 {
            font-size: 13px;
            margin: 14px 0 8px 0;
        }

        .muted {
            color: #64748b;
        }

        .meta {
            margin-top: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 6px;
        }

        .meta p {
            margin: 3px 0;
        }

        .workspace {
            margin: 12px 0;
            padding: 10px;
            border: 1px solid #a7f3d0;
            background: #ecfdf5;
            border-radius: 6px;
            color: #065f46;
        }

        .notice {
            margin-top: 18px;
            padding: 10px;
            border: 1px solid #fde68a;
            background: #fffbeb;
            color: #92400e;
            border-radius: 6px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        th {
            background: #f1f5f9;
            color: #334155;
            font-weight: bold;
            text-align: left;
            border: 1px solid #cbd5e1;
            padding: 6px;
            font-size: 10px;
        }

        td {
            border: 1px solid #e2e8f0;
            padding: 6px;
            vertical-align: top;
        }

        .grid {
            width: 100%;
            margin-top: 8px;
        }

        .grid td {
            width: 25%;
        }

        .label {
            color: #64748b;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .value {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 2px;
        }

        .badge {
            display: inline-block;
            padding: 3px 7px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: bold;
        }

        .status-pass {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
        }

        .status-warning {
            background: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
        }

        .status-fail {
            background: #fef2f2;
            color: #b91c1c;
            border: 1px solid #fecaca;
        }

        .status-default {
            background: #f8fafc;
            color: #475569;
            border: 1px solid #cbd5e1;
        }

        .footer {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px solid #cbd5e1;
            font-size: 9px;
            color: #64748b;
        }

        .small {
            font-size: 9px;
            color: #64748b;
        }
    </style>
</head>

<body>
<div class="page">
    <div class="header">
        <h1>Ship Stability Simulator pārskats</h1>
        <p class="muted">Stabilitātes, kravas plāna un balasta stāvokļa kopsavilkums</p>

        <div class="meta">
            <p>
                <strong>Kuģis:</strong>
                {{ $vessel['name'] ?? '-' }}
                · IMO {{ $vessel['imo_number'] ?? 'nav norādīts' }}
            </p>

            <p>
                <strong>Kravas plāns:</strong>
                {{ $condition['cargo_plan_name'] ?? 'Nav aktīva kravas plāna' }}
            </p>

            <p>
                <strong>Ģenerēts:</strong>
                {{ $generatedAt }}
            </p>
        </div>

        @if (!empty($workspace))
            <div class="workspace">
                <strong>Studenta privātais risinājums</strong><br>
                Uzdevums: {{ $workspace['scenario_title'] ?? '-' }}<br>
                Students: {{ $workspace['student_name'] ?? '-' }}
                @if (!empty($workspace['student_email']))
                    ({{ $workspace['student_email'] }})
                @endif
                <br>
                Risinājuma statuss: {{ $workspace['status'] ?? '-' }}
            </div>
        @endif
    </div>

    <h2>Kuģa pamatdati</h2>

    <table class="grid">
        <tr>
            <td>
                <div class="label">Tips</div>
                <div class="value">{{ $vessel['type'] ?? '-' }}</div>
            </td>
            <td>
                <div class="label">Garums</div>
                <div class="value">{{ $fmt($vessel['length_overall'] ?? 0, 2) }} m</div>
            </td>
            <td>
                <div class="label">Platums</div>
                <div class="value">{{ $fmt($vessel['breadth'] ?? 0, 2) }} m</div>
            </td>
            <td>
                <div class="label">DWT</div>
                <div class="value">{{ $fmt($vessel['dwt'] ?? 0, 2) }} t</div>
            </td>
        </tr>
    </table>

    <h2>Stabilitātes galvenie rādītāji</h2>

    <table class="grid">
        <tr>
            <td>
                <div class="label">Displacement</div>
                <div class="value">{{ $fmt($metrics['displacement'] ?? 0, 2) }} t</div>
            </td>
            <td>
                <div class="label">Krava</div>
                <div class="value">{{ $fmt($metrics['cargo_weight'] ?? 0, 2) }} t</div>
            </td>
            <td>
                <div class="label">Balasts</div>
                <div class="value">{{ $fmt($metrics['ballast_weight'] ?? 0, 2) }} t</div>
            </td>
            <td>
                <div class="label">Lightship</div>
                <div class="value">{{ $fmt($metrics['lightship_weight'] ?? 0, 2) }} t</div>
            </td>
        </tr>

        <tr>
            <td>
                <div class="label">KG</div>
                <div class="value">{{ $fmt($metrics['kg'] ?? 0, 3) }} m</div>
            </td>
            <td>
                <div class="label">KM</div>
                <div class="value">{{ $fmt($metrics['km'] ?? 0, 3) }} m</div>
            </td>
            <td>
                <div class="label">GM</div>
                <div class="value">{{ $fmt($metrics['gm'] ?? 0, 3) }} m</div>
            </td>
            <td>
                <div class="label">FSC</div>
                <div class="value">{{ $fmt($metrics['free_surface_correction'] ?? 0, 4) }} m</div>
            </td>
        </tr>

        <tr>
            <td>
                <div class="label">Trim</div>
                <div class="value">{{ $fmt($metrics['trim'] ?? 0, 3) }} m</div>
                <div class="small">{{ $metrics['trim_direction'] ?? '-' }}</div>
            </td>
            <td>
                <div class="label">Heel</div>
                <div class="value">{{ $fmt($metrics['heel'] ?? 0, 3) }}°</div>
            </td>
            <td>
                <div class="label">Priekšgala iegrime</div>
                <div class="value">{{ $fmt($metrics['fore_draft'] ?? 0, 2) }} m</div>
            </td>
            <td>
                <div class="label">Pakaļgala iegrime</div>
                <div class="value">{{ $fmt($metrics['aft_draft'] ?? 0, 2) }} m</div>
            </td>
        </tr>

        <tr>
            <td>
                <div class="label">LCG</div>
                <div class="value">{{ $fmt($metrics['lcg'] ?? 0, 3) }} m</div>
            </td>
            <td>
                <div class="label">TCG</div>
                <div class="value">{{ $fmt($metrics['tcg'] ?? 0, 3) }} m</div>
            </td>
            <td>
                <div class="label">Max GZ</div>
                <div class="value">{{ $fmt($metrics['max_gz'] ?? 0, 3) }} m</div>
            </td>
            <td>
                <div class="label">Leņķis pie Max GZ</div>
                <div class="value">{{ $fmt($metrics['angle_at_max_gz'] ?? 0, 0) }}°</div>
            </td>
        </tr>
    </table>

    <h2>Kritēriju pārbaude</h2>

    <table>
        <thead>
        <tr>
            <th>Kritērijs</th>
            <th>Prasība</th>
            <th>Faktiski</th>
            <th>Statuss</th>
            <th>Komentārs</th>
        </tr>
        </thead>

        <tbody>
        @forelse ($criteria as $criterion)
            @php
                $status = $criterion['status'] ?? 'default';
            @endphp
            <tr>
                <td>{{ $criterion['name'] ?? '-' }}</td>
                <td>{{ $criterion['requirement'] ?? '-' }}</td>
                <td>{{ $criterion['actual'] ?? '-' }}</td>
                <td>
                    <span class="badge {{ $statusClass($status) }}">
                        {{ $statusLabel($status) }}
                    </span>
                </td>
                <td>{{ $criterion['comment'] ?? '-' }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="5">Nav kritēriju datu.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

    <h2>Kravas plāna rindas</h2>

    <table>
        <thead>
        <tr>
            <th>Tilpne</th>
            <th>Krava</th>
            <th>Tips</th>
            <th>Svars</th>
            <th>Tilpums</th>
            <th>Iekraušana</th>
            <th>Izkraušana</th>
        </tr>
        </thead>

        <tbody>
        @forelse ($cargoItems as $item)
            <tr>
                <td>{{ $item['compartment_code'] ?? '-' }} · {{ $item['compartment'] ?? '-' }}</td>
                <td>{{ $item['cargo_name'] ?? '-' }}</td>
                <td>{{ $item['cargo_type'] ?? '-' }}</td>
                <td>{{ $fmt($item['weight_tonnes'] ?? 0, 2) }} t</td>
                <td>{{ $fmt($item['volume_m3'] ?? 0, 2) }} m³</td>
                <td>{{ $item['loading_port'] ?? '-' }}</td>
                <td>{{ $item['discharge_port'] ?? '-' }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="7">Nav kravas plāna rindu.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

    <h2>Balasta tanki</h2>

    <table>
        <thead>
        <tr>
            <th>Tanks</th>
            <th>Borts</th>
            <th>Daudzums</th>
            <th>Kapacitāte</th>
            <th>Aizpildījums</th>
            <th>Risks</th>
        </tr>
        </thead>

        <tbody>
        @forelse ($ballastTanks as $tank)
            <tr>
                <td>{{ $tank['code'] ?? '-' }} · {{ $tank['name'] ?? '-' }}</td>
                <td>{{ $sideLabel($tank['side'] ?? null) }}</td>
                <td>{{ $fmt($tank['current_tonnes'] ?? 0, 2) }} t</td>
                <td>{{ $fmt($tank['capacity_tonnes'] ?? 0, 2) }} t</td>
                <td>{{ $fmt($tank['fill_percent'] ?? 0, 1) }}%</td>
                <td>
                    @if (!empty($tank['free_surface_risk']))
                        <span class="badge status-warning">Brīvās virsmas risks</span>
                    @else
                        <span class="badge status-pass">Nav būtiska riska</span>
                    @endif
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="6">Nav balasta tanku datu.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

    <h2>Tilpņu noslodze</h2>

    <table>
        <thead>
        <tr>
            <th>Tilpne</th>
            <th>Svars</th>
            <th>Kapacitāte</th>
            <th>Noslodze</th>
            <th>LCG</th>
        </tr>
        </thead>

        <tbody>
        @forelse ($holdLoads as $hold)
            <tr>
                <td>{{ $hold['code'] ?? '-' }} · {{ $hold['name'] ?? '-' }}</td>
                <td>{{ $fmt($hold['weight_tonnes'] ?? 0, 2) }} t</td>
                <td>{{ $fmt($hold['capacity_tonnes'] ?? 0, 2) }} t</td>
                <td>{{ $fmt($hold['load_percent'] ?? 0, 1) }}%</td>
                <td>{{ $fmt($hold['lcg'] ?? 0, 2) }} m</td>
            </tr>
        @empty
            <tr>
                <td colspan="5">Nav tilpņu noslodzes datu.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

    <div class="notice">
        <strong>Piezīme:</strong>
        šis PDF ir ģenerēts mācību simulatora vajadzībām. Aprēķini paredzēti
        studentu darba pārbaudei un simulācijas analīzei, nevis reālai kuģa
        ekspluatācijas dokumentācijai.
    </div>

    <div class="footer">
        Ship Stability Simulator · ģenerēts {{ $generatedAt }}
    </div>
</div>
</body>
</html>