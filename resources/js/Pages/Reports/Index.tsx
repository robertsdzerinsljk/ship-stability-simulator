import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    AlertTriangle,
    Anchor,
    Download,
    FileText,
    PackageOpen,
    Scale,
    Ship,
    Waves,
} from 'lucide-react';

type CriterionStatus = 'pass' | 'warning' | 'fail' | string;

type ReportData = {
    generated_at?: string | null;
    workspace?: {
        mode?: string;
        assignment_id?: number;
        solution_id?: number;
        status?: string | null;
        scenario_title?: string | null;
        student_name?: string | null;
        student_email?: string | null;
    } | null;
    vessel?: {
        id?: number;
        name?: string | null;
        type?: string | null;
        imo_number?: string | null;
        length_overall?: number | string | null;
        breadth?: number | string | null;
        dwt?: number | string | null;
    };
    condition?: {
        cargo_plan_name?: string | null;
        mode?: string | null;
    };
    metrics?: {
        displacement?: number | string | null;
        lightship_weight?: number | string | null;
        cargo_weight?: number | string | null;
        ballast_weight?: number | string | null;
        kg?: number | string | null;
        km?: number | string | null;
        gm?: number | string | null;
        free_surface_correction?: number | string | null;
        lcg?: number | string | null;
        tcg?: number | string | null;
        trim?: number | string | null;
        trim_direction?: string | null;
        heel?: number | string | null;
        fore_draft?: number | string | null;
        aft_draft?: number | string | null;
        mean_draft?: number | string | null;
        max_gz?: number | string | null;
        angle_at_max_gz?: number | string | null;
        gz_area?: number | string | null;
    };
    criteria?: {
        name?: string;
        requirement?: string;
        actual?: string;
        status?: CriterionStatus;
        comment?: string;
    }[];
    hold_loads?: {
        name?: string;
        code?: string;
        weight_tonnes?: number | string | null;
        capacity_tonnes?: number | string | null;
        load_percent?: number | string | null;
        lcg?: number | string | null;
    }[];
    cargo_items?: {
        id?: number;
        compartment?: string;
        compartment_code?: string;
        cargo_type?: string;
        cargo_name?: string;
        weight_tonnes?: number | string | null;
        volume_m3?: number | string | null;
        loading_port?: string | null;
        discharge_port?: string | null;
        status?: string | null;
    }[];
    ballast_tanks?: {
        id?: number;
        code?: string;
        name?: string;
        side?: string;
        capacity_tonnes?: number | string | null;
        current_tonnes?: number | string | null;
        fill_percent?: number | string | null;
        free_surface_risk?: boolean;
    }[];
};

type ReportsIndexProps = {
    reportData?: ReportData;
};

