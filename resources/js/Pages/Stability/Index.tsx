import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    AlertTriangle,
    Anchor,
    Gauge,
    Ruler,
    Scale,
    ShieldCheck,
    Ship,
    Waves,
} from 'lucide-react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type CriterionStatus = 'pass' | 'warning' | 'fail';

type Analysis = {
    vessel: {
        id: number;
        name: string;
        type?: string;
        imo_number?: string;
        length_overall: number;
        breadth: number;
        dwt: number;
    };
    condition: {
        cargo_plan_name: string;
        mode: string;
    };
    metrics: {
        displacement: number;
        lightship_weight: number;
        cargo_weight: number;
        ballast_weight: number;

        kg: number;
        km: number;
        gm: number;
        free_surface_correction: number;

        lcg: number;
        tcg: number;
        trim: number;
        trim_direction: string;
        heel: number;

        fore_draft: number;
        aft_draft: number;
        mean_draft: number;

        max_gz: number;
        angle_at_max_gz: number;
        gz_area: number;
    };
    criteria: {
        name: string;
        requirement: string;
        actual: string;
        status: CriterionStatus;
        comment: string;
    }[];
    hold_loads: {
        name: string;
        code: string;
        weight_tonnes: number;
        capacity_tonnes: number;
        load_percent: number;
        lcg: number;
    }[];
    charts: {
        gz_curve: {
            angle: number;
            gz: number;
            criteria: number;
        }[];
        shear_force: {
            station: number;
            shear: number;
            limit_positive: number;
            limit_negative: number;
        }[];
        bending_moment: {
            station: number;
            moment: number;
            limit_positive: number;
            limit_negative: number;
        }[];
    };
};

type StabilityIndexProps = {
    analysis: Analysis;
};

