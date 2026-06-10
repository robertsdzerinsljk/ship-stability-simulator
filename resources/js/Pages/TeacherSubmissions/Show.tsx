import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    ClipboardCheck,
    GraduationCap,
    PackageOpen,
    Save,
    Scale,
    Ship,
    User,
    Waves,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type CriterionStatus = 'pass' | 'warning' | 'fail' | string;

type SubmissionDetail = {
    id: number;
    status?: string | null;
    score?: number | string | null;
    student_comment?: string | null;
    teacher_comment?: string | null;
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
        task_text?: string | null;
    };

    vessel?: {
        id?: number | null;
        name?: string | null;
        type?: string | null;
        imo_number?: string | null;
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

type TeacherSubmissionShowProps = {
    submission?: SubmissionDetail;
};

type TeacherSubmissionPageProps = PageProps<{
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
    if (status === 'graded') {
        return 'Novērtēts';
    }

    if (status === 'submitted') {
        return 'Gaida vērtējumu';
    }

    return status ?? 'Nav statusa';
}

function submissionStatusBadge(status?: string | null) {
    if (status === 'graded') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (status === 'submitted') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-slate-50 text-slate-700 ring-slate-100';
}

function criterionStatusLabel(status?: CriterionStatus) {
    if (status === 'fail') {
        return 'Neatbilst';
    }

    if (status === 'warning') {
        return 'Jāpārbauda';
    }

    if (status === 'pass') {
        return 'Atbilst';
    }

    return status ?? '-';
}

function criterionStatusBadge(status?: CriterionStatus) {
    if (status === 'fail') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

    if (status === 'warning') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    if (status === 'pass') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    return 'bg-slate-50 text-slate-700 ring-slate-100';
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

export default function TeacherSubmissionShow({
    submission,
}: TeacherSubmissionShowProps) {
    const { props } = usePage<TeacherSubmissionPageProps>();

    const success = props.flash?.success;
    const error = props.flash?.error;
    const scoreError = props.errors?.score;
    const commentError = props.errors?.teacher_comment;

    const data = {
        id: 0,
        status: 'submitted',
        score: null,
        student_comment: null,
        teacher_comment: '',
        submitted_at: '-',
        student: {
            name: '-',
            email: '-',
        },
        scenario: {
            title: '-',
            difficulty: '-',
            mode: '-',
            task_text: null,
        },
        vessel: {
            name: '-',
            type: '-',
            imo_number: '-',
        },
        metrics: {},
        criteria: [],
        hold_loads: [],
        cargo_items: [],
        ballast_tanks: [],
        ...submission,
    };

    const metrics = {
        displacement: 0,
        cargo_weight: 0,
        ballast_weight: 0,
        lightship_weight: 0,
        kg: 0,
        km: 0,
        gm: 0,
        free_surface_correction: 0,
        trim: 0,
        trim_direction: '-',
        heel: 0,
        fore_draft: 0,
        aft_draft: 0,
        mean_draft: 0,
        max_gz: 0,
        angle_at_max_gz: 0,
        ...data.metrics,
    };

    const criteria = Array.isArray(data.criteria) ? data.criteria : [];
    const holdLoads = Array.isArray(data.hold_loads) ? data.hold_loads : [];
    const cargoItems = Array.isArray(data.cargo_items) ? data.cargo_items : [];
    const ballastTanks = Array.isArray(data.ballast_tanks) ? data.ballast_tanks : [];

    const failedCriteria = criteria.filter((item) => item.status === 'fail');
    const warningCriteria = criteria.filter((item) => item.status === 'warning');
    const passedCriteria = criteria.filter((item) => item.status === 'pass');

    const [score, setScore] = useState(
        data.score !== null && data.score !== undefined ? String(data.score) : '',
    );
    const [teacherComment, setTeacherComment] = useState(data.teacher_comment ?? '');
    const [saving, setSaving] = useState(false);

    const submitGrade = (event: FormEvent) => {
        event.preventDefault();

        setSaving(true);

        router.patch(
            `/teacher/submissions/${data.id}/grade`,
            {
                score,
                teacher_comment: teacherComment,
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <AuthenticatedLayout
            title="Iesnieguma vērtēšana"
            subtitle="Studenta stabilitātes risinājuma snapshot analīze"
        >
            <Head title="Iesnieguma vērtēšana" />

            <div className="space-y-6">
                <Link
                    href="/teacher/submissions"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Atpakaļ uz iesniegumiem
                </Link>

                {success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {success}
                    </div>
                )}

                {(error || scoreError || commentError) && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error ?? scoreError ?? commentError}
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${submissionStatusBadge(data.status)}`}>
                                    {statusLabel(data.status)}
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    Iesniegts: {data.submitted_at ?? '-'}
                                </span>

                                {data.score !== null && data.score !== undefined && (
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                                        Vērtējums: {formatNumber(data.score, 1)}/10
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                {data.scenario?.title ?? '-'}
                            </h2>

                            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span>
                                        {data.student?.name ?? '-'} · {data.student?.email ?? '-'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Ship className="h-4 w-4 text-slate-400" />
                                    <span>
                                        {data.vessel?.name ?? '-'} · IMO {data.vessel?.imo_number ?? '-'}
                                    </span>
                                </div>
                            </div>

                            {data.scenario?.task_text && (
                                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                    <strong className="text-slate-950">Uzdevuma apraksts:</strong>
                                    <br />
                                    {data.scenario.task_text}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Kritēriji
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {passedCriteria.length}/{criteria.length} atbilst
                            </p>
                        </div>
                    </div>
                </div>

                {(failedCriteria.length > 0 || warningCriteria.length > 0) && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>
                                <p className="font-semibold">
                                    Šajā iesniegumā ir kritēriji, kuriem jāpievērš uzmanība.
                                </p>
                                <p className="mt-1">
                                    Neatbilst: {failedCriteria.length} · Brīdinājumi: {warningCriteria.length}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                        title="Trim"
                        value={`${formatNumber(metrics.trim, 3)} m`}
                        description={metrics.trim_direction ?? '-'}
                        icon={Ship}
                    />

                    <SummaryCard
                        title="Heel"
                        value={`${formatNumber(metrics.heel, 3)}°`}
                        description={`FSC ${formatNumber(metrics.free_surface_correction, 4)} m`}
                        icon={Waves}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h3 className="text-base font-semibold text-slate-950">
                                Kritēriju pārbaude
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Kritēriji ir saglabāti snapshot brīdī, kad students iesniedza darbu.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left">
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
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${criterionStatusBadge(criterion.status)}`}>
                                                    {criterionStatusLabel(criterion.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {criterion.comment ?? '-'}
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
                        <form
                            onSubmit={submitGrade}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    Vērtēšana
                                </h3>
                            </div>

                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">
                                    Vērtējums 0–10
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={score}
                                    onChange={(event) => setScore(event.target.value)}
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                                />
                            </label>

                            <label className="mt-4 block">
                                <span className="text-sm font-medium text-slate-700">
                                    Pasniedzēja komentārs
                                </span>
                                <textarea
                                    value={teacherComment}
                                    onChange={(event) => setTeacherComment(event.target.value)}
                                    rows={6}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                                    placeholder="Komentārs studentam par stabilitāti, kravas izvietojumu, balastu un kļūdām..."
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Saglabā...' : 'Saglabāt vērtējumu'}
                            </button>
                        </form>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    Studenta komentārs
                                </h3>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                {data.student_comment || 'Students komentāru nav pievienojis.'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Kravas snapshot
                        </h3>
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
                            Nav kravas snapshot datu.
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Balasta snapshot
                        </h3>
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
                            Nav balasta snapshot datu.
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