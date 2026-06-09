import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    Anchor,
    Gauge,
    Save,
    Ship,
    Waves,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type Vessel = {
    id?: number;
    name?: string;
    type?: string;
    imo_number?: string;
};

type Summary = {
    total_ballast?: number | string | null;
    total_capacity?: number | string | null;
    fill_percent?: number | string | null;
    port_tonnes?: number | string | null;
    starboard_tonnes?: number | string | null;
    center_tonnes?: number | string | null;
    imbalance_tonnes?: number | string | null;
    free_surface_count?: number | string | null;
    tanks_count?: number | string | null;
    balance_status?: string | null;
};

type BallastTank = {
    id: number;
    name?: string;
    code?: string;
    side?: 'port' | 'starboard' | 'center' | string;
    capacity_tonnes?: number | string | null;
    capacity_m3?: number | string | null;
    current_tonnes?: number | string | null;
    fill_percent?: number | string | null;
    lcg?: number | string | null;
    vcg?: number | string | null;
    tcg?: number | string | null;
    free_surface_coefficient?: number | string | null;
    free_surface_risk?: boolean;
    status?: string;
};

type BallastIndexProps = {
    vessel?: Vessel;
    summary?: Summary;
    tanks?: BallastTank[];
    workspace?: {
        assignment_id: number;
        solution_id: number;
        mode: string;
    } | null;
};

type BallastPageProps = PageProps<{
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}>;

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

function sideLabel(side?: string) {
    if (side === 'port') {
        return 'Kreisais borts';
    }

    if (side === 'starboard') {
        return 'Labais borts';
    }

    return 'Centrs';
}

function statusLabel(status?: string) {
    if (status === 'empty') {
        return 'Tukšs';
    }

    if (status === 'partial') {
        return 'Daļēji piepildīts';
    }

    if (status === 'full') {
        return 'Pilns';
    }

    if (status === 'overloaded') {
        return 'Pārsniegts';
    }

    return status ?? 'Nav datu';
}

function statusBadge(status?: string) {
    if (status === 'overloaded' || status === 'Pārsniegts') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

    if (status === 'partial' || status === 'Daļēji piepildīts') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    if (status === 'full' || status === 'Pilns') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    return 'bg-slate-50 text-slate-700 ring-slate-100';
}