function toNumber(value: number | string | null | undefined) {
    const number = Number(value ?? 0);

    return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: number | string | null | undefined, digits = 2) {
    return toNumber(value).toLocaleString('lv-LV', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

function statusBadge(status?: CriterionStatus) {
    if (status === 'fail') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

    if (status === 'warning') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

function statusLabel(status?: CriterionStatus) {
    if (status === 'fail') {
        return 'Neatbilst';
    }

    if (status === 'warning') {
        return 'Jāpārbauda';
    }

    return 'Atbilst';
}

function sideLabel(side?: string) {
    if (side === 'port') {
        return 'Kreisais borts';
    }

    if (side === 'starboard') {
        return 'Labais borts';
    }

    return 'Centrs';
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

export default function ReportsIndex({ reportData }: ReportsIndexProps) {
    const data = {
        generated_at: '-',
        workspace: null,
        vessel: {
            name: 'Nav izvēlēts kuģis',
            type: '-',
            imo_number: '-',
            length_overall: 0,
            breadth: 0,
            dwt: 0,
        },
        condition: {
            cargo_plan_name: 'Nav aktīva kravas plāna',
            mode: 'training',
        },
        metrics: {
            displacement: 0,
            lightship_weight: 0,
            cargo_weight: 0,
            ballast_weight: 0,
            kg: 0,
            km: 0,
            gm: 0,
            free_surface_correction: 0,
            lcg: 0,
            tcg: 0,
            trim: 0,
            trim_direction: '-',
            heel: 0,
            fore_draft: 0,
            aft_draft: 0,
            mean_draft: 0,
            max_gz: 0,
            angle_at_max_gz: 0,
            gz_area: 0,
        },
        criteria: [],
        hold_loads: [],
        cargo_items: [],
        ballast_tanks: [],
        ...reportData,
    };

    const vessel = {
        name: 'Nav izvēlēts kuģis',
        type: '-',
        imo_number: '-',
        length_overall: 0,
        breadth: 0,
        dwt: 0,
        ...data.vessel,
    };

    const condition = {
        cargo_plan_name: 'Nav aktīva kravas plāna',
        mode: 'training',
        ...data.condition,
    };

    const metrics = {
        displacement: 0,
        lightship_weight: 0,
        cargo_weight: 0,
        ballast_weight: 0,
        kg: 0,
        km: 0,
        gm: 0,
        free_surface_correction: 0,
        lcg: 0,
        tcg: 0,
        trim: 0,
        trim_direction: '-',
        heel: 0,
        fore_draft: 0,
        aft_draft: 0,
        mean_draft: 0,
        max_gz: 0,
        angle_at_max_gz: 0,
        gz_area: 0,
        ...data.metrics,
    };

    const criteria = Array.isArray(data.criteria) ? data.criteria : [];
    const holdLoads = Array.isArray(data.hold_loads) ? data.hold_loads : [];
    const cargoItems = Array.isArray(data.cargo_items) ? data.cargo_items : [];
    const ballastTanks = Array.isArray(data.ballast_tanks) ? data.ballast_tanks : [];

    const failedCriteria = criteria.filter((item) => item.status === 'fail').length;
    const warningCriteria = criteria.filter((item) => item.status === 'warning').length;
    const passedCriteria = criteria.length - failedCriteria;

    return (
        <AuthenticatedLayout
            title="Atskaites"
            subtitle="PDF pārskati par kravas plānu, balastu un stabilitāti"
        >
            <Head title="Atskaites" />

            <div className="space-y-6">
                {data.workspace && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                        <div className="font-semibold">Studenta privātais risinājums</div>
                        <div className="mt-1">
                            Uzdevums: {data.workspace.scenario_title ?? '-'}
                        </div>
                        <div>
                            Students: {data.workspace.student_name ?? '-'}
                            {data.workspace.student_email ? ` (${data.workspace.student_email})` : ''}
                        </div>
                        <div>Statuss: {data.workspace.status ?? '-'}</div>
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <FileText className="h-4 w-4" />
                                Ģenerēts: {data.generated_at ?? '-'}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                Stabilitātes pārskats
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Pārskats apkopo aktīvo kuģi, kravas izvietojumu, balasta tanku
                                stāvokli un stabilitātes aprēķinu rezultātus. Ja students ir
                                uzdevuma risināšanas režīmā, šeit tiek attēlots viņa privātais
                                risinājums.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <a
                                href="/reports/stability-summary/pdf"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            >
                                <Download className="h-5 w-5" />
                                PDF
                            </a>

                            <a
                                href="/reports/stability-summary/xlsx"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                <Download className="h-5 w-5" />
                                XLSX
                            </a>

                            <a
                                href="/reports/stability-summary/csv"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                <Download className="h-5 w-5" />
                                CSV
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Kuģis"
                        value={vessel.name ?? 'Nav izvēlēts kuģis'}
                        description={`IMO ${vessel.imo_number ?? '-'} · ${vessel.type ?? '-'}`}
                        icon={Ship}
                    />

                    <SummaryCard
                        title="Displacement"
                        value={`${formatNumber(metrics.displacement)} t`}
                        description={`Krava ${formatNumber(metrics.cargo_weight)} t · Balasts ${formatNumber(metrics.ballast_weight)} t`}
                        icon={PackageOpen}
                    />

                    <SummaryCard
                        title="GM"
                        value={`${formatNumber(metrics.gm, 3)} m`}
                        description={`KG ${formatNumber(metrics.kg, 3)} m · KM ${formatNumber(metrics.km, 3)} m`}
                        icon={Scale}
                    />

                    <SummaryCard
                        title="Kritēriji"
                        value={`${passedCriteria}/${criteria.length}`}
                        description={
                            failedCriteria > 0
                                ? 'Ir neatbilstoši kritēriji'
                                : warningCriteria > 0
                                    ? 'Ir pārbaudāmi brīdinājumi'
                                    : 'Visi kritiskie kritēriji atbilst'
                        }
                        icon={failedCriteria > 0 || warningCriteria > 0 ? AlertTriangle : Activity}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Trim"
                        value={`${formatNumber(metrics.trim, 3)} m`}
                        description={metrics.trim_direction ?? '-'}
                        icon={Anchor}
                    />

                    <SummaryCard
                        title="Heel"
                        value={`${formatNumber(metrics.heel, 3)}°`}
                        description="Aprēķinātais sānsveres leņķis"
                        icon={Waves}
                    />

                    <SummaryCard
                        title="Iegrime"
                        value={`${formatNumber(metrics.mean_draft, 2)} m`}
                        description={`Priekšgals ${formatNumber(metrics.fore_draft, 2)} m · Pakaļgals ${formatNumber(metrics.aft_draft, 2)} m`}
                        icon={Ship}
                    />

                    <SummaryCard
                        title="GZ"
                        value={`${formatNumber(metrics.max_gz, 3)} m`}
                        description={`Leņķis pie max GZ: ${formatNumber(metrics.angle_at_max_gz, 0)}°`}
                        icon={Activity}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h3 className="text-base font-semibold text-slate-950">
                                Kritēriju priekšskatījums
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Šīs vērtības tiks iekļautas PDF pārskatā.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Kritērijs</th>
                                        <th className="px-4 py-3 font-semibold">Prasība</th>
                                        <th className="px-4 py-3 font-semibold">Faktiski</th>
                                        <th className="px-4 py-3 font-semibold">Statuss</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {criteria.map((criterion, index) => (
                                        <tr
                                            key={`${criterion.name ?? 'criterion'}-${index}`}
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                                {criterion.name ?? '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {criterion.requirement ?? '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {criterion.actual ?? '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(criterion.status)}`}>
                                                    {statusLabel(criterion.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {criteria.length === 0 && (
                            <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                                Nav kritēriju datu.
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    PDF saturs
                                </h3>
                            </div>

                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    Kuģis: {vessel.name ?? '-'}
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    Kravas plāns: {condition.cargo_plan_name ?? '-'}
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    Stabilitātes metrikas: GM, KG, KM, displacement, trim, heel un iegrimes
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    Kravas rindas: {cargoItems.length} · Balasta tanki: {ballastTanks.length}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                            <strong>Piezīme:</strong> šis ir mācību simulatora PDF.
                            Aprēķini ir paredzēti simulatora darba pārbaudei, nevis reālai kuģa
                            ekspluatācijas dokumentācijai.
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Kravas plāna priekšskatījums
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Privātā risinājuma vai aktīvā kuģa kravas rindas.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Tilpne</th>
                                    <th className="px-4 py-3 font-semibold">Krava</th>
                                    <th className="px-4 py-3 font-semibold">Tips</th>
                                    <th className="px-4 py-3 font-semibold">Svars</th>
                                    <th className="px-4 py-3 font-semibold">Tilpums</th>
                                    <th className="px-4 py-3 font-semibold">Ostas</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cargoItems.map((item, index) => (
                                    <tr
                                        key={`${item.id ?? index}-cargo`}
                                        className="border-b border-slate-100 last:border-0"
                                    >
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                            {item.compartment_code ?? '-'} · {item.compartment ?? '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-700">
                                            {item.cargo_name ?? '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.cargo_type ?? '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {formatNumber(item.weight_tonnes)} t
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {formatNumber(item.volume_m3)} m³
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {(item.loading_port ?? '-') + ' → ' + (item.discharge_port ?? '-')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {cargoItems.length === 0 && (
                        <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                            Nav kravas plāna rindu.
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Balasta tanku priekšskatījums
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Tanku aizpildījums, kas tiks iekļauts PDF atskaitē.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Tanks</th>
                                    <th className="px-4 py-3 font-semibold">Borts</th>
                                    <th className="px-4 py-3 font-semibold">Daudzums</th>
                                    <th className="px-4 py-3 font-semibold">Kapacitāte</th>
                                    <th className="px-4 py-3 font-semibold">Aizpildījums</th>
                                    <th className="px-4 py-3 font-semibold">Risks</th>
                                </tr>
                            </thead>

                            <tbody>
                                {ballastTanks.map((tank, index) => (
                                    <tr
                                        key={`${tank.id ?? index}-ballast`}
                                        className="border-b border-slate-100 last:border-0"
                                    >
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                            {tank.code ?? '-'} · {tank.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {sideLabel(tank.side)}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {formatNumber(tank.current_tonnes)} t
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {formatNumber(tank.capacity_tonnes)} t
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {formatNumber(tank.fill_percent, 1)}%
                                        </td>
                                        <td className="px-4 py-4">
                                            {tank.free_surface_risk ? (
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                                                    Brīvās virsmas risks
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                                                    Nav būtiska riska
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {ballastTanks.length === 0 && (
                        <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                            Nav balasta tanku datu.
                        </div>
                    )}
                </div>

                {holdLoads.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h3 className="text-base font-semibold text-slate-950">
                                Tilpņu noslodze
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Tilpne</th>
                                        <th className="px-4 py-3 font-semibold">Svars</th>
                                        <th className="px-4 py-3 font-semibold">Kapacitāte</th>
                                        <th className="px-4 py-3 font-semibold">Noslodze</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {holdLoads.map((hold, index) => (
                                        <tr
                                            key={`${hold.code ?? index}-hold`}
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                                {hold.code ?? '-'} · {hold.name ?? '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {formatNumber(hold.weight_tonnes)} t
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {formatNumber(hold.capacity_tonnes)} t
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {formatNumber(hold.load_percent, 1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
