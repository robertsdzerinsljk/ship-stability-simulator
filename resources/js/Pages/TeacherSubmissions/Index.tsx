import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Eye,
    GraduationCap,
    Scale,
    Ship,
    User,
} from 'lucide-react';

type Stats = {
    total?: number | string | null;
    pending?: number | string | null;
    graded?: number | string | null;
    average_score?: number | string | null;
};

type SubmissionItem = {
    id: number;
    status?: string | null;
    score?: number | string | null;
    submitted_at?: string | null;
    student?: {
        id?: number | null;
        name?: string | null;
        email?: string | null;
    };
    scenario?: {
        id?: number | null;
        title?: string | null;
        difficulty?: string | null;
        mode?: string | null;
    };
    vessel?: {
        id?: number | null;
        name?: string | null;
        type?: string | null;
        imo_number?: string | null;
    };
    metrics?: {
        displacement?: number | string | null;
        gm?: number | string | null;
        kg?: number | string | null;
        trim?: number | string | null;
        heel?: number | string | null;
        fore_draft?: number | string | null;
        aft_draft?: number | string | null;
    };
    criteria_summary?: {
        total?: number | string | null;
        pass?: number | string | null;
        warning?: number | string | null;
        fail?: number | string | null;
    };
};

type TeacherSubmissionsIndexProps = {
    stats?: Stats;
    submissions?: SubmissionItem[];
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

function statusLabel(status?: string | null) {
    if (status === 'graded') {
        return 'Novērtēts';
    }

    if (status === 'submitted') {
        return 'Gaida vērtējumu';
    }

    return status ?? 'Nav statusa';
}

function statusBadge(status?: string | null) {
    if (status === 'graded') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (status === 'submitted') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-slate-50 text-slate-700 ring-slate-100';
}

function difficultyLabel(value?: string | null) {
    if (value === 'easy') {
        return 'Viegls';
    }

    if (value === 'medium') {
        return 'Vidējs';
    }

    if (value === 'hard') {
        return 'Sarežģīts';
    }

    if (value === 'exam') {
        return 'Eksāmens';
    }

    return value ?? '-';
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

function SubmissionCard({ submission }: { submission: SubmissionItem }) {
    const metrics = submission.metrics ?? {};
    const criteria = submission.criteria_summary ?? {};
    const failCount = toNumber(criteria.fail);
    const warningCount = toNumber(criteria.warning);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(submission.status)}`}>
                            {statusLabel(submission.status)}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {difficultyLabel(submission.scenario?.difficulty)}
                        </span>

                        {submission.score !== null && submission.score !== undefined && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                                Vērtējums: {formatNumber(submission.score, 1)}/10
                            </span>
                        )}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-950">
                        {submission.scenario?.title ?? '-'}
                    </h3>

                    <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span>
                                {submission.student?.name ?? '-'} · {submission.student?.email ?? '-'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Ship className="h-4 w-4 text-slate-400" />
                            <span>
                                {submission.vessel?.name ?? '-'} · IMO {submission.vessel?.imo_number ?? '-'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>Iesniegts: {submission.submitted_at ?? '-'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-slate-400" />
                            <span>
                                GM {formatNumber(metrics.gm, 3)} m · Trim {formatNumber(metrics.trim, 3)} m · Heel {formatNumber(metrics.heel, 3)}°
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Displacement</p>
                            <p className="mt-1 font-semibold text-slate-950">
                                {formatNumber(metrics.displacement)} t
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">KG</p>
                            <p className="mt-1 font-semibold text-slate-950">
                                {formatNumber(metrics.kg, 3)} m
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Warnings</p>
                            <p className="mt-1 font-semibold text-amber-700">
                                {formatNumber(warningCount, 0)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Fails</p>
                            <p className="mt-1 font-semibold text-red-700">
                                {formatNumber(failCount, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <Link
                    href={`/teacher/submissions/${submission.id}`}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    <Eye className="h-4 w-4" />
                    Atvērt vērtēšanu
                </Link>
            </div>
        </div>
    );
}

export default function TeacherSubmissionsIndex({
    stats,
    submissions,
}: TeacherSubmissionsIndexProps) {
    const statsData = {
        total: 0,
        pending: 0,
        graded: 0,
        average_score: null,
        ...stats,
    };

    const rows = Array.isArray(submissions) ? submissions : [];

    return (
        <AuthenticatedLayout
            title="Iesniegumi"
            subtitle="Studentu iesniegto stabilitātes risinājumu pārskats"
        >
            <Head title="Iesniegumi" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-950">
                                Studentu iesniegumi
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šeit redzami iesniegtie risinājumi. Katrs ieraksts balstās uz
                                iesniegšanas brīdī saglabātu stabilitātes snapshot, tāpēc
                                vērtēšana nav atkarīga no vēlākām izmaiņām darba vidē.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Kopā
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {formatNumber(statsData.total, 0)} iesniegumi
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Kopā"
                        value={formatNumber(statsData.total, 0)}
                        description="Visi iesniegtie darbi"
                        icon={GraduationCap}
                    />

                    <SummaryCard
                        title="Gaida vērtējumu"
                        value={formatNumber(statsData.pending, 0)}
                        description="Statuss: submitted"
                        icon={Clock}
                    />

                    <SummaryCard
                        title="Novērtēti"
                        value={formatNumber(statsData.graded, 0)}
                        description="Statuss: graded"
                        icon={CheckCircle2}
                    />

                    <SummaryCard
                        title="Vidējais vērtējums"
                        value={
                            statsData.average_score === null || statsData.average_score === undefined
                                ? '-'
                                : `${formatNumber(statsData.average_score, 2)}/10`
                        }
                        description="Aprēķināts no novērtētajiem darbiem"
                        icon={Scale}
                    />
                </div>

                <div className="space-y-4">
                    {rows.map((submission) => (
                        <SubmissionCard
                            key={submission.id}
                            submission={submission}
                        />
                    ))}
                </div>

                {rows.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <AlertTriangle className="mx-auto h-8 w-8 text-slate-400" />
                        <h3 className="mt-3 text-base font-semibold text-slate-950">
                            Iesniegumi vēl nav atrasti
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Kad studenti iesniegs savus risinājumus, tie parādīsies šajā sarakstā.
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}