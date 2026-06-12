import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import {
    ArrowLeft,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    FileText,
    PackageOpen,
    Play,
    Scale,
    Ship,
    Waves,
} from 'lucide-react';
import { useState } from 'react';

type Assignment = {
    id: number;
    status?: string | null;
    assigned_at?: string | null;
    started_at?: string | null;
    submitted_at?: string | null;
    due_at?: string | null;
    is_assigned?: boolean;
    is_in_progress?: boolean;
    is_submitted?: boolean;
    is_graded?: boolean;
    student_group?: {
        id?: number | null;
        name?: string | null;
        code?: string | null;
        academic_year?: string | null;
    } | null;
    scenario?: {
        id?: number | null;
        title?: string | null;
        description?: string | null;
        difficulty?: string | null;
        mode?: string | null;
    };
    vessel?: {
        id?: number | null;
        name?: string | null;
        type?: string | null;
        imo_number?: string | null;
    };
    submission?: {
        id?: number | null;
        status?: string | null;
        submitted_at?: string | null;
        score?: number | string | null;
        teacher_comment?: string | null;
        has_feedback?: boolean;
    } | null;
};

type StudentTasksShowProps = {
    assignment: Assignment;
};

type StudentTasksPageProps = PageProps<{
    flash?: {
        success?: string;
        error?: string;
    };
}>;