function fillBarColor(fillPercent: number) {
    if (fillPercent > 100) {
        return 'bg-red-600';
    }

    if (fillPercent >= 95) {
        return 'bg-emerald-600';
    }

    if (fillPercent > 5) {
        return 'bg-amber-500';
    }

    return 'bg-sky-500';
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

function BallastTankRow({ tank }: { tank: BallastTank }) {
    const capacityTonnes = toNumber(tank.capacity_tonnes);
    const capacityM3 = toNumber(tank.capacity_m3);
    const current = toNumber(tank.current_tonnes);
    const fillPercent = toNumber(tank.fill_percent);
    const safeFillPercent = Math.min(Math.max(fillPercent, 0), 100);

    const [currentTonnes, setCurrentTonnes] = useState(String(current));
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        setSaving(true);

        router.patch(
            `/ballast/tanks/${tank.id}`,
            {
                current_tonnes: currentTonnes,
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <tr className="border-b border-slate-100 align-top last:border-0">
            <td className="whitespace-nowrap px-4 py-4">
                <div className="font-semibold text-slate-950">{tank.code ?? '-'}</div>
                <div className="text-xs text-slate-500">{tank.name ?? '-'}</div>
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                {sideLabel(tank.side)}
            </td>

            <td className="min-w-[150px] px-4 py-4">
                <input
                    type="number"
                    min="0"
                    max={capacityTonnes}
                    step="0.01"
                    value={currentTonnes}
                    onChange={(event) => setCurrentTonnes(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />

                <p className="mt-1 text-xs text-slate-500">
                    Max: {formatNumber(capacityTonnes)} t
                </p>
            </td>

            <td className="min-w-[190px] px-4 py-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                        {formatNumber(fillPercent, 1)}%
                    </span>

                    <span className={`rounded-full px-2 py-1 ring-1 ${statusBadge(tank.status)}`}>
                        {statusLabel(tank.status)}
                    </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={`h-full rounded-full ${fillBarColor(fillPercent)}`}
                        style={{ width: `${safeFillPercent}%` }}
                    />
                </div>
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                {formatNumber(capacityM3)} m³
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                <div>LCG: {formatNumber(tank.lcg, 2)}</div>
                <div>VCG: {formatNumber(tank.vcg, 2)}</div>
                <div>TCG: {formatNumber(tank.tcg, 2)}</div>
            </td>

            <td className="min-w-[170px] px-4 py-4">
                {tank.free_surface_risk ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Brīvās virsmas risks
                    </div>
                ) : (
                    <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Nav būtiska riska
                    </div>
                )}
            </td>

            <td className="px-4 py-4">
                <form onSubmit={submit}>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saglabā...' : 'Saglabāt'}
                    </button>
                </form>
            </td>
        </tr>
    );
}

function TankMiniMap({ tanks }: { tanks: BallastTank[] }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-slate-950">
                        Balasta tanku shēma
                    </h3>
                    <p className="text-sm text-slate-500">
                        Vienkāršots tanku aizpildījuma pārskats
                    </p>
                </div>

                <Waves className="h-5 w-5 text-slate-500" />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {tanks.map((tank) => {
                    const fillPercent = toNumber(tank.fill_percent);
                    const safeFillPercent = Math.min(Math.max(fillPercent, 0), 100);

                    return (
                        <div
                            key={tank.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-950">
                                        {tank.code ?? '-'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {sideLabel(tank.side)}
                                    </p>
                                </div>

                                <span className="text-sm font-semibold text-slate-700">
                                    {formatNumber(fillPercent, 1)}%
                                </span>
                            </div>

                            <div className="h-20 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                                <div className="flex h-full items-end">
                                    <div
                                        className={`w-full ${fillBarColor(fillPercent)}`}
                                        style={{ height: `${safeFillPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {tanks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    Šim risinājumam pašlaik nav balasta tanku datu.
                </div>
            )}
        </div>
    );
}

export default function BallastIndex({
    vessel,
    summary,
    tanks,
    workspace,
}: BallastIndexProps) {
    const { props } = usePage<BallastPageProps>();
    const success = props.flash?.success;
    const error = props.flash?.error;
    const validationError = props.errors?.current_tonnes;

    const vesselData = {
        id: 0,
        name: 'Nav izvēlēts kuģis',
        type: '',
        imo_number: null,
        ...vessel,
    };

    const summaryData = {
        total_ballast: 0,
        total_capacity: 0,
        fill_percent: 0,
        port_tonnes: 0,
        starboard_tonnes: 0,
        center_tonnes: 0,
        imbalance_tonnes: 0,
        free_surface_count: 0,
        tanks_count: 0,
        balance_status: 'Nav datu',
        ...summary,
    };

    const tankRows = Array.isArray(tanks) ? tanks : [];
    const imbalance = toNumber(summaryData.imbalance_tonnes);
    const freeSurfaceCount = toNumber(summaryData.free_surface_count);
    const tanksCount = toNumber(summaryData.tanks_count);

    return (
        <AuthenticatedLayout
            title="Balasts"
            subtitle="Balasta tanku pārvaldība un kuģa līdzsvara korekcija"
        >
            <Head title="Balasts" />

            <div className="space-y-6">
                {success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {success}
                    </div>
                )}

                {(error || validationError) && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error ?? validationError}
                    </div>
                )}

                {workspace && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        Tu šobrīd rediģē studenta privāto risinājumu. Izmaiņas netiek saglabātas globālajos kuģa datos.
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <Ship className="h-4 w-4" />
                                {vesselData.name} · IMO {vesselData.imo_number ?? 'nav norādīts'}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                Balasta tanku pārvaldība
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šajā modulī var mainīt balasta tanku aizpildījumu un pārbaudīt,
                                vai kuģim neveidojas bortu disbalanss vai brīvās virsmas risks.
                                Saglabātās izmaiņas ietekmēs arī stabilitātes aprēķinu.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Balansa statuss
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {summaryData.balance_status}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Kopējais balasts"
                        value={`${formatNumber(summaryData.total_ballast)} t`}
                        description={`${formatNumber(summaryData.fill_percent, 1)}% no kopējās tanku kapacitātes`}
                        icon={Waves}
                    />

                    <SummaryCard
                        title="Kreisais borts"
                        value={`${formatNumber(summaryData.port_tonnes)} t`}
                        description={`Labais borts: ${formatNumber(summaryData.starboard_tonnes)} t`}
                        icon={Anchor}
                    />

                    <SummaryCard
                        title="Bortu starpība"
                        value={`${formatNumber(imbalance)} t`}
                        description={imbalance > 100 ? 'Nepieciešama pārbaude' : 'Bortu balanss ir pieņemams'}
                        icon={Gauge}
                    />

                    <SummaryCard
                        title="Brīvās virsmas risks"
                        value={`${formatNumber(freeSurfaceCount, 0)}`}
                        description={`${formatNumber(tanksCount, 0)} tanki kopā`}
                        icon={freeSurfaceCount > 0 ? AlertTriangle : Waves}
                    />
                </div>

                <TankMiniMap tanks={tankRows} />

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Balasta tanku tabula
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Maini pašreizējo daudzumu tonnās un saglabā rindu.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1120px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Tanks</th>
                                    <th className="px-4 py-3 font-semibold">Borts</th>
                                    <th className="px-4 py-3 font-semibold">Daudzums</th>
                                    <th className="px-4 py-3 font-semibold">Aizpildījums</th>
                                    <th className="px-4 py-3 font-semibold">Kapacitāte</th>
                                    <th className="px-4 py-3 font-semibold">Pozīcija</th>
                                    <th className="px-4 py-3 font-semibold">Risks</th>
                                    <th className="px-4 py-3 font-semibold">Darbība</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tankRows.map((tank) => (
                                    <BallastTankRow key={tank.id} tank={tank} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {tankRows.length === 0 && (
                        <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                            Nav atrasts neviens balasta tanks.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}