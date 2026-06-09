import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    AlertTriangle,
    Download,
    FileText,
    PackageOpen,
    Scale,
    Ship,
    Waves,
} from 'lucide-react';

type CriterionStatus = 'pass' | 'warning' | 'fail';

type Report = {
    title: string;
    vessel_name: string;
    cargo_plan_name: string;
    generated_at: string;
    download_url: string;
    metrics: {
        displacement: number;
        cargo_weight: number;
        ballast_weight: number;
        gm: number;
        kg: number;
        km: number;
        trim: number;
        trim_direction: string;
        heel: number;
        max_gz: number;
        angle_at_max_gz: number;
    };
    criteria: {
        name: string;
        requirement: string;
        actual: string;
        status: CriterionStatus;
        comment: string;
    }[];
    cargo_rows: {
        hold: string;
        name: string;
        cargo_name: string;
        cargo_type: string;
        weight_tonnes: number;
        volume_m3: number;
        capacity_tonnes: number;
        load_percent: number;
        loading_port: string;
        discharge_port: string;
    }[];
    ballast_rows: {
        code: string;
        name: string;
        side: string;
        current_tonnes: number;
        capacity_tonnes: number;
        fill_percent: number;
        free_surface_risk: boolean;
    }[];
};

type ReportsIndexProps = {
    report: Report;
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

export default function ReportsIndex({ report }: ReportsIndexProps) {
    const failedCriteria = report.criteria.filter((item) => item.status === 'fail').length;
    const warningCriteria = report.criteria.filter((item) => item.status === 'warning').length;

    return (
        <AuthenticatedLayout
            title="Atskaites"
            subtitle="PDF pārskati par kravas plānu, balastu un stabilitāti"
        >
            <Head title="Atskaites" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <FileText className="h-4 w-4" />
                                Ģenerēts: {report.generated_at}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                {report.title}
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Pārskats apkopo aktīvo kuģi, kravas izvietojumu, balasta tanku
                                stāvokli un stabilitātes aprēķinu rezultātus. Šo PDF var izmantot
                                kā mācību darba nodošanas vai pasniedzēja pārbaudes materiālu.
                            </p>
                        </div>

                        <a
                            href={report.download_url}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                            <Download className="h-5 w-5" />
                            Lejupielādēt PDF
                        </a>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Kuģis"
                        value={report.vessel_name}
                        description={report.cargo_plan_name}
                        icon={Ship}
                    />

                    <SummaryCard
                        title="Displacement"
                        value={`${report.metrics.displacement.toLocaleString('lv-LV')} t`}
                        description={`Krava ${report.metrics.cargo_weight.toLocaleString('lv-LV')} t`}
                        icon={PackageOpen}
                    />

                    <SummaryCard
                        title="GM"
                        value={`${report.metrics.gm} m`}
                        description={`KG ${report.metrics.kg} m · KM ${report.metrics.km} m`}
                        icon={Scale}
                    />

                    <SummaryCard
                        title="Kritēriji"
                        value={`${report.criteria.length - failedCriteria}/${report.criteria.length}`}
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
                                    {report.criteria.map((criterion) => (
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Waves className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    PDF saturs
                                </h3>
                            </div>

                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    Kuģa pamatdati un aktīvā kravas plāna nosaukums
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    GM, KG, KM, displacement, trims, sasvērums un iegrimes
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    Stabilitātes kritēriju tabula ar statusiem
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    Kravas plāna un balasta tanku tabulas
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                            <strong>Piezīme:</strong> šis ir mācību simulatora PDF.
                            Vēlāk varēsim pievienot grafikus kā attēlus, pasniedzēja komentārus,
                            studenta vārdu, scenārija nosaukumu un automātisku vērtējumu.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}