<?php

namespace App\Http\Controllers;

use App\Domain\Stability\Services\StabilityAnalysisService;
use App\Support\ActiveAssignmentSolution;
use App\Support\ActiveVessel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ReportController extends Controller
{
    public function index(Request $request, StabilityAnalysisService $analysisService): Response
    {
        return Inertia::render('Reports/Index', [
            'reportData' => $this->buildReportData($request, $analysisService),
        ]);
    }

    public function downloadStabilitySummary(
        Request $request,
        StabilityAnalysisService $analysisService,
    ): SymfonyResponse {
        $reportData = $this->buildReportData($request, $analysisService);

        $pdf = Pdf::loadView('reports.stability-summary', [
            'reportData' => $reportData,
        ])->setPaper('a4');

        $vesselName = str($reportData['vessel']['name'] ?? 'vessel')
            ->lower()
            ->replace([' ', '/', '\\'], '-')
            ->toString();

        $prefix = $reportData['workspace']
            ? 'student-solution'
            : 'stability-summary';

        return $pdf->download($prefix . '-' . $vesselName . '.pdf');
    }

    public function downloadStabilitySummaryCsv(
        Request $request,
        StabilityAnalysisService $analysisService,
    ): SymfonyResponse {
        $reportData = $this->buildReportData($request, $analysisService);
        $filename = $this->reportFilename($reportData, 'csv');

        return response()->streamDownload(function () use ($reportData) {
            $handle = fopen('php://output', 'w');

            foreach ($this->spreadsheetRows($reportData) as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function downloadStabilitySummaryXlsx(
        Request $request,
        StabilityAnalysisService $analysisService,
    ): SymfonyResponse {
        $reportData = $this->buildReportData($request, $analysisService);
        $filename = $this->reportFilename($reportData, 'xlsx');
        $path = tempnam(sys_get_temp_dir(), 'stability-report-');
        file_put_contents($path, $this->zipArchive([
            '[Content_Types].xml' => $this->xlsxContentTypes(),
            '_rels/.rels' => $this->xlsxRootRels(),
            'xl/workbook.xml' => $this->xlsxWorkbook(),
            'xl/_rels/workbook.xml.rels' => $this->xlsxWorkbookRels(),
            'xl/worksheets/sheet1.xml' => $this->xlsxSheet($this->spreadsheetRows($reportData)),
        ]));

        return response()->download(
            $path,
            $filename,
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        )->deleteFileAfterSend(true);
    }

    private function buildReportData(Request $request, StabilityAnalysisService $analysisService): array
    {
        $solution = ActiveAssignmentSolution::current($request);

        if ($solution) {
            $vessel = $solution->vessel;
            $cargoPlan = $solution->cargoPlan;
            $ballastTanks = $solution->ballastTanks;

            $workspace = [
                'mode' => 'student_solution',
                'assignment_id' => $solution->assignment_id,
                'solution_id' => $solution->id,
                'status' => $solution->status,
                'is_locked' => $solution->status !== 'in_progress'
                    || in_array($solution->assignment?->status, ['submitted', 'graded', 'overdue'], true),
                'scenario_title' => $solution->assignment?->scenario?->title,
                'student_name' => $solution->student?->name,
                'student_email' => $solution->student?->email,
            ];
        } else {
            $vessel = ActiveVessel::query($request)
                ->with([
                    'compartments',
                    'ballastTanks',
                    'limits',
                ])
                ->firstOrFail();

            $cargoPlan = $vessel
                ->cargoPlans()
                ->with([
                    'items.cargoType',
                    'items.compartment',
                ])
                ->where('status', 'active')
                ->latest()
                ->first();

            $ballastTanks = $vessel->ballastTanks;
            $workspace = null;
        }

        $analysis = $analysisService->build($vessel, $cargoPlan, $ballastTanks);

        $cargoItems = ($cargoPlan?->items ?? collect())
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'compartment' => $item->compartment?->name ?? '-',
                    'compartment_code' => $item->compartment?->code ?? '-',
                    'cargo_type' => $item->cargoType?->name ?? '-',
                    'cargo_name' => $item->cargo_name,
                    'weight_tonnes' => round((float) $item->weight_tonnes, 2),
                    'volume_m3' => round((float) $item->volume_m3, 2),
                    'loading_port' => $item->loading_port,
                    'discharge_port' => $item->discharge_port,
                    'status' => $item->status,
                ];
            })
            ->values()
            ->toArray();

        $ballastRows = collect($ballastTanks)
            ->map(function ($tank) {
                $capacity = max((float) $tank->capacity_tonnes, 1);
                $current = (float) $tank->current_tonnes;
                $fillPercent = ($current / $capacity) * 100;

                return [
                    'id' => $tank->id,
                    'code' => $tank->code,
                    'name' => $tank->name,
                    'side' => $tank->side,
                    'capacity_tonnes' => round($capacity, 2),
                    'current_tonnes' => round($current, 2),
                    'fill_percent' => round($fillPercent, 1),
                    'free_surface_risk' => $fillPercent > 5 && $fillPercent < 95,
                ];
            })
            ->values()
            ->toArray();

        return [
            'generated_at' => now()->format('d.m.Y H:i'),
            'workspace' => $workspace,
            'vessel' => $analysis['vessel'],
            'condition' => $analysis['condition'],
            'metrics' => $analysis['metrics'],
            'criteria' => $analysis['criteria'],
            'hold_loads' => $analysis['hold_loads'],
            'charts' => $analysis['charts'],
            'cargo_items' => $cargoItems,
            'ballast_tanks' => $ballastRows,
        ];
    }

    private function reportFilename(array $reportData, string $extension): string
    {
        $vesselName = str($reportData['vessel']['name'] ?? 'vessel')
            ->lower()
            ->replace([' ', '/', '\\'], '-')
            ->toString();

        $prefix = $reportData['workspace']
            ? 'student-solution'
            : 'stability-summary';

        return "{$prefix}-{$vesselName}.{$extension}";
    }

    private function spreadsheetRows(array $reportData): array
    {
        $metrics = $reportData['metrics'] ?? [];
        $rows = [
            ['Ship Stability Simulator report'],
            ['Generated at', $reportData['generated_at'] ?? '-'],
            ['Vessel', $reportData['vessel']['name'] ?? '-'],
            ['IMO', $reportData['vessel']['imo_number'] ?? '-'],
            ['Cargo plan', $reportData['condition']['cargo_plan_name'] ?? '-'],
            [],
            ['Metric', 'Value'],
        ];

        foreach ($metrics as $name => $value) {
            $rows[] = [str_replace('_', ' ', (string) $name), $value];
        }

        $rows[] = [];
        $rows[] = ['Criteria', 'Requirement', 'Actual', 'Status', 'Comment'];

        foreach ($reportData['criteria'] ?? [] as $criterion) {
            $rows[] = [
                $criterion['name'] ?? '-',
                $criterion['requirement'] ?? '-',
                $criterion['actual'] ?? '-',
                $criterion['status'] ?? '-',
                $criterion['comment'] ?? '-',
            ];
        }

        $rows[] = [];
        $rows[] = ['Cargo', 'Compartment', 'Type', 'Weight t', 'Volume m3', 'Loading port', 'Discharge port'];

        foreach ($reportData['cargo_items'] ?? [] as $item) {
            $rows[] = [
                $item['cargo_name'] ?? '-',
                $item['compartment'] ?? '-',
                $item['cargo_type'] ?? '-',
                $item['weight_tonnes'] ?? '-',
                $item['volume_m3'] ?? '-',
                $item['loading_port'] ?? '-',
                $item['discharge_port'] ?? '-',
            ];
        }

        $rows[] = [];
        $rows[] = ['Ballast tank', 'Side', 'Current t', 'Capacity t', 'Fill %', 'Free surface risk'];

        foreach ($reportData['ballast_tanks'] ?? [] as $tank) {
            $rows[] = [
                $tank['name'] ?? '-',
                $tank['side'] ?? '-',
                $tank['current_tonnes'] ?? '-',
                $tank['capacity_tonnes'] ?? '-',
                $tank['fill_percent'] ?? '-',
                ! empty($tank['free_surface_risk']) ? 'yes' : 'no',
            ];
        }

        return $rows;
    }

    private function xlsxSheet(array $rows): string
    {
        $sheetRows = collect($rows)
            ->map(function (array $row, int $rowIndex) {
                $cells = collect($row)
                    ->map(function ($value, int $columnIndex) use ($rowIndex) {
                        $cell = $this->xlsxColumnName($columnIndex + 1) . ($rowIndex + 1);
                        $value = htmlspecialchars((string) $value, ENT_XML1 | ENT_COMPAT, 'UTF-8');

                        return "<c r=\"{$cell}\" t=\"inlineStr\"><is><t>{$value}</t></is></c>";
                    })
                    ->implode('');

                $number = $rowIndex + 1;

                return "<row r=\"{$number}\">{$cells}</row>";
            })
            ->implode('');

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . "<sheetData>{$sheetRows}</sheetData>"
            . '</worksheet>';
    }

    private function xlsxColumnName(int $number): string
    {
        $name = '';

        while ($number > 0) {
            $number--;
            $name = chr(65 + ($number % 26)) . $name;
            $number = intdiv($number, 26);
        }

        return $name;
    }

    private function xlsxContentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '</Types>';
    }

    private function xlsxRootRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '</Relationships>';
    }

    private function xlsxWorkbook(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheets><sheet name="Stability report" sheetId="1" r:id="rId1"/></sheets>'
            . '</workbook>';
    }

    private function xlsxWorkbookRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            . '</Relationships>';
    }

    private function zipArchive(array $files): string
    {
        $localFiles = '';
        $centralDirectory = '';
        $offset = 0;

        foreach ($files as $name => $contents) {
            $name = str_replace('\\', '/', $name);
            $size = strlen($contents);
            $crc = crc32($contents);

            if ($crc < 0) {
                $crc += 4294967296;
            }

            $localHeader = pack('VvvvvvVVVvv',
                0x04034b50,
                20,
                0,
                0,
                0,
                0,
                $crc,
                $size,
                $size,
                strlen($name),
                0,
            ) . $name;

            $centralHeader = pack('VvvvvvvVVVvvvvvVV',
                0x02014b50,
                20,
                20,
                0,
                0,
                0,
                0,
                $crc,
                $size,
                $size,
                strlen($name),
                0,
                0,
                0,
                0,
                32,
                $offset,
            ) . $name;

            $localFiles .= $localHeader . $contents;
            $centralDirectory .= $centralHeader;
            $offset += strlen($localHeader) + $size;
        }

        $centralOffset = strlen($localFiles);
        $centralSize = strlen($centralDirectory);
        $fileCount = count($files);

        $end = pack('VvvvvVVv',
            0x06054b50,
            0,
            0,
            $fileCount,
            $fileCount,
            $centralSize,
            $centralOffset,
            0,
        );

        return $localFiles . $centralDirectory . $end;
    }
}
