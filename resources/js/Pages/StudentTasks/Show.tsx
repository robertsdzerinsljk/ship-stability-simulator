import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    ClipboardCheck,
    FileText,
    PackageOpen,
    PlayCircle,
    Save,
    Scale,
    Ship,
    Waves,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

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
        task_text?: string;
        final_requirements?: string;
        student_hints?: string;
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
        student_comment?: string;
        teacher_comment?: string;
        score?: string;
        submitted_at_display?: string;
    } | null;
};

type StudentTaskShowProps = {
    assignment: Assignment;
};

type StudentTaskPageProps = PageProps<{
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
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
    return mode === 'exam' ? 'Eksāmena režīms' : 'Mācību režīms';
}

function ActionLink({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: typeof PackageOpen;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-semibold text-slate-950">
                {title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
            </p>
        </Link>
    );
}

export default function StudentTaskShow({ assignment }: StudentTaskShowProps) {
    const { props } = usePage<StudentTaskPageProps>();
    const success = props.flash?.success;
    const error = props.flash?.error;
    const validationError = props.errors?.student_comment;

    const [comment, setComment] = useState(assignment.submission?.student_comment ?? '');
    const [processing, setProcessing] = useState(false);

    const startTask = () => {
        router.post(
            `/student/tasks/${assignment.id}/start`,
            {},
            { preserveScroll: true },
        );
    };

    const submitFinal = (event: FormEvent) => {
        event.preventDefault();

        setProcessing(true);

        router.post(
            `/student/tasks/${assignment.id}/submit`,
            {
                student_comment: comment,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const isExam = assignment.scenario.mode === 'exam';
    const canShowHints = assignment.scenario.show_hints && !isExam;
    const alreadySubmitted = assignment.status === 'submitted' || assignment.status === 'graded';

    return (
        <AuthenticatedLayout
            title="Uzdevums"
            subtitle="Studenta scenārija apraksts un darba soļi"
        >
            <Head title={assignment.scenario.title} />

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

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 flex flex-wrap gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(assignment.status)}`}>
                                    {statusLabel(assignment.status)}
                                </span>

                                <span
                                    className={[
                                        'rounded-full px-3 py-1 text-xs font-medium ring-1',
                                        isExam
                                            ? 'bg-red-50 text-red-700 ring-red-100'
                                            : 'bg-blue-50 text-blue-700 ring-blue-100',
                                    ].join(' ')}
                                >
                                    {modeLabel(assignment.scenario.mode)}
                                </span>

                                {assignment.due_at_display && (
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                        Termiņš: {assignment.due_at_display}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                {assignment.scenario.title}
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                {assignment.scenario.short_description ?? 'Nav īsā apraksta.'}
                            </p>
                        </div>

                        {assignment.status === 'assigned' && (
                            <button
                                type="button"
                                onClick={startTask}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <PlayCircle className="h-4 w-4" />
                                Sākt risinājumu
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    Uzdevuma teksts
                                </h3>
                            </div>

                            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                                {assignment.scenario.task_text ?? 'Uzdevuma teksts nav norādīts.'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    Gala prasības
                                </h3>
                            </div>

                            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                                {assignment.scenario.final_requirements ?? 'Gala prasības nav norādītas.'}
                            </p>
                        </div>

                        {canShowHints && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5 text-emerald-700" />
                                    <h3 className="text-base font-semibold text-emerald-950">
                                        Hints mācību režīmā
                                    </h3>
                                </div>

                                <p className="whitespace-pre-line text-sm leading-7 text-emerald-800">
                                    {assignment.scenario.student_hints ?? 'Šim uzdevumam nav pievienotu hintu.'}
                                </p>
                            </div>
                        )}

                        {isExam && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm leading-7 text-red-800 shadow-sm">
                                <div className="mb-2 flex items-center gap-2 font-semibold">
                                    <AlertTriangle className="h-4 w-4" />
                                    Eksāmena režīms
                                </div>
                                Šajā režīmā hinti un detalizēti risinājuma ieteikumi netiek rādīti,
                                lai objektīvāk pārbaudītu studenta zināšanas.
                            </div>
                        )}

                        <form
                            onSubmit={submitFinal}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4">
                                <h3 className="text-base font-semibold text-slate-950">
                                    Gala risinājuma iesniegšana
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Iesniegšanas brīdī sistēma saglabās pašreizējo stabilitātes aprēķina snapshot.
                                </p>
                            </div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Studenta komentārs
                            </label>

                            <textarea
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                rows={4}
                                disabled={alreadySubmitted}
                                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:bg-slate-50 disabled:text-slate-500"
                                placeholder="Apraksti, ko mainīji kravas vai balasta plānā un kāpēc risinājums ir drošs."
                            />

                            {assignment.submission && (
                                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                                    Iesniegts: {assignment.submission.submitted_at_display ?? '-'}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing || alreadySubmitted}
                                className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                {alreadySubmitted
                                    ? 'Risinājums jau iesniegts'
                                    : processing
                                        ? 'Iesniedz...'
                                        : 'Iesniegt gala risinājumu'}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold text-slate-950">
                                Uzdevuma dati
                            </h3>

                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <div className="text-xs text-slate-500">Kuģis</div>
                                    <div className="mt-1 font-medium text-slate-800">
                                        {assignment.scenario.vessel_name ?? '-'}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-3">
                                    <div className="text-xs text-slate-500">Kravas plāns</div>
                                    <div className="mt-1 font-medium text-slate-800">
                                        {assignment.scenario.cargo_plan_name ?? '-'}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-3">
                                    <div className="text-xs text-slate-500">Aptuvenais laiks</div>
                                    <div className="mt-1 font-medium text-slate-800">
                                        {assignment.scenario.estimated_minutes
                                            ? `${assignment.scenario.estimated_minutes} min`
                                            : 'Nav norādīts'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <ActionLink
                                href="/cargo-plan"
                                icon={PackageOpen}
                                title="Kravas plāns"
                                description="Pārbaudi un koriģē kravas sadalījumu pa tilpnēm."
                            />

                            <ActionLink
                                href="/ballast"
                                icon={Waves}
                                title="Balasts"
                                description="Maini tanku aizpildījumu un pārbaudi bortu līdzsvaru."
                            />

                            <ActionLink
                                href="/stability"
                                icon={Scale}
                                title="Stabilitāte"
                                description="Pārbaudi GM, trimu, GZ līkni un kritērijus."
                            />

                            <ActionLink
                                href="/reports"
                                icon={FileText}
                                title="Atskaites"
                                description="Ģenerē PDF pārskatu gala iesniegumam."
                            />
                        </div>

                        <Link
                            href="/student/tasks"
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Atpakaļ uz uzdevumiem
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}