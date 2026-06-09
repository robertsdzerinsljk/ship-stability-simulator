<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <title>Ship Stability Report</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #111827;
            margin: 28px;
        }

        h1, h2, h3 {
            margin: 0;
            color: #0f172a;
        }

        h1 {
            font-size: 22px;
            margin-bottom: 6px;
        }

        h2 {
            font-size: 15px;
            margin-top: 22px;
            margin-bottom: 8px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
        }

        p {
            margin: 0;
        }

        .muted {
            color: #64748b;
        }

        .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }

        .meta {
            margin-top: 8px;
            color: #475569;
        }

        .grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        .grid td {
            width: 25%;
            border: 1px solid #cbd5e1;
            padding: 8px;
            vertical-align: top;
        }

        .label {
            color: #64748b;
            font-size: 10px;
            margin-bottom: 3px;
        }

        .value {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        th {
            background: #f1f5f9;
            color: #334155;
            font-size: 10px;
            text-align: left;
            padding: 6px;
            border: 1px solid #cbd5e1;
        }

        td {
            padding: 6px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }

        .status-pass {
            color: #047857;
            font-weight: bold;
        }

        .status-warning {
            color: #b45309;
            font-weight: bold;
        }

        .status-fail {
            color: #b91c1c;
            font-weight: bold;
        }

        .note {
            margin-top: 16px;
            padding: 10px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            color: #475569;
            line-height: 1.5;
        }

        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ship Stability Simulator pārskats</h1>
        <p class="muted">Stabilitātes, kravas plāna un balasta stāvokļa kopsavilkums</p>

        <div class="meta">
            <p><strong>Kuģis:</strong> {{ $vessel->name }} · IMO {{ $vessel->imo_number ?? 'nav norādīts' }}</p>
            <p><strong>Kravas plāns:</strong> {{ $cargoPlan?->name ?? 'Nav aktīva kravas plāna' }}</p>
            <p><strong>Ģenerēts:</strong> {{ $generatedAt }}</p>
        </div>
    </div>

    <h2>Kuģa pamatdati</h2>

    <table class="grid">
        <tr>
            <td>
                <div class="label">Tips</div>
                <div class="value">{{ $vessel->type ?? '-' }}</div>
            </td>
            <td>
                <div class="label">DWT</div>
                <div class="value">{{ number_format((float) $vessel->dwt, 2, ',', ' ') }} t</div>
            </td>
            <td>
                <div class="label">Garums</div>
                <div class="value">{{ number_format((float) $vessel->length_overall, 2, ',', ' ') }} m</div>
            </td>
            <td>
                <div class="label">Platums</div>
                <div class="value">{{ number_format((float) $vessel->breadth, 2, ',', ' ') }} m</div>
            </td>
        </tr>
    </table>

    <h2>Galvenie stabilitātes rādītāji</h2>

    <table class="grid">
        <tr>
            <td>
                <div class="label">Displacement</div>
                <div class="value">{{ number_format($analysis['metrics']['displacement'], 2, ',', ' ') }} t</div>
            </td>
            <td>
                <div class="label">GM</div>
                <div class="value">{{ number_format($analysis['metrics']['gm'], 3, ',', ' ') }} m</div>
            </td>
            <td>
                <div class="label">KG</div>
                <div class="value">{{ number_format($analysis['metrics']['kg'], 3, ',', ' ') }} m</div>
            </td>
            <td>
                <div class="label">KM</div>
                <div class="value">{{ number_format($analysis['metrics']['km'], 3, ',', ' ') }} m</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Trims</div>
                <div class="value">{{ number_format(abs($analysis['metrics']['trim']), 3, ',', ' ') }} m</div>
            </td>
            <td>
                <div class="label">Trima virziens</div>
                <div class="value">{{ $analysis['metrics']['trim_direction'] }}</div>
            </td>
            <td>
                <div class="label">Sasvērums</div>
                <div class="value">{{ number_format($analysis['metrics']['heel'], 3, ',', ' ') }}°</div>
            </td>
            <td>
                <div class="label">Brīvās virsmas korekcija</div>
                <div class="value">{{ number_format($analysis['metrics']['free_surface_correction'], 4, ',', ' ') }} m</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Priekšgala iegrime</div>
                <div class="value">{{ number_format($analysis['metrics']['fore_draft'], 2, ',', ' ') }} m</div>
            </td>
            <td>
                <div class="label">Pakaļgala iegrime</div>
                <div class="value">{{ number_format($analysis['metrics']['aft_draft'], 2, ',', ' ') }} m</div>
            </td>
            <td>
                <div class="label">Maksimālais GZ</div>
                <div class="value">{{ number_format($analysis['metrics']['max_gz'], 3, ',', ' ') }} m</div>
            </td>
            <td>
                <div class="label">Leņķis pie maks. GZ</div>
                <div class="value">{{ $analysis['metrics']['angle_at_max_gz'] }}°</div>
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
            @foreach ($analysis['criteria'] as $criterion)
                <tr>
                    <td>{{ $criterion['name'] }}</td>
                    <td>{{ $criterion['requirement'] }}</td>
                    <td>{{ $criterion['actual'] }}</td>
                    <td class="status-{{ $criterion['status'] }}">
                        @if ($criterion['status'] === 'pass')
                            Atbilst
                        @elseif ($criterion['status'] === 'warning')
                            Jāpārbauda
                        @else
                            Neatbilst
                        @endif
                    </td>
                    <td>{{ $criterion['comment'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="page-break"></div>

    <h2>Kravas plāns</h2>

    <table>
        <thead>
            <tr>
                <th>Tilpne</th>
                <th>Krava</th>
                <th>Tips</th>
                <th>Svars</th>
                <th>Tilpums</th>
                <th>Noslodze</th>
                <th>Iekraušana</th>
                <th>Izkraušana</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($cargoRows as $row)
                <tr>
                    <td>{{ $row['hold'] }} · {{ $row['name'] }}</td>
                    <td>{{ $row['cargo_name'] }}</td>
                    <td>{{ $row['cargo_type'] }}</td>
                    <td>{{ number_format($row['weight_tonnes'], 2, ',', ' ') }} t</td>
                    <td>{{ number_format($row['volume_m3'], 2, ',', ' ') }} m³</td>
                    <td>{{ number_format($row['load_percent'], 1, ',', ' ') }}%</td>
                    <td>{{ $row['loading_port'] }}</td>
                    <td>{{ $row['discharge_port'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Balasta tanki</h2>

    <table>
        <thead>
            <tr>
                <th>Tanks</th>
                <th>Nosaukums</th>
                <th>Borts</th>
                <th>Daudzums</th>
                <th>Kapacitāte</th>
                <th>Aizpildījums</th>
                <th>Brīvā virsma</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($ballastRows as $row)
                <tr>
                    <td>{{ $row['code'] }}</td>
                    <td>{{ $row['name'] }}</td>
                    <td>{{ $row['side'] }}</td>
                    <td>{{ number_format($row['current_tonnes'], 2, ',', ' ') }} t</td>
                    <td>{{ number_format($row['capacity_tonnes'], 2, ',', ' ') }} t</td>
                    <td>{{ number_format($row['fill_percent'], 1, ',', ' ') }}%</td>
                    <td>{{ $row['free_surface_risk'] ? 'Risks' : 'Nav būtiska riska' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="note">
        <strong>Piezīme:</strong>
        Šis pārskats ir ģenerēts mācību simulatora vajadzībām. Aprēķini izmanto vienkāršotu modeli un nav paredzēti kuģa reālai ekspluatācijai vai sertificētai stabilitātes pārbaudei.
    </div>
</body>
</html>