function toNumber(value: number | string | null | undefined) {
    const number = Number(value ?? 0);

    return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: number | string | null | undefined, digits = 1) {
    return toNumber(value).toLocaleString('lv-LV', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

function statusLabel(status?: string | null) {
    if (status === 'assigned') {
        return 'Piešķirts';
    }

    if (status === 'in_progress') {
        return 'Risināšanā';
    }

    if (status === 'submitted') {
        return 'Iesniegts';
    }

    if (status === 'graded') {
        return 'Novērtēts';
    }

    return status ?? 'Nav statusa';
}

function statusBadge(status?: string | null) {
    if (status === 'graded') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (status === 'submitted') {
        return 'bg-blue-50 text-blue-700 ring-blue-100';
    }

    if (status === 'in_progress') {
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

export default function StudentTasksShow({ assignment }: StudentTasksShowProps) {
    const { props } = usePage<StudentTasksPageProps>();
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isAssigned = assignment.status === 'assigned';
    const isInProgress = assignment.status === 'in_progress';
    const isSubmitted = assignment.status === 'submitted';
    const isGraded = assignment.status === 'graded';
    const isLocked = isSubmitted || isGraded;
    const score = assignment.submission?.score;

    const startTask = () => {
        setStarting(true);

        router.post(
            `/student/tasks/${assignment.id}/start`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setStarting(false),
            },
        );
    };

    const submitTask = () => {
        if (!confirm('Vai tiešām iesniegt darbu? Pēc iesniegšanas kravu un balastu vairs nevarēs labot.')) {
            return;
        }

        setSubmitting(true);

        router.post(
            `/student/tasks/${assignment.id}/submit`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <AuthenticatedLayout
            title="Uzdevums"
            subtitle="Studenta piešķirtā scenārija darba skats"
        >
            <Head title={assignment.scenario?.title ?? 'Uzdevums'} />

            <div className="space-y-6">
                {props.flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {props.flash.success}
                    </div>
                )}

                {props.flash?.error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {props.flash.error}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/student/tasks"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ uz uzdevumiem
                    </Link>

                    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(assignment.status)}`}>
                        {statusLabel(assignment.status)}
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {difficultyLabel(assignment.scenario?.difficulty)}
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {assignment.scenario?.mode ?? '-'}
                                </span>

                                {assignment.student_group && (
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                        {assignment.student_group.name}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                {assignment.scenario?.title ?? 'Uzdevums'}
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                {assignment.scenario?.description ??
                                    'Veic kravas plāna, balasta un stabilitātes pārbaudi atbilstoši piešķirtajam scenārijam.'}
                            </p>
                        </div>

                        {isAssigned && (
                            <button
                                type="button"
                                onClick={startTask}
                                disabled={starting}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Play className="h-5 w-5" />
                                {starting ? 'Sāk...' : 'Sākt uzdevumu'}
                            </button>
                        )}

                        {isInProgress && (
                            <button
                                type="button"
                                onClick={submitTask}
                                disabled={submitting}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <ClipboardCheck className="h-5 w-5" />
                                {submitting ? 'Iesniedz...' : 'Iesniegt darbu'}
                            </button>
                        )}
                    </div>
                </div>

                {isGraded && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                    Darbs novērtēts
                                </p>

                                <h3 className="mt-2 text-2xl font-semibold text-emerald-950">
                                    {score !== null && score !== undefined
                                        ? `${formatNumber(score, 1)} / 10`
                                        : 'Bez skaitliska vērtējuma'}
                                </h3>

                                {assignment.submission?.teacher_comment ? (
                                    <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-emerald-100">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                            Pasniedzēja komentārs
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-emerald-950">
                                            {assignment.submission.teacher_comment}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-emerald-800">
                                        Pasniedzējs nav pievienojis komentāru.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isSubmitted && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800 shadow-sm">
                        Darbs ir iesniegts un gaida pasniedzēja vērtējumu. Kravas un balasta dati ir slēgti labošanai.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <Ship className="h-5 w-5 text-slate-500" />
                        <p className="mt-3 text-sm text-slate-500">Kuģis</p>
                        <p className="mt-1 font-semibold text-slate-950">{assignment.vessel?.name ?? '-'}</p>
                        <p className="mt-1 text-xs text-slate-500">IMO {assignment.vessel?.imo_number ?? '-'}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <ClipboardList className="h-5 w-5 text-slate-500" />
                        <p className="mt-3 text-sm text-slate-500">Termiņš</p>
                        <p className="mt-1 font-semibold text-slate-950">{assignment.due_at ?? '-'}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <p className="mt-3 text-sm text-slate-500">Iesniegts</p>
                        <p className="mt-1 font-semibold text-slate-950">
                            {assignment.submission?.submitted_at ?? assignment.submitted_at ?? '-'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <Scale className="h-5 w-5 text-slate-500" />
                        <p className="mt-3 text-sm text-slate-500">Statuss</p>
                        <p className="mt-1 font-semibold text-slate-950">{statusLabel(assignment.status)}</p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Link
                        href="/cargo-plan"
                        className={[
                            'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                            isAssigned ? 'pointer-events-none opacity-50' : '',
                        ].join(' ')}
                    >
                        <PackageOpen className="h-6 w-6 text-slate-700" />
                        <h3 className="mt-4 font-semibold text-slate-950">
                            Kravas plāns
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Pārbaudi kravas izvietojumu pa tilpnēm un kopējo noslodzi.
                        </p>
                        {isLocked && (
                            <p className="mt-3 text-xs font-medium text-slate-500">
                                Slēgts pēc iesniegšanas.
                            </p>
                        )}
                    </Link>

                    <Link
                        href="/ballast"
                        className={[
                            'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                            isAssigned ? 'pointer-events-none opacity-50' : '',
                        ].join(' ')}
                    >
                        <Waves className="h-6 w-6 text-slate-700" />
                        <h3 className="mt-4 font-semibold text-slate-950">
                            Balasts
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Regulē balasta tankus un pārbaudi brīvās virsmas riskus.
                        </p>
                        {isLocked && (
                            <p className="mt-3 text-xs font-medium text-slate-500">
                                Slēgts pēc iesniegšanas.
                            </p>
                        )}
                    </Link>

                    <Link
                        href="/stability"
                        className={[
                            'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                            isAssigned ? 'pointer-events-none opacity-50' : '',
                        ].join(' ')}
                    >
                        <Scale className="h-6 w-6 text-slate-700" />
                        <h3 className="mt-4 font-semibold text-slate-950">
                            Stabilitāte
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Apskati GM, trimu, sasvēruma riskus un stabilitātes kritērijus.
                        </p>
                    </Link>
                </div>

                {isAssigned && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                        Lai sāktu darbu ar kravas plānu, balastu un stabilitāti, vispirms nospied pogu “Sākt uzdevumu”.
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}