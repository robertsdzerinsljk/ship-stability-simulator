import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    CheckCircle2,
    PackageOpen,
    Save,
    Ship,
    TrendingUp,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type CargoPlan = {
    id?: number | null;
    name?: string | null;
    mode?: string | null;
    status?: string | null;
};

type Vessel = {
    id?: number;
    name?: string;
    type?: string;
    imo_number?: string | null;
    dwt?: number | string | null;
};

type Summary = {
    total_cargo?: number | string | null;
    total_capacity?: number | string | null;
    load_percent?: number | string | null;
    holds_count?: number | string | null;
    warnings_count?: number | string | null;
};

type CargoPlanItem = {
    id?: number | null;
    compartment_id?: number;
    compartment_name?: string;
    compartment_code?: string;
    hold_name?: string;
    hold_code?: string;
    cargo_name?: string | null;
    cargo_type_name?: string | null;
    cargo_type?: string | null;
    weight_tonnes?: number | string | null;
    volume_m3?: number | string | null;
    capacity_tonnes?: number | string | null;
    capacity_m3?: number | string | null;
    load_percent?: number | string | null;
    lcg?: number | string | null;
    vcg?: number | string | null;
    tcg?: number | string | null;
    loading_port?: string | null;
    discharge_port?: string | null;
    priority?: number | string | null;
    status?: string | null;
};

type Workspace = {
    assignment_id: number;
    solution_id: number;
    mode: string;
    status?: string;
    is_locked?: boolean;
} | null;

type CargoPlanIndexProps = {
    cargoPlan?: CargoPlan;
    vessel?: Vessel;
    summary?: Summary;
    items?: CargoPlanItem[];
    workspace?: Workspace;
};

