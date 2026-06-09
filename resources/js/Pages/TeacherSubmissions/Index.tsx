import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    GraduationCap,
    Scale,
    Ship,
    UserCheck,
} from 'lucide-react';

type SubmissionStatus = 'submitted' | 'graded' | string;

type Submission = {
    id: number;
    status: SubmissionStatus;
    score: number | null;
    student_comment?: string;
    teacher_comment?: string;
    submitted_at_display?: string;
    student: {
        id?: number;
        name?: string;
        email?: string;
    };
    scenario: {
        id?: number;
        title?: string;
        course?: string;
        mode?: string;
        difficulty?: string;
        vessel_name?: string;
        vessel_imo?: string;
        cargo_plan_name?: string;
    };
    summary: {
        gm?: number | null;
        trim?: number | null;
        heel?: number | null;
        displacement?: number | null;
        failed_criteria: number;
        warning_criteria: number;
        criteria_count: number;
    };
};

type TeacherSubmissionsIndexProps = {
    submissions: Submission[];
};

type TeacherSubmissionsPageProps = PageProps<{
    flash?: {
        success?: string;
        error?: string;
    };
}>;

function statusLabel(status: SubmissionStatus) {
    if (status === 'graded') return 'Novērtēts';
    return 'Iesniegts';
}

function statusBadge(status: SubmissionStatus) {
    if (status === 'graded') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    return 'bg-blue-50 text-blue-700 ring-blue-100';
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

export default function TeacherSubmissionsIndex({
    submissions,
}: TeacherSubmissionsIndexProps) {
    const { props } = usePage<TeacherSubmissionsPageProps>();
    const success = props.flash?.success;
    const error = props.flash?.error;

    const gradedCount = submissions.filter((item) => item.status === 'graded').length;
    const submittedCount = submissions.filter((item) => item.status !== 'graded').length;
    const failedCriteriaCount = submissions.reduce(
        (sum, item) => sum + item.summary.failed_criteria,
        0,
    );

    return (
        <AuthenticatedLayout
            title="Iesniegumi"
            subtitle="Pasniedzēja pārskats par studentu iesniegtajiem risinājumiem"
        >
            <Head title="Iesniegumi" />

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
                                <GraduationCap className="h-4 w-4" />
                                Pasniedzēja darba vide
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                Studentu iesniegumi
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šeit pasniedzējs redz iesniegtos risinājumus, stabilitātes snapshot,
                                kritēriju statusus, studenta komentāru un var piešķirt vērtējumu.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Kopā iesniegumi
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {submissions.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Iesniegti"
                        value={`${submittedCount}`}
                        description="Gaida pasniedzēja vērtējumu"
                        icon={ClipboardList}
                    />

                    <SummaryCard
                        title="Novērtēti"
                        value={`${gradedCount}`}
                        description="Vērtējums jau saglabāts"
                        icon={CheckCircle2}
                    />

                    <SummaryCard
                        title="Neatbilstības"
                        value={`${failedCriteriaCount}`}
                        description="Kopējais fail kritēriju skaits"
                        icon={AlertTriangle}
                    />

                    <SummaryCard
                        title="Studenti"
                        value={`${new Set(submissions.map((item) => item.student.email)).size}`}
                        description="Unikāli iesniedzēji"
                        icon={UserCheck}
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Iesniegumu saraksts
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Atver iesniegumu, lai pārskatītu kritērijus un piešķirtu vērtējumu.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Students</th>
                                    <th className="px-4 py-3 font-semibold">Scenārijs</th>
                                    <th className="px-4 py-3 font-semibold">Kuģis</th>
                                    <th className="px-4 py-3 font-semibold">Snapshot</th>
                                    <th className="px-4 py-3 font-semibold">Statuss</th>
                                    <th className="px-4 py-3 font-semibold">Vērtējums</th>
                                    <th className="px-4 py-3 font-semibold">Darbība</th>
                                </tr>
                            </thead>

                            <tbody>
                                {submissions.map((submission) => (
                                    <tr
                                        key={submission.id}
                                        className="border-b border-slate-100 align-top last:border-0"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-950">
                                                {submission.student.name ?? 'Students'}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {submission.student.email ?? '-'}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">
                                                {submission.submitted_at_display ?? '-'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-950">
                                                {submission.scenario.title ?? '-'}
                                            </div>
                                            <div className="mt-1 text-sm text-slate-500">
                                                {submission.scenario.course ?? 'Nav kursa'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Ship className="h-4 w-4 text-slate-400" />
                                                {submission.scenario.vessel_name ?? '-'}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                {submission.scenario.cargo_plan_name ?? 'Nav kravas plāna'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-slate-400" />
                                                GM: {submission.summary.gm ?? '-'} m
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                Fail: {submission.summary.failed_criteria} · Warning: {submission.summary.warning_criteria}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(submission.status)}`}>
                                                {statusLabel(submission.status)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                            {submission.score !== null
                                                ? `${submission.score}/10`
                                                : 'Nav vērtēts'}
                                        </td>

                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/teacher/submissions/${submission.id}`}
                                                className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                                            >
                                                Pārskatīt
                                            </Link>
                                        </td>
                                    </tr>
                                ))}

                                {submissions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                        >
                                            Pagaidām nav iesniegtu studentu risinājumu.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}