import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileCheck2,
    GraduationCap,
    Layers,
    Save,
    Ship,
    User,
    Users,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type Stats = {
    total?: number | string | null;
    assigned?: number | string | null;
    in_progress?: number | string | null;
    submitted?: number | string | null;
    graded?: number | string | null;
    overdue?: number | string | null;
    students?: number | string | null;
    groups?: number | string | null;
};

type Student = {
    id: number;
    name?: string | null;
    email?: string | null;
    auth_provider?: string | null;
};

type StudentGroup = {
    id: number;
    name?: string | null;
    code?: string | null;
    academic_year?: string | null;
    type?: string | null;
    external_source?: string | null;
    external_id?: string | null;
    students_count?: number | string | null;
    students?: Student[];
};

type Scenario = {
    id: number;
    title?: string | null;
    difficulty?: string | null;
    mode?: string | null;
    vessel?: {
        id?: number | null;
        name?: string | null;
        imo_number?: string | null;
    };
};

type Assignment = {
    id: number;
    status?: string | null;
    assigned_at?: string | null;
    started_at?: string | null;
    submitted_at?: string | null;
    due_at?: string | null;
    score?: number | string | null;
    submission_id?: number | null;
    student?: {
        id?: number | null;
        name?: string | null;
        email?: string | null;
    };
    assigned_by?: {
        id?: number | null;
        name?: string | null;
    };
    student_group?: {
        id?: number | null;
        name?: string | null;
        code?: string | null;
        external_source?: string | null;
    } | null;
    scenario?: {
        id?: number | null;
        title?: string | null;
        difficulty?: string | null;
        mode?: string | null;
    };
    vessel?: {
        id?: number | null;
        name?: string | null;
        imo_number?: string | null;
    };
};

type TeacherAssignmentsProps = {
    stats?: Stats;
    assignments?: Assignment[];
    students?: Student[];
    groups?: StudentGroup[];
    scenarios?: Scenario[];
};