function statusBadge(status: CriterionStatus) {
    if (status === 'fail') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

    if (status === 'warning') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

function statusLabel(status: CriterionStatus) {
    if (status === 'fail') {
        return 'Neatbilst';
    }

    if (status === 'warning') {
        return 'Jāpārbauda';
    }

    return 'Atbilst';
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    status = 'neutral',
}: {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    status?: 'good' | 'warning' | 'danger' | 'neutral';
}) {
    const classes = {
        good: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        warning: 'bg-amber-50 text-amber-700 ring-amber-100',
        danger: 'bg-red-50 text-red-700 ring-red-100',
        neutral: 'bg-slate-50 text-slate-700 ring-slate-100',
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>

                <div className={`rounded-xl p-3 ring-1 ${classes[status]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function ChartCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>

            <div className="h-[24rem]">
                {children}
            </div>
        </div>
    );
}

function CriteriaTable({ criteria }: { criteria: Analysis['criteria'] }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-950">
                    Stabilitātes kritēriju pārbaude
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Sistēma salīdzina faktiskās vērtības ar mācību scenārija robežām.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Kritērijs</th>
                            <th className="px-4 py-3 font-semibold">Prasība</th>
                            <th className="px-4 py-3 font-semibold">Faktiski</th>
                            <th className="px-4 py-3 font-semibold">Statuss</th>
                            <th className="px-4 py-3 font-semibold">Komentārs</th>
                        </tr>
                    </thead>

                    <tbody>
                        {criteria.map((criterion) => (
                            <tr
                                key={criterion.name}
                                className="border-b border-slate-100 last:border-0"
                            >
                                <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                    {criterion.name}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {criterion.requirement}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {criterion.actual}
                                </td>

                                <td className="px-4 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(criterion.status)}`}>
                                        {statusLabel(criterion.status)}
                                    </span>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-500">
                                    {criterion.comment}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function HoldLoadTable({ holdLoads }: { holdLoads: Analysis['hold_loads'] }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-950">
                    Tilpņu noslodzes ietekme
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Kravas sadalījums gar kuģa garenvirzienu.
                </p>
            </div>

            <div className="space-y-3">
                {holdLoads.map((hold) => (
                    <div key={hold.code}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">
                                {hold.code} · {hold.name}
                            </span>
                            <span className="text-slate-500">
                                {hold.load_percent}% · LCG {hold.lcg}
                            </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className={[
                                    'h-full rounded-full',
                                    hold.load_percent >= 100
                                        ? 'bg-red-600'
                                        : hold.load_percent >= 90
                                            ? 'bg-red-500'
                                            : hold.load_percent >= 75
                                                ? 'bg-amber-500'
                                                : 'bg-emerald-500',
                                ].join(' ')}
                                style={{ width: `${Math.min(hold.load_percent, 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StabilityIndex({ analysis }: StabilityIndexProps) {
    const failedCriteria = analysis.criteria.filter((item) => item.status === 'fail').length;
    const warningCriteria = analysis.criteria.filter((item) => item.status === 'warning').length;

    const overallStatus =
        failedCriteria > 0
            ? 'Neatbilst'
            : warningCriteria > 0
                ? 'Jāpārbauda'
                : 'Atbilst';

    return (
        <AuthenticatedLayout
            title="Stabilitāte"
            subtitle="GM, KG, KM, GZ līkne, trims un drošības kritēriji"
        >
            <Head title="Stabilitāte" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <Ship className="h-4 w-4" />
                                {analysis.vessel.name} · IMO {analysis.vessel.imo_number ?? 'nav norādīts'}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                Stabilitātes analīze
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Aprēķini balstās uz aktīvo kravas plānu, balasta tanku stāvokli
                                un kuģa demo tehniskajiem parametriem. Šis ir mācību modelis,
                                kuru vēlāk var papildināt ar reālām hidrostatiskajām tabulām.
                            </p>
                        </div>

                        <div
                            className={[
                                'rounded-2xl px-5 py-4 text-[#B4530A] shadow',
                                failedCriteria > 0
                                    ? 'bg-red-700'
                                    : warningCriteria > 0
                                        ? 'bg-[#FFFBEB]'
                                        : 'bg-emerald-700',
                            ].join(' ')}
                        >
                            <p className="text-xs uppercase tracking-[0.2em] text-[#B4530A]/70">
                                Kopējais statuss
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {overallStatus}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="GM"
                        value={`${analysis.metrics.gm} m`}
                        description={`KM ${analysis.metrics.km} m · KG ${analysis.metrics.kg} m`}
                        icon={Scale}
                        status={analysis.metrics.gm >= 0.5 ? 'good' : 'danger'}
                    />

                    <SummaryCard
                        title="Displacement"
                        value={`${analysis.metrics.displacement.toLocaleString('lv-LV')} t`}
                        description={`Krava ${analysis.metrics.cargo_weight.toLocaleString('lv-LV')} t · Balasts ${analysis.metrics.ballast_weight.toLocaleString('lv-LV')} t`}
                        icon={Ship}
                        status="neutral"
                    />

                    <SummaryCard
                        title="Trims"
                        value={`${Math.abs(analysis.metrics.trim)} m`}
                        description={analysis.metrics.trim_direction}
                        icon={Anchor}
                        status={Math.abs(analysis.metrics.trim) > 1.3 ? 'warning' : 'good'}
                    />

                    <SummaryCard
                        title="Sasvērums"
                        value={`${analysis.metrics.heel}°`}
                        description={`TCG ${analysis.metrics.tcg} m`}
                        icon={Gauge}
                        status={analysis.metrics.heel > 3 ? 'danger' : 'good'}
                    />

                    <SummaryCard
                        title="Iegrime"
                        value={`${analysis.metrics.mean_draft} m`}
                        description={`Priekšgals ${analysis.metrics.fore_draft} m · Pakaļgals ${analysis.metrics.aft_draft} m`}
                        icon={Ruler}
                        status="neutral"
                    />

                    <SummaryCard
                        title="Brīvā virsma"
                        value={`${analysis.metrics.free_surface_correction} m`}
                        description="GM korekcija no daļēji piepildītiem tankiem"
                        icon={Waves}
                        status={analysis.metrics.free_surface_correction > 0 ? 'warning' : 'good'}
                    />

                    <SummaryCard
                        title="Maks. GZ"
                        value={`${analysis.metrics.max_gz} m`}
                        description={`Pie ${analysis.metrics.angle_at_max_gz}°`}
                        icon={Activity}
                        status={analysis.metrics.max_gz >= 0.2 ? 'good' : 'warning'}
                    />

                    <SummaryCard
                        title="Kritēriji"
                        value={`${analysis.criteria.length - failedCriteria}/${analysis.criteria.length}`}
                        description={failedCriteria > 0 ? 'Ir neatbilstoši kritēriji' : 'Nav kritisku neatbilstību'}
                        icon={failedCriteria > 0 ? AlertTriangle : ShieldCheck}
                        status={failedCriteria > 0 ? 'danger' : warningCriteria > 0 ? 'warning' : 'good'}
                    />
                </div>

                <CriteriaTable criteria={analysis.criteria} />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
                    <ChartCard
                        title="GZ līkne"
                        description="Vienkāršota stabilitātes līkne salīdzinājumā ar mācību kritērija līniju."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analysis.charts.gz_curve} margin={{ top: 10, right: 24, left: 12, bottom: 42 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="angle"
                                    height={50}
                                    label={{ value: 'Leņķis (°)', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis
                                    label={{ value: 'GZ (m)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={28} />
                                <Line
                                    type="monotone"
                                    dataKey="gz"
                                    name="Faktiskais GZ"
                                    stroke="#059669"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="criteria"
                                    name="Kritērija līnija"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <HoldLoadTable holdLoads={analysis.hold_loads} />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <ChartCard
                        title="Šķērspēka profils"
                        description="Vienkāršots šķērspēka sadalījums gar kuģa garumu."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analysis.charts.shear_force} margin={{ top: 10, right: 24, left: 12, bottom: 42 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="station"
                                    height={50}
                                    label={{ value: 'Stacija gar kuģi (m)', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={28} />
                                <Line
                                    type="monotone"
                                    dataKey="shear"
                                    name="Šķērspēks"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="limit_positive"
                                    name="Pozitīvā robeža"
                                    stroke="#dc2626"
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="limit_negative"
                                    name="Negatīvā robeža"
                                    stroke="#dc2626"
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Lieces momenta profils"
                        description="Vienkāršots lieces momenta sadalījums, kas palīdz redzēt korpusa slodzes tendenci."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analysis.charts.bending_moment} margin={{ top: 10, right: 24, left: 12, bottom: 42 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="station"
                                    height={50}
                                    label={{ value: 'Stacija gar kuģi (m)', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={28} />
                                <Line
                                    type="monotone"
                                    dataKey="moment"
                                    name="Lieces moments"
                                    stroke="#7c3aed"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="limit_positive"
                                    name="Pozitīvā robeža"
                                    stroke="#dc2626"
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="limit_negative"
                                    name="Negatīvā robeža"
                                    stroke="#dc2626"
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