type CargoPlanPageProps = PageProps<{
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

function statusLabel(status?: string | null) {
    if (!status) {
        return 'Nav datu';
    }

    if (status === 'planned') {
        return 'Plānots';
    }

    if (status === 'loaded') {
        return 'Iekrauts';
    }

    if (status === 'empty') {
        return 'Tukšs';
    }

    if (status === 'overloaded') {
        return 'Pārslogots';
    }

    return status;
}

function statusBadge(status?: string | null, loadPercent = 0) {
    if (status === 'overloaded' || loadPercent > 100 || status === 'Pārslogots') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

    if (loadPercent >= 90 || status === 'Pilns' || status === 'Brīdinājums') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    if (loadPercent >= 75 || status === 'Pieņemams') {
        return 'bg-blue-50 text-blue-700 ring-blue-100';
    }

    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

function loadBarColor(loadPercent: number) {
    if (loadPercent > 100) {
        return 'bg-red-600';
    }

    if (loadPercent >= 90) {
        return 'bg-red-500';
    }

    if (loadPercent >= 75) {
        return 'bg-amber-500';
    }

    if (loadPercent >= 55) {
        return 'bg-emerald-500';
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

function EditableCargoRow({
    item,
    isLocked,
}: {
    item: CargoPlanItem;
    isLocked: boolean;
}) {
    const itemId = item.id ?? null;
    const compartmentCode = item.compartment_code ?? item.hold_code ?? '-';
    const compartmentName = item.compartment_name ?? item.hold_name ?? '-';
    const cargoType = item.cargo_type_name ?? item.cargo_type ?? 'nav norādīts';

    const capacityTonnes = toNumber(item.capacity_tonnes);
    const volume = toNumber(item.volume_m3);
    const loadPercent = toNumber(item.load_percent);
    const safeLoadPercent = Math.min(Math.max(loadPercent, 0), 100);

    const [cargoName, setCargoName] = useState(item.cargo_name ?? '');
    const [weightTonnes, setWeightTonnes] = useState(String(toNumber(item.weight_tonnes)));
    const [loadingPort, setLoadingPort] = useState(item.loading_port ?? '');
    const [dischargePort, setDischargePort] = useState(item.discharge_port ?? '');
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isLocked || !itemId) {
            return;
        }

        setSaving(true);

        router.patch(
            `/cargo-plan/items/${itemId}`,
            {
                cargo_name: cargoName,
                weight_tonnes: weightTonnes,
                loading_port: loadingPort,
                discharge_port: dischargePort,
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
                <div className="font-semibold text-slate-950">{compartmentCode}</div>
                <div className="text-xs text-slate-500">{compartmentName}</div>
            </td>

            <td className="min-w-[180px] px-4 py-4">
                <input
                    value={cargoName}
                    disabled={isLocked || !itemId}
                    onChange={(event) => setCargoName(event.target.value)}
                    className={[
                        'h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10',
                        isLocked || !itemId
                            ? 'cursor-not-allowed bg-slate-100 text-slate-500'
                            : 'bg-white',
                    ].join(' ')}
                />

                <p className="mt-1 text-xs text-slate-500">
                    Tips: {cargoType}
                </p>
            </td>

            <td className="min-w-[140px] px-4 py-4">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={weightTonnes}
                    disabled={isLocked || !itemId}
                    onChange={(event) => setWeightTonnes(event.target.value)}
                    className={[
                        'h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10',
                        isLocked || !itemId
                            ? 'cursor-not-allowed bg-slate-100 text-slate-500'
                            : 'bg-white',
                    ].join(' ')}
                />

                <p className="mt-1 text-xs text-slate-500">
                    Max: {formatNumber(capacityTonnes)} t
                </p>
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                {formatNumber(volume)} m³
            </td>

            <td className="min-w-[180px] px-4 py-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                        {formatNumber(loadPercent, 1)}%
                    </span>

                    <span className={`rounded-full px-2 py-1 ring-1 ${statusBadge(item.status, loadPercent)}`}>
                        {statusLabel(item.status)}
                    </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={`h-full rounded-full ${loadBarColor(loadPercent)}`}
                        style={{ width: `${safeLoadPercent}%` }}
                    />
                </div>
            </td>

            <td className="min-w-[130px] px-4 py-4">
                <input
                    value={loadingPort}
                    disabled={isLocked || !itemId}
                    onChange={(event) => setLoadingPort(event.target.value)}
                    className={[
                        'h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10',
                        isLocked || !itemId
                            ? 'cursor-not-allowed bg-slate-100 text-slate-500'
                            : 'bg-white',
                    ].join(' ')}
                />
            </td>

            <td className="min-w-[130px] px-4 py-4">
                <input
                    value={dischargePort}
                    disabled={isLocked || !itemId}
                    onChange={(event) => setDischargePort(event.target.value)}
                    className={[
                        'h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10',
                        isLocked || !itemId
                            ? 'cursor-not-allowed bg-slate-100 text-slate-500'
                            : 'bg-white',
                    ].join(' ')}
                />
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                <div>LCG: {formatNumber(item.lcg, 2)}</div>
                <div>VCG: {formatNumber(item.vcg, 2)}</div>
                <div>TCG: {formatNumber(item.tcg, 2)}</div>
            </td>

            <td className="px-4 py-4">
                <form onSubmit={submit}>
                    <button
                        type="submit"
                        disabled={!itemId || saving || isLocked}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {isLocked
                            ? 'Iesniegts'
                            : saving
                                ? 'Saglabā...'
                                : !itemId
                                    ? 'Nav rindas'
                                    : 'Saglabāt'}
                    </button>
                </form>
            </td>
        </tr>
    );
}

export default function CargoPlanIndex({
    cargoPlan,
    vessel,
    summary,
    items,
    workspace,
}: CargoPlanIndexProps) {
    const { props } = usePage<CargoPlanPageProps>();

    const success = props.flash?.success;
    const error = props.flash?.error;
    const validationError =
        props.errors?.cargo_name ??
        props.errors?.weight_tonnes ??
        props.errors?.loading_port ??
        props.errors?.discharge_port;

    const cargoPlanData = {
        id: null,
        name: 'Nav kravas plāna',
        mode: 'training',
        status: 'active',
        ...cargoPlan,
    };

    const vesselData = {
        id: 0,
        name: 'Nav izvēlēts kuģis',
        type: '',
        imo_number: null,
        dwt: 0,
        ...vessel,
    };

    const summaryData = {
        total_cargo: 0,
        total_capacity: 0,
        load_percent: 0,
        holds_count: 0,
        warnings_count: 0,
        ...summary,
    };

    const rows = Array.isArray(items) ? items : [];
    const isLocked = Boolean(workspace?.is_locked);
    const warningCount = toNumber(summaryData.warnings_count);

    return (
        <AuthenticatedLayout
            title="Kravas plāns"
            subtitle="Kravas izvietošana pa tilpnēm un plāna validācija"
        >
            <Head title="Kravas plāns" />

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
                    <div
                        className={[
                            'rounded-2xl border px-4 py-3 text-sm font-medium',
                            isLocked
                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-800',
                        ].join(' ')}
                    >
                        {isLocked
                            ? 'Risinājums jau ir iesniegts. Kravas plānu vairs nevar mainīt.'
                            : 'Tu šobrīd rediģē studenta privāto risinājumu. Izmaiņas netiek saglabātas globālajos kuģa datos.'}
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
                                {cargoPlanData.name}
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šeit students vai pasniedzējs var pārbaudīt kravas sadalījumu
                                pa tilpnēm, mainīt kravas daudzumu un uzreiz redzēt aizpildījuma
                                procentu, statusu un masas centru pozīcijas.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Režīms
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {isLocked
                                    ? 'Iesniegts'
                                    : cargoPlanData.mode === 'training'
                                        ? 'Mācību režīms'
                                        : cargoPlanData.mode}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Kopējā krava"
                        value={`${formatNumber(summaryData.total_cargo)} t`}
                        description={`DWT: ${formatNumber(vesselData.dwt)} t`}
                        icon={PackageOpen}
                    />

                    <SummaryCard
                        title="Tilpņu noslodze"
                        value={`${formatNumber(summaryData.load_percent, 1)}%`}
                        description={`${formatNumber(summaryData.total_capacity)} t kopējā tilpņu kapacitāte`}
                        icon={TrendingUp}
                    />

                    <SummaryCard
                        title="Tilpņu skaits"
                        value={`${formatNumber(summaryData.holds_count, 0)}`}
                        description="Aktīvajā kuģa konfigurācijā"
                        icon={Ship}
                    />

                    <SummaryCard
                        title="Brīdinājumi"
                        value={`${formatNumber(warningCount, 0)}`}
                        description={
                            warningCount > 0
                                ? 'Ir tilpnes ar augstu noslodzi'
                                : 'Nav augstas noslodzes brīdinājumu'
                        }
                        icon={warningCount > 0 ? AlertTriangle : CheckCircle2}
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Kravas izvietojums pa tilpnēm
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {isLocked
                                ? 'Risinājums ir iesniegts, tāpēc kravas rindas ir tikai apskatāmas.'
                                : 'Maini tonnas un saglabā rindu. Pēc saglabāšanas dashboard pārrēķināsies automātiski.'}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1180px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Tilpne</th>
                                    <th className="px-4 py-3 font-semibold">Krava</th>
                                    <th className="px-4 py-3 font-semibold">Svars</th>
                                    <th className="px-4 py-3 font-semibold">Tilpums</th>
                                    <th className="px-4 py-3 font-semibold">Noslodze</th>
                                    <th className="px-4 py-3 font-semibold">Iekraušana</th>
                                    <th className="px-4 py-3 font-semibold">Izkraušana</th>
                                    <th className="px-4 py-3 font-semibold">Pozīcija</th>
                                    <th className="px-4 py-3 font-semibold">Darbība</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((item, index) => (
                                    <EditableCargoRow
                                        key={`${item.compartment_id ?? index}-${item.id ?? 'empty'}`}
                                        item={item}
                                        isLocked={isLocked}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {rows.length === 0 && (
                        <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                            Nav kravas plāna rindu.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}