type TeacherAssignmentsPageProps = PageProps<{
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

    if (status === 'overdue') {
        return 'Termiņš beidzies';
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

    if (status === 'overdue') {
        return 'bg-red-50 text-red-700 ring-red-100';
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

function typeLabel(value?: string | null) {
    if (value === 'class') {
        return 'Klase';
    }

    if (value === 'course') {
        return 'Kurss';
    }

    if (value === 'group') {
        return 'Grupa';
    }

    return value ?? '-';
}

function sourceLabel(value?: string | null) {
    if (!value || value === 'local') {
        return 'Lokāli';
    }

    if (value === 'institution_demo') {
        return 'Iestādes demo dati';
    }

    if (value === 'institution_db') {
        return 'Iestādes datubāze';
    }

    if (value === 'google_workspace') {
        return 'Google Workspace';
    }

    if (value === 'auth0') {
        return 'Auth0';
    }

    return value;
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

function AssignmentForm({
    students,
    groups,
    scenarios,
}: {
    students: Student[];
    groups: StudentGroup[];
    scenarios: Scenario[];
}) {
    const [scenarioId, setScenarioId] = useState('');
    const [targetType, setTargetType] = useState<'student' | 'group'>('student');
    const [studentId, setStudentId] = useState('');
    const [studentGroupId, setStudentGroupId] = useState('');
    const [dueAt, setDueAt] = useState('');
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        setSaving(true);

        router.post(
            '/teacher/assignments',
            {
                scenario_id: scenarioId,
                target_type: targetType,
                student_id: targetType === 'student' ? studentId : null,
                student_group_id: targetType === 'group' ? studentGroupId : null,
                due_at: dueAt || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setScenarioId('');
                    setStudentId('');
                    setStudentGroupId('');
                    setDueAt('');
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <form
            onSubmit={submit}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div className="mb-5 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-slate-700" />
                <div>
                    <h3 className="font-semibold text-slate-950">
                        Piešķirt scenāriju
                    </h3>
                    <p className="text-sm text-slate-500">
                        Piešķir publicētu scenāriju vienam studentam vai visai klasei/grupai.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                        Scenārijs
                    </span>

                    <select
                        value={scenarioId}
                        onChange={(event) => setScenarioId(event.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    >
                        <option value="">Izvēlies scenāriju</option>
                        {scenarios.map((scenario) => (
                            <option key={scenario.id} value={scenario.id}>
                                {scenario.title} · {scenario.vessel?.name ?? '-'}
                            </option>
                        ))}
                    </select>
                </label>

                <div>
                    <span className="text-sm font-medium text-slate-700">
                        Piešķiršanas veids
                    </span>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setTargetType('student')}
                            className={[
                                'rounded-xl border px-4 py-3 text-left text-sm transition',
                                targetType === 'student'
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                            ].join(' ')}
                        >
                            <div className="flex items-center gap-2 font-semibold">
                                <User className="h-4 w-4" />
                                Studentam
                            </div>
                            <p className={targetType === 'student' ? 'mt-1 text-white/70' : 'mt-1 text-slate-500'}>
                                Tiks izveidots viens individuāls assignment.
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTargetType('group')}
                            className={[
                                'rounded-xl border px-4 py-3 text-left text-sm transition',
                                targetType === 'group'
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                            ].join(' ')}
                        >
                            <div className="flex items-center gap-2 font-semibold">
                                <Users className="h-4 w-4" />
                                Klasei/grupai
                            </div>
                            <p className={targetType === 'group' ? 'mt-1 text-white/70' : 'mt-1 text-slate-500'}>
                                Katram grupas studentam tiks izveidots savs assignment.
                            </p>
                        </button>
                    </div>
                </div>

                {targetType === 'student' && (
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Students
                        </span>

                        <select
                            value={studentId}
                            onChange={(event) => setStudentId(event.target.value)}
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        >
                            <option value="">Izvēlies studentu</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name} · {student.email}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                {targetType === 'group' && (
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Klase/grupa
                        </span>

                        <select
                            value={studentGroupId}
                            onChange={(event) => setStudentGroupId(event.target.value)}
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        >
                            <option value="">Izvēlies klasi/grupu</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name} · {formatNumber(group.students_count, 0)} studenti
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                        Termiņš
                    </span>

                    <input
                        type="datetime-local"
                        value={dueAt}
                        onChange={(event) => setDueAt(event.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                </label>
            </div>

            <button
                type="submit"
                disabled={saving}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Save className="h-4 w-4" />
                {saving ? 'Piešķir...' : 'Piešķirt uzdevumu'}
            </button>
        </form>
    );
}

function GroupsOverview({ groups }: { groups: StudentGroup[] }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
                <Layers className="h-5 w-5 text-slate-700" />
                <div>
                    <h3 className="font-semibold text-slate-950">
                        Pieejamās klases/grupas
                    </h3>
                    <p className="text-sm text-slate-500">
                        Grupas tiek seedotas vai vēlāk sinhronizētas no iestādes datubāzes.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="rounded-2xl border border-slate-200 p-4"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="font-semibold text-slate-950">
                                    {group.name}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {typeLabel(group.type)} · {group.code ?? 'bez koda'} · {group.academic_year ?? 'bez gada'}
                                </p>
                            </div>

                            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                {formatNumber(group.students_count, 0)} studenti
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {(group.students ?? []).slice(0, 6).map((student) => (
                                <span
                                    key={student.id}
                                    className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-100"
                                >
                                    {student.name}
                                </span>
                            ))}

                            {(group.students ?? []).length > 6 && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                    +{(group.students ?? []).length - 6}
                                </span>
                            )}
                        </div>

                        <div className="mt-3 text-xs text-slate-400">
                            Avots: {sourceLabel(group.external_source)}
                        </div>
                    </div>
                ))}

                {groups.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                        Nav pieejamu klašu/grupu. Palaid StudentGroupSeeder.
                    </div>
                )}
            </div>
        </div>
    );
}

function AssignmentsTable({ assignments }: { assignments: Assignment[] }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-950">
                    Piešķirtie uzdevumi
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Katrs ieraksts ir individuāls uzdevums konkrētam studentam.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Students</th>
                            <th className="px-4 py-3 font-semibold">Scenārijs</th>
                            <th className="px-4 py-3 font-semibold">Kuģis</th>
                            <th className="px-4 py-3 font-semibold">Grupa</th>
                            <th className="px-4 py-3 font-semibold">Termiņš</th>
                            <th className="px-4 py-3 font-semibold">Statuss</th>
                            <th className="px-4 py-3 font-semibold">Vērtējums</th>
                            <th className="px-4 py-3 font-semibold">Darbība</th>
                        </tr>
                    </thead>

                    <tbody>
                        {assignments.map((assignment) => (
                            <tr
                                key={assignment.id}
                                className="border-b border-slate-100 last:border-0"
                            >
                                <td className="px-4 py-4">
                                    <div className="text-sm font-semibold text-slate-950">
                                        {assignment.student?.name ?? '-'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {assignment.student?.email ?? '-'}
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <div className="text-sm font-semibold text-slate-950">
                                        {assignment.scenario?.title ?? '-'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {difficultyLabel(assignment.scenario?.difficulty)} · {assignment.scenario?.mode ?? '-'}
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-700">
                                    {assignment.vessel?.name ?? '-'}
                                    <div className="text-xs text-slate-500">
                                        IMO {assignment.vessel?.imo_number ?? '-'}
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-700">
                                    {assignment.student_group
                                        ? `${assignment.student_group.name}${assignment.student_group.code ? ` · ${assignment.student_group.code}` : ''}`
                                        : '-'}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-700">
                                    {assignment.due_at ?? '-'}
                                </td>

                                <td className="px-4 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(assignment.status)}`}>
                                        {statusLabel(assignment.status)}
                                    </span>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-700">
                                    {assignment.score !== null && assignment.score !== undefined
                                        ? `${formatNumber(assignment.score, 1)}/10`
                                        : '-'}
                                </td>

                                <td className="px-4 py-4">
                                    {assignment.submission_id ? (
                                        <Link
                                            href={`/teacher/submissions/${assignment.submission_id}`}
                                            className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            Atvērt iesniegumu
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-slate-400">
                                            Vēl nav iesniegts
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {assignments.length === 0 && (
                <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                    Vēl nav piešķirts neviens uzdevums.
                </div>
            )}
        </div>
    );
}

export default function TeacherAssignmentsIndex({
    stats,
    assignments,
    students,
    groups,
    scenarios,
}: TeacherAssignmentsProps) {
    const { props } = usePage<TeacherAssignmentsPageProps>();

    const success = props.flash?.success;
    const error = props.flash?.error;

    const validationError = useMemo(() => {
        const errors = props.errors ?? {};
        return Object.values(errors)[0];
    }, [props.errors]);

    const statsData = {
        total: 0,
        assigned: 0,
        in_progress: 0,
        submitted: 0,
        graded: 0,
        overdue: 0,
        students: 0,
        groups: 0,
        ...stats,
    };

    const assignmentRows = Array.isArray(assignments) ? assignments : [];
    const studentRows = Array.isArray(students) ? students : [];
    const groupRows = Array.isArray(groups) ? groups : [];
    const scenarioRows = Array.isArray(scenarios) ? scenarios : [];

    return (
        <AuthenticatedLayout
            title="Uzdevumu piešķiršana"
            subtitle="Scenāriju piešķiršana studentiem, klasēm un grupām"
        >
            <Head title="Uzdevumu piešķiršana" />

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
                            <h2 className="text-2xl font-semibold text-slate-950">
                                Uzdevumu piešķiršanas centrs
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Pasniedzējs izvēlas publicētu scenāriju un piešķir to vienam studentam
                                vai visai klasei/grupai. Ja izvēlēta grupa, sistēma katram grupas studentam
                                izveido atsevišķu privātu assignment.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Workflow
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                Scenario → Assignment → Solution → Submission
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        title="Piešķīrumi"
                        value={formatNumber(statsData.total)}
                        description="Visi individuālie assignment"
                        icon={ClipboardList}
                    />

                    <StatCard
                        title="Risināšanā"
                        value={formatNumber(statsData.in_progress)}
                        description="Studenti jau sākuši darbu"
                        icon={Clock}
                    />

                    <StatCard
                        title="Iesniegti"
                        value={formatNumber(statsData.submitted)}
                        description="Gaida vērtēšanu"
                        icon={AlertTriangle}
                    />

                    <StatCard
                        title="Novērtēti"
                        value={formatNumber(statsData.graded)}
                        description="Darbi ar vērtējumu"
                        icon={CheckCircle2}
                    />

                    <StatCard
                        title="Nokavēti"
                        value={formatNumber(statsData.overdue)}
                        description="Uzdevumi ar beigušos termiņu"
                        icon={AlertTriangle}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <AssignmentForm
                        students={studentRows}
                        groups={groupRows}
                        scenarios={scenarioRows}
                    />

                    <GroupsOverview groups={groupRows} />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-slate-700" />
                        <div>
                            <h3 className="font-semibold text-slate-950">
                                Pieejamie resursi
                            </h3>
                            <p className="text-sm text-slate-500">
                                Studentu, grupu un publicēto scenāriju kopsavilkums.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                            <User className="h-5 w-5 text-slate-500" />
                            <p className="mt-3 text-2xl font-semibold text-slate-950">
                                {formatNumber(statsData.students)}
                            </p>
                            <p className="text-sm text-slate-500">Studenti</p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                            <Users className="h-5 w-5 text-slate-500" />
                            <p className="mt-3 text-2xl font-semibold text-slate-950">
                                {formatNumber(statsData.groups)}
                            </p>
                            <p className="text-sm text-slate-500">Grupas</p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                            <Ship className="h-5 w-5 text-slate-500" />
                            <p className="mt-3 text-2xl font-semibold text-slate-950">
                                {formatNumber(scenarioRows.length)}
                            </p>
                            <p className="text-sm text-slate-500">Publicēti scenāriji</p>
                        </div>
                    </div>
                </div>

                <AssignmentsTable assignments={assignmentRows} />
            </div>
        </AuthenticatedLayout>
    );
}
