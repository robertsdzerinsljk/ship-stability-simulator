import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
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
    id: number | null;
    name: string;
    mode: string;
    status: string;
};

type Vessel = {
    id: number;
    name: string;
    type?: string;
    imo_number?: string;
    dwt: number;
};

type Summary = {
    total_cargo: number;
    total_capacity: number;
    load_percent: number;
    holds_count: number;
    warnings_count: number;
};

type CargoPlanItem = {
    id: number | null;
    compartment_id: number;
    hold_name: string;
    hold_code: string;
    cargo_name: string;
    cargo_type?: string;
    weight_tonnes: number;
    volume_m3: number;
    capacity_tonnes: number;
    capacity_m3: number;
    load_percent: number;
    lcg: number;
    vcg: number;
    tcg: number;
    loading_port?: string;
    discharge_port?: string;
    status: string;
};

type CargoPlanIndexProps = {
    cargoPlan: CargoPlan;
    vessel: Vessel;
    summary: Summary;
    items: CargoPlanItem[];
};

type CargoPlanPageProps = PageProps<{
    flash?: {
        success?: string;
    };
}>;

function statusBadge(status: string) {
    if (status === 'Pārslogots') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

    if (status === 'Pilns' || status === 'Brīdinājums') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    if (status === 'Pieņemams') {
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
    icon: typeof PackageOpen;
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

function EditableCargoRow({ item }: { item: CargoPlanItem }) {
    const [cargoName, setCargoName] = useState(item.cargo_name);
    const [weightTonnes, setWeightTonnes] = useState(String(item.weight_tonnes));
    const [loadingPort, setLoadingPort] = useState(item.loading_port ?? '');
    const [dischargePort, setDischargePort] = useState(item.discharge_port ?? '');
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!item.id) {
            return;
        }

        setSaving(true);

        router.patch(
            `/cargo-plan/items/${item.id}`,
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
                <div className="font-semibold text-slate-950">{item.hold_code}</div>
                <div className="text-xs text-slate-500">{item.hold_name}</div>
            </td>

            <td className="min-w-[180px] px-4 py-4">
                <input
                    value={cargoName}
                    onChange={(event) => setCargoName(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
                <p className="mt-1 text-xs text-slate-500">
                    Tips: {item.cargo_type ?? 'nav norādīts'}
                </p>
            </td>

            <td className="min-w-[140px] px-4 py-4">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={weightTonnes}
                    onChange={(event) => setWeightTonnes(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
                <p className="mt-1 text-xs text-slate-500">
                    Max: {item.capacity_tonnes.toLocaleString('lv-LV')} t
                </p>
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                {item.volume_m3.toLocaleString('lv-LV')} m³
            </td>

            <td className="min-w-[180px] px-4 py-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                        {item.load_percent}%
                    </span>
                    <span className={`rounded-full px-2 py-1 ring-1 ${statusBadge(item.status)}`}>
                        {item.status}
                    </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={`h-full rounded-full ${loadBarColor(item.load_percent)}`}
                        style={{ width: `${Math.min(item.load_percent, 100)}%` }}
                    />
                </div>
            </td>

            <td className="min-w-[130px] px-4 py-4">
                <input
                    value={loadingPort}
                    onChange={(event) => setLoadingPort(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
            </td>

            <td className="min-w-[130px] px-4 py-4">
                <input
                    value={dischargePort}
                    onChange={(event) => setDischargePort(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                <div>LCG: {item.lcg}</div>
                <div>VCG: {item.vcg}</div>
                <div>TCG: {item.tcg}</div>
            </td>

            <td className="px-4 py-4">
                <form onSubmit={submit}>
                    <button
                        type="submit"
                        disabled={!item.id || saving}
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

export default function CargoPlanIndex({
    cargoPlan,
    vessel,
    summary,
    items,
}: CargoPlanIndexProps) {
    const { props } = usePage<CargoPlanPageProps>();
    const success = props.flash?.success;

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

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <Ship className="h-4 w-4" />
                                {vessel.name} · IMO {vessel.imo_number ?? 'nav norādīts'}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                {cargoPlan.name}
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
                                {cargoPlan.mode === 'training' ? 'Mācību režīms' : cargoPlan.mode}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Kopējā krava"
                        value={`${summary.total_cargo.toLocaleString('lv-LV')} t`}
                        description={`DWT: ${vessel.dwt.toLocaleString('lv-LV')} t`}
                        icon={PackageOpen}
                    />

                    <SummaryCard
                        title="Tilpņu noslodze"
                        value={`${summary.load_percent}%`}
                        description={`${summary.total_capacity.toLocaleString('lv-LV')} t kopējā tilpņu kapacitāte`}
                        icon={TrendingUp}
                    />

                    <SummaryCard
                        title="Tilpņu skaits"
                        value={`${summary.holds_count}`}
                        description="Aktīvajā kuģa konfigurācijā"
                        icon={Ship}
                    />

                    <SummaryCard
                        title="Brīdinājumi"
                        value={`${summary.warnings_count}`}
                        description={
                            summary.warnings_count > 0
                                ? 'Ir tilpnes ar augstu noslodzi'
                                : 'Nav augstas noslodzes brīdinājumu'
                        }
                        icon={summary.warnings_count > 0 ? AlertTriangle : CheckCircle2}
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Kravas izvietojums pa tilpnēm
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Maini tonnas un saglabā rindu. Pēc saglabāšanas dashboard pārrēķināsies automātiski.
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
                                {items.map((item) => (
                                    <EditableCargoRow key={item.compartment_id} item={item} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}