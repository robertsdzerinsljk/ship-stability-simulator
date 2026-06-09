import MetricCard from '@/Components/dashboard/MetricCard';
import ShipSideProfile from '@/Components/dashboard/ShipSideProfile';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Anchor,
    PackageOpen,
    Scale,
    ShieldCheck,
    Waves,
} from 'lucide-react';

type StatusLevel = 'good' | 'warning' | 'danger' | 'neutral';

type DashboardSummary = {
    vessel: {
        id: number;
        name: string;
        type?: string;
        imo_number?: string;
        flag?: string;
        dwt: number;
        length_overall: number;
        breadth: number;
    };
    metrics: {
        safety_status: {
            label: string;
            level: StatusLevel;
            description: string;
        };
        cargo_load: {
            value: number;
            cargo_tonnes: number;
            dwt: number;
        };
        gm: {
            value: number;
            min: number;
        };
        trim: {
            value: number;
            direction: string;
        };
        heel: {
            value: number;
        };
        ballast: {
            value: string;
            tonnes: number;
        };
        drafts: {
            fore: number;
            aft: number;
            mean: number;
        };
        total_displacement: number;
    };
    holds: {
        id: number;
        name: string;
        code: string;
        weight_tonnes: number;
        capacity_tonnes: number;
        load_percent: number;
        status: string;
    }[];
    warnings: {
        level: StatusLevel;
        title: string;
        description: string;
    }[];
};

type DashboardProps = {
    summary: DashboardSummary;
};

function metricStatus(level: StatusLevel): StatusLevel {
    if (level === 'danger') {
        return 'danger';
    }

    if (level === 'warning') {
        return 'warning';
    }

    return 'good';
}

export default function Dashboard({ summary }: DashboardProps) {
    const warnings = summary.warnings;

    return (
        <AuthenticatedLayout
            title="Pārskats"
            subtitle="Operatīvais kuģa stāvoklis un galvenie rādītāji"
        >
            <Head title="Pārskats" />

            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    <MetricCard
                        title="Drošības statuss"
                        value={summary.metrics.safety_status.label}
                        description={summary.metrics.safety_status.description}
                        icon={ShieldCheck}
                        status={metricStatus(summary.metrics.safety_status.level)}
                    />

                    <MetricCard
                        title="Kravas noslodze"
                        value={`${summary.metrics.cargo_load.value}%`}
                        description={`${summary.metrics.cargo_load.cargo_tonnes.toLocaleString('lv-LV')} t no ${summary.metrics.cargo_load.dwt.toLocaleString('lv-LV')} t`}
                        icon={PackageOpen}
                        status="neutral"
                    />

                    <MetricCard
                        title="GM"
                        value={`${summary.metrics.gm.value} m`}
                        description={`Minimālā robeža: ${summary.metrics.gm.min} m`}
                        icon={Scale}
                        status={summary.metrics.gm.value >= summary.metrics.gm.min ? 'good' : 'danger'}
                    />

                    <MetricCard
                        title="Trims"
                        value={`${Math.abs(summary.metrics.trim.value)} m`}
                        description={summary.metrics.trim.direction}
                        icon={Anchor}
                        status={Math.abs(summary.metrics.trim.value) > 1.3 ? 'warning' : 'good'}
                    />

                    <MetricCard
                        title="Balasts"
                        value={summary.metrics.ballast.value}
                        description={`${summary.metrics.ballast.tonnes.toLocaleString('lv-LV')} t balasta`}
                        icon={Waves}
                        status={summary.metrics.ballast.value === 'Līdzsvarots' ? 'good' : 'warning'}
                    />

                    <MetricCard
                        title="Brīdinājumi"
                        value={`${warnings.length}`}
                        description={warnings.length > 0 ? 'Nepieciešama pārbaude' : 'Nav aktīvu brīdinājumu'}
                        icon={AlertTriangle}
                        status={warnings.length > 0 ? 'warning' : 'good'}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
                    <ShipSideProfile
                        vessel={summary.vessel}
                        holds={summary.holds}
                        drafts={summary.metrics.drafts}
                        totalDisplacement={summary.metrics.total_displacement}
                    />

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-950">
                                        Galvenie brīdinājumi
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Sistēmas atrastie riski
                                    </p>
                                </div>

                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            </div>

                            <div className="space-y-3">
                                {warnings.length === 0 && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                                        Pašlaik nav aktīvu brīdinājumu. Kuģa stāvoklis atbilst pamatkritērijiem.
                                    </div>
                                )}

                                {warnings.map((warning, index) => (
                                    <div
                                        key={`${warning.title}-${index}`}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-semibold text-amber-700">
                                                {index + 1}
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-950">
                                                    {warning.title}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {warning.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-slate-700" />
                                <h2 className="text-base font-semibold text-slate-950">
                                    Ātrās darbības
                                </h2>
                            </div>

                            <div className="space-y-2">
                                <a
                                    href="/cargo-plan"
                                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Atvērt kravas plānu
                                </a>

                                <a
                                    href="/stability"
                                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Pārbaudīt stabilitāti
                                </a>

                                <a
                                    href="/ballast"
                                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Veikt balasta korekciju
                                </a>

                                <a
                                    href="/reports"
                                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Ģenerēt pārskatu
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}