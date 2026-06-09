import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Anchor,
    Database,
    ExternalLink,
    Info,
    Layers,
    Ruler,
    Scale,
    Ship,
} from 'lucide-react';

type Vessel = {
    id: number;
    name: string;
    imo_number?: string;
    mmsi?: string;
    type?: string;
    flag?: string;
    class?: string;
    operator?: string;
    built_year?: number;
    length_overall: number;
    length_between_perpendiculars: number;
    breadth: number;
    depth: number;
    summer_draft: number;
    dwt: number;
    gt: number;
    lightship_weight: number;
    km_default: number;
    is_real_vessel: boolean;
    data_source_name?: string;
    data_source_url?: string;
    data_confidence?: string;
    data_notes?: string;
    hydrostatic_notes?: string;
    compartments_count: number;
    ballast_tanks_count: number;
    cargo_plans_count: number;
    scenarios_count: number;
};

type TypeSummary = {
    type: string;
    count: number;
};

type VesselsIndexProps = {
    vessels: Vessel[];
    typeSummary: TypeSummary[];
};

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: typeof Ship;
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

function formatNumber(value?: number, decimals = 2) {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return '-';
    }

    return value.toLocaleString('lv-LV', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function VesselCard({ vessel }: { vessel: Vessel }) {
    const sourceLinks = (vessel.data_source_url ?? '')
        .split('|')
        .map((url) => url.trim())
        .filter(Boolean);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {vessel.type ?? 'Nav tipa'}
                        </span>

                        {vessel.is_real_vessel && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                                Reāls publisks kuģis
                            </span>
                        )}

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                            Training model
                        </span>
                    </div>

                    <h3 className="text-xl font-semibold text-slate-950">
                        {vessel.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        IMO {vessel.imo_number ?? '-'} · MMSI {vessel.mmsi ?? '-'} · {vessel.flag ?? '-'}
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        Built
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                        {vessel.built_year ?? '-'}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                        <Ruler className="h-3.5 w-3.5" />
                        LOA / Beam
                    </div>
                    <div className="font-semibold text-slate-950">
                        {formatNumber(vessel.length_overall)} m / {formatNumber(vessel.breadth)} m
                    </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                        <Scale className="h-3.5 w-3.5" />
                        DWT / GT
                    </div>
                    <div className="font-semibold text-slate-950">
                        {formatNumber(vessel.dwt, 0)} t / {formatNumber(vessel.gt, 0)}
                    </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                        <Anchor className="h-3.5 w-3.5" />
                        Draft / KM
                    </div>
                    <div className="font-semibold text-slate-950">
                        {formatNumber(vessel.summer_draft)} m / {formatNumber(vessel.km_default, 3)} m
                    </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                        <Layers className="h-3.5 w-3.5" />
                        Modelis
                    </div>
                    <div className="font-semibold text-slate-950">
                        {vessel.compartments_count} nodalījumi · {vessel.ballast_tanks_count} tanki
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <Database className="h-4 w-4" />
                        Datu avots
                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                        {vessel.data_source_name ?? 'Nav norādīts'}
                    </p>

                    {sourceLinks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {sourceLinks.map((url, index) => (
                                <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                >
                                    Avots {index + 1}
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
                        <Info className="h-4 w-4" />
                        Aproksimācijas piezīme
                    </div>

                    <p className="text-sm leading-6 text-amber-800">
                        {vessel.hydrostatic_notes ?? 'Šim kuģim nav pievienota hidrostatiskā piezīme.'}
                    </p>
                </div>
            </div>

            {vessel.data_notes && (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                    {vessel.data_notes}
                </p>
            )}
        </div>
    );
}

export default function VesselsIndex({
    vessels,
    typeSummary,
}: VesselsIndexProps) {
    return (
        <AuthenticatedLayout
            title="Kuģi"
            subtitle="Reālu kuģu publiskie pamatdati un simulatora mācību modeļi"
        >
            <Head title="Kuģi" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <Ship className="h-4 w-4" />
                                Vessel database
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                Reālu kuģu datubāze
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šajā sadaļā tiek glabāti publiski pieejami kuģu pamatdati.
                                Simulatora vajadzībām katram kuģim pievienots arī mācību nodalījumu,
                                balasta un stabilitātes modelis.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Aktīvie kuģi
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {vessels.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Kuģi"
                        value={`${vessels.length}`}
                        description="Aktīvi simulatora datubāzē"
                        icon={Ship}
                    />

                    <SummaryCard
                        title="Tipi"
                        value={`${typeSummary.length}`}
                        description="Container, bulk, tanker, Ro-Ro"
                        icon={Layers}
                    />

                    <SummaryCard
                        title="Reāli dati"
                        value={`${vessels.filter((item) => item.is_real_vessel).length}`}
                        description="Balstīti uz publiskiem avotiem"
                        icon={Database}
                    />

                    <SummaryCard
                        title="Mācību modeļi"
                        value={`${vessels.reduce((sum, item) => sum + item.compartments_count, 0)}`}
                        description="Nodalījumi visiem kuģiem kopā"
                        icon={Anchor}
                    />
                </div>

                <div className="grid gap-4">
                    {vessels.map((vessel) => (
                        <VesselCard key={vessel.id} vessel={vessel} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}