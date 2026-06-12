import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileCheck2,
    GraduationCap,
    Ship,
} from 'lucide-react';

type Stats = {
    total?: number | string | null;
    assigned?: number | string | null;
    in_progress?: number | string | null;
    submitted?: number | string | null;
    graded?: number | string | null;
};

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

type StudentTasksIndexProps = {
    stats?: Stats;
    assignments?: Assignment[];
};

function toNumber(value: number | string | null | undefined) {
    const number = Number(value ?? 0);

    return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: number | string | null | undefined, digits = 0) {
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

function StatCard({
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

function AssignmentCard({ assignment }: { assignment: Assignment }) {
    const isGraded = assignment.status === 'graded';
    const isSubmitted = assignment.status === 'submitted';
    const isInProgress = assignment.status === 'in_progress';
    const score = assignment.submission?.score;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(assignment.status)}`}>
                            {statusLabel(assignment.status)}
                        </span>

                        {assignment.student_group && (
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-100">
                                {assignment.student_group.name}
                            </span>
                        )}

                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-100">
                            {difficultyLabel(assignment.scenario?.difficulty)}
                        </span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-950">
                        {assignment.scenario?.title ?? 'Uzdevums'}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                        Kuģis: <span className="font-medium text-slate-800">{assignment.vessel?.name ?? '-'}</span>
                        {assignment.vessel?.imo_number ? ` · IMO ${assignment.vessel.imo_number}` : ''}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                            <p className="text-xs text-slate-400">Piešķirts</p>
                            <p className="mt-1 font-medium text-slate-800">{assignment.assigned_at ?? '-'}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                            <p className="text-xs text-slate-400">Termiņš</p>
                            <p className="mt-1 font-medium text-slate-800">{assignment.due_at ?? '-'}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                            <p className="text-xs text-slate-400">Iesniegts</p>
                            <p className="mt-1 font-medium text-slate-800">
                                {assignment.submission?.submitted_at ?? assignment.submitted_at ?? '-'}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                            <p className="text-xs text-slate-400">Vērtējums</p>
                            <p className="mt-1 font-medium text-slate-800">
                                {score !== null && score !== undefined ? `${formatNumber(score, 1)}/10` : '-'}
                            </p>
                        </div>
                    </div>

                    {isGraded && assignment.submission?.teacher_comment && (
                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Pasniedzēja komentārs
                            </p>
                            <p className="mt-2 text-sm leading-6 text-emerald-900">
                                {assignment.submission.teacher_comment}
                            </p>
                        </div>
                    )}

                    {isSubmitted && !isGraded && (
                        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                            Darbs ir iesniegts un gaida pasniedzēja vērtējumu.
                        </div>
                    )}

                    {isInProgress && (
                        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                            Darbs ir sākts. Turpini kravas, balasta un stabilitātes pārbaudi.
                        </div>
                    )}
                </div>

                <Link
                    href={`/student/tasks/${assignment.id}`}
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    Atvērt
                </Link>
            </div>
        </div>
    );
}

export default function StudentTasksIndex({ stats, assignments }: StudentTasksIndexProps) {
    const assignmentRows = Array.isArray(assignments) ? assignments : [];

    const statsData = {
        total: 0,
        assigned: 0,
        in_progress: 0,
        submitted: 0,
        graded: 0,
        ...stats,
    };

    return (
        <AuthenticatedLayout
            title="Mani uzdevumi"
            subtitle="Pasniedzēja piešķirtie stabilitātes simulatora uzdevumi"
        >
            <Head title="Mani uzdevumi" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-950">
                                Mani uzdevumi
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šeit redzami tikai tev piešķirtie scenāriji. Katram uzdevumam ir savs
                                privātais darba risinājums, kuru pēc iesniegšanas vairs nevar labot.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Progress
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {formatNumber(statsData.graded)} / {formatNumber(statsData.total)} novērtēti
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Kopā"
                        value={formatNumber(statsData.total)}
                        description="Visi tev piešķirtie uzdevumi"
                        icon={ClipboardList}
                    />

                    <StatCard
                        title="Risināšanā"
                        value={formatNumber(statsData.in_progress)}
                        description="Uzdevumi, kurus jau sāki"
                        icon={Clock}
                    />

                    <StatCard
                        title="Iesniegti"
                        value={formatNumber(statsData.submitted)}
                        description="Gaida pasniedzēja vērtējumu"
                        icon={FileCheck2}
                    />

                    <StatCard
                        title="Novērtēti"
                        value={formatNumber(statsData.graded)}
                        description="Darbi ar vērtējumu un komentāru"
                        icon={CheckCircle2}
                    />
                </div>

                <div className="space-y-4">
                    {assignmentRows.map((assignment) => (
                        <AssignmentCard key={assignment.id} assignment={assignment} />
                    ))}

                    {assignmentRows.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                            <GraduationCap className="mx-auto h-10 w-10 text-slate-400" />
                            <h3 className="mt-4 font-semibold text-slate-950">
                                Vēl nav piešķirtu uzdevumu
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Kad pasniedzējs piešķirs scenāriju tev vai tavai grupai, tas parādīsies šeit.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}