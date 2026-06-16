import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ClipboardCheck,
    Clock,
    GraduationCap,
    Mail,
    Ship,
    User,
} from 'lucide-react';

type StudentGroup = {
    id: number;
    name: string;
    code?: string | null;
    academic_year?: string | null;
};

type Student = {
    id: number;
    name: string;
    email: string;
    auth_provider?: string | null;
    created_at?: string | null;
    groups: StudentGroup[];
};

type Stats = {
    total: number;
    assigned: number;
    in_progress: number;
    submitted: number;
    graded: number;
    overdue: number;
    average_score?: number | null;
};

type Assignment = {
    id: number;
    status: string;
    assigned_at?: string | null;
    started_at?: string | null;
    submitted_at?: string | null;
    due_at?: string | null;
    scenario: {
        id?: number | null;
        title: string;
        difficulty?: string | null;
        mode?: string | null;
    };
    vessel: {
        id?: number | null;
        name: string;
    };
    student_group?: {
        id: number;
        name: string;
        code?: string | null;
    } | null;
    assigned_by?: {
        id?: number | null;
        name: string;
    };
    submission?: {
        id: number;
        status: string;
        score?: number | string | null;
        teacher_comment?: string | null;
        student_comment?: string | null;
        submitted_at?: string | null;
    } | null;
};

type Props = {
    student: Student;
    stats: Stats;
    assignments: Assignment[];
};

function statusLabel(status?: string | null) {
    if (status === 'assigned') return 'Piešķirts';
    if (status === 'in_progress') return 'Risināšanā';
    if (status === 'submitted') return 'Iesniegts';
    if (status === 'graded') return 'Novērtēts';
    if (status === 'overdue') return 'Termiņš beidzies';

    return status ?? 'Nav statusa';
}

function statusBadge(status?: string | null) {
    if (status === 'overdue') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

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

function formatValue(value?: number | string | null) {
    if (value === null || value === undefined || value === '') {
        return '0';
    }

    return String(value);
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
    icon: typeof User;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="rounded-xl bg-[#155f4c]/10 p-3 text-[#155f4c]">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

export default function Show({ student, stats, assignments }: Props) {
    return (
        <AuthenticatedLayout
            title={student.name}
            subtitle="Studenta profila pārskats un darbu vēsture"
        >
            <Head title={`Students - ${student.name}`} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#155f4c] text-white">
                            <User className="h-7 w-7" />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-semibold text-slate-950">
                                    {student.name}
                                </h1>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    Students
                                </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {student.email}
                                </span>

                                <span>
                                    Autentifikācija: {student.auth_provider ?? 'local'}
                                </span>

                                {student.created_at && (
                                    <span>Izveidots: {student.created_at}</span>
                                )}
                            </div>

                            {student.groups.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {student.groups.map((group) => (
                                        <span
                                            key={group.id}
                                            className="rounded-full bg-[#155f4c]/10 px-3 py-1 text-xs font-semibold text-[#155f4c]"
                                        >
                                            {group.name}
                                            {group.code ? ` (${group.code})` : ''}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Link
                        href="/teacher/students"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ uz studentiem
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <StatCard
                        title="Visi darbi"
                        value={formatValue(stats.total)}
                        description="Kopējais piešķīrumu skaits"
                        icon={ClipboardCheck}
                    />
                    <StatCard
                        title="Piešķirti"
                        value={formatValue(stats.assigned)}
                        description="Vēl nav sākti"
                        icon={Clock}
                    />
                    <StatCard
                        title="Risināšanā"
                        value={formatValue(stats.in_progress)}
                        description="Students strādā"
                        icon={Ship}
                    />
                    <StatCard
                        title="Iesniegti"
                        value={formatValue(stats.submitted)}
                        description="Gaida vērtējumu"
                        icon={GraduationCap}
                    />
                    <StatCard
                        title="Novērtēti"
                        value={formatValue(stats.graded)}
                        description="Darbi ar vērtējumu"
                        icon={ClipboardCheck}
                    />
                    <StatCard
                        title="Nokavēti"
                        value={formatValue(stats.overdue)}
                        description="Termiņš beidzies"
                        icon={AlertTriangle}
                    />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-6">
                        <h2 className="text-lg font-semibold text-slate-950">
                            Studenta darbi
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Visi studentam piešķirtie scenāriji un to izpildes statuss.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Scenārijs
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Kuģis
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Statuss
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Termiņš
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Vērtējums
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Darbības
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-slate-50/60">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-950">
                                                {assignment.scenario.title}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Piešķirts: {assignment.assigned_at ?? '-'}
                                            </p>
                                            {assignment.student_group && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Grupa: {assignment.student_group.name}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {assignment.vessel.name}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={[
                                                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1',
                                                    statusBadge(assignment.status),
                                                ].join(' ')}
                                            >
                                                {statusLabel(assignment.status)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {assignment.due_at ?? '-'}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                                            {assignment.submission?.score !== null &&
                                            assignment.submission?.score !== undefined
                                                ? `${assignment.submission.score}/10`
                                                : '-'}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {assignment.submission ? (
                                                <Link
                                                    href={`/teacher/submissions/${assignment.submission.id}`}
                                                    className="inline-flex items-center justify-center rounded-xl bg-[#155f4c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#10483a]"
                                                >
                                                    Apskatīt iesniegumu
                                                </Link>
                                            ) : (
                                                <span className="text-sm text-slate-400">
                                                    Nav iesnieguma
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {assignments.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-sm text-slate-500"
                                        >
                                            Šim studentam vēl nav piešķirtu darbu.
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