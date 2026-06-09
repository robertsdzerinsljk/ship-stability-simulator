import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    PlayCircle,
    Ship,
} from 'lucide-react';

type AssignmentStatus = 'assigned' | 'in_progress' | 'submitted' | 'graded';

type Assignment = {
    id: number;
    status: AssignmentStatus;
    assigned_at_display?: string;
    started_at_display?: string;
    submitted_at_display?: string;
    due_at_display?: string;
    scenario: {
        id: number;
        title: string;
        short_description?: string;
        course?: string;
        difficulty: 'easy' | 'medium' | 'hard';
        mode: 'training' | 'exam';
        estimated_minutes?: number;
        show_hints: boolean;
        allow_solution_comparison: boolean;
        vessel_name?: string;
        vessel_imo?: string;
        cargo_plan_name?: string;
    };
    submission?: {
        id: number;
        status: string;
        submitted_at_display?: string;
    } | null;
};

type StudentTasksIndexProps = {
    assignments: Assignment[];
};

type StudentTasksPageProps = PageProps<{
    flash?: {
        success?: string;
        error?: string;
    };
}>;

function statusLabel(status: AssignmentStatus) {
    if (status === 'submitted') return 'Iesniegts';
    if (status === 'graded') return 'Novērtēts';
    if (status === 'in_progress') return 'Procesā';
    return 'Piešķirts';
}

function statusBadge(status: AssignmentStatus) {
    if (status === 'submitted' || status === 'graded') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (status === 'in_progress') {
        return 'bg-blue-50 text-blue-700 ring-blue-100';
    }

    return 'bg-amber-50 text-amber-700 ring-amber-100';
}

function modeLabel(mode: 'training' | 'exam') {
    return mode === 'exam' ? 'Eksāmens' : 'Mācību režīms';
}

function difficultyLabel(difficulty: 'easy' | 'medium' | 'hard') {
    if (difficulty === 'easy') return 'Viegls';
    if (difficulty === 'hard') return 'Sarežģīts';
    return 'Vidējs';
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
    icon: typeof ClipboardCheck;
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

export default function StudentTasksIndex({ assignments }: StudentTasksIndexProps) {
    const { props } = usePage<StudentTasksPageProps>();
    const success = props.flash?.success;
    const error = props.flash?.error;

    const inProgressCount = assignments.filter((item) => item.status === 'in_progress').length;
    const submittedCount = assignments.filter((item) => item.status === 'submitted' || item.status === 'graded').length;
    const examCount = assignments.filter((item) => item.scenario.mode === 'exam').length;

    const startTask = (assignmentId: number) => {
        router.post(
            `/student/tasks/${assignmentId}/start`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            title="Mani uzdevumi"
            subtitle="Studentam piešķirtie simulatora scenāriji"
        >
            <Head title="Mani uzdevumi" />

            <div className="space-y-6">
                {success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <ClipboardCheck className="h-4 w-4" />
                                Studenta darba vide
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                Piešķirtie stabilitātes uzdevumi
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šeit students redz publicētos scenārijus, var sākt risinājumu,
                                pāriet uz kravas, balasta un stabilitātes moduļiem un beigās iesniegt gala rezultātu.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Kopā uzdevumi
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {assignments.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Procesā"
                        value={`${inProgressCount}`}
                        description="Sākti, bet vēl nav iesniegti"
                        icon={PlayCircle}
                    />

                    <SummaryCard
                        title="Iesniegti"
                        value={`${submittedCount}`}
                        description="Gala risinājums nodots"
                        icon={CheckCircle2}
                    />

                    <SummaryCard
                        title="Eksāmeni"
                        value={`${examCount}`}
                        description="Uzdevumi ar ierobežotu palīdzību"
                        icon={AlertTriangle}
                    />

                    <SummaryCard
                        title="Termiņi"
                        value={`${assignments.filter((item) => item.due_at_display).length}`}
                        description="Uzdevumi ar nodošanas laiku"
                        icon={CalendarClock}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    {assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(assignment.status)}`}>
                                            {statusLabel(assignment.status)}
                                        </span>

                                        <span
                                            className={[
                                                'rounded-full px-3 py-1 text-xs font-medium ring-1',
                                                assignment.scenario.mode === 'exam'
                                                    ? 'bg-red-50 text-red-700 ring-red-100'
                                                    : 'bg-blue-50 text-blue-700 ring-blue-100',
                                            ].join(' ')}
                                        >
                                            {modeLabel(assignment.scenario.mode)}
                                        </span>

                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                            {difficultyLabel(assignment.scenario.difficulty)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-slate-950">
                                        {assignment.scenario.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {assignment.scenario.short_description ?? 'Uzdevuma apraksts nav norādīts.'}
                                    </p>
                                </div>

                                <ClipboardCheck className="h-5 w-5 shrink-0 text-slate-400" />
                            </div>

                            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                                        <Ship className="h-3.5 w-3.5" />
                                        Kuģis
                                    </div>
                                    <div className="font-medium text-slate-800">
                                        {assignment.scenario.vessel_name ?? '-'}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-3">
                                    <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                                        <Clock className="h-3.5 w-3.5" />
                                        Termiņš
                                    </div>
                                    <div className="font-medium text-slate-800">
                                        {assignment.due_at_display ?? 'Nav norādīts'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {assignment.status === 'assigned' && (
                                    <button
                                        type="button"
                                        onClick={() => startTask(assignment.id)}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        <PlayCircle className="h-4 w-4" />
                                        Sākt risinājumu
                                    </button>
                                )}

                                <Link
                                    href={`/student/tasks/${assignment.id}`}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Atvērt uzdevumu
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {assignments.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                        Pagaidām nav piešķirtu uzdevumu.
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}