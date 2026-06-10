import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    GraduationCap,
    Layers,
    Search,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Stats = {
    students?: number | string | null;
    groups?: number | string | null;
    students_without_group?: number | string | null;
};

type Student = {
    id: number;
    name?: string | null;
    email?: string | null;
    groups?: {
        id: number;
        name?: string | null;
        code?: string | null;
        academic_year?: string | null;
        external_source?: string | null;
    }[];
};

type StudentGroup = {
    id: number;
    name?: string | null;
    code?: string | null;
    academic_year?: string | null;
    type?: string | null;
    external_source?: string | null;
    external_id?: string | null;
    description?: string | null;
    status?: string | null;
    synced_at?: string | null;
    students_count?: number | string | null;
    students?: Student[];
};

type TeacherStudentsProps = {
    stats?: Stats;
    groups?: StudentGroup[];
    students?: Student[];
};

function toNumber(value: number | string | null | undefined) {
    const number = Number(value ?? 0);

    return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: number | string | null | undefined) {
    return toNumber(value).toLocaleString('lv-LV');
}

function groupTypeLabel(value?: string | null) {
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

function GroupsSection({ groups }: { groups: StudentGroup[] }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
                <Layers className="h-5 w-5 text-slate-700" />
                <div>
                    <h3 className="font-semibold text-slate-950">
                        Klases un grupas
                    </h3>
                    <p className="text-sm text-slate-500">
                        Seedotās vai importētās studentu grupas.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="rounded-2xl border border-slate-200 p-4"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h4 className="font-semibold text-slate-950">
                                    {group.name}
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    {groupTypeLabel(group.type)} · {group.code ?? 'bez koda'} · {group.academic_year ?? 'bez mācību gada'}
                                </p>
                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {formatNumber(group.students_count)} studenti
                            </span>
                        </div>

                        {group.description && (
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {group.description}
                            </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                            {(group.students ?? []).slice(0, 8).map((student) => (
                                <span
                                    key={student.id}
                                    className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-100"
                                >
                                    {student.name}
                                </span>
                            ))}

                            {(group.students ?? []).length > 8 && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                    +{(group.students ?? []).length - 8}
                                </span>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                                {sourceLabel(group.external_source)}
                            </span>

                            {group.external_id && (
                                <span className="rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">
                                    ID: {group.external_id}
                                </span>
                            )}

                            {group.synced_at && (
                                <span className="rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">
                                    Sinhronizēts: {group.synced_at}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {groups.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 lg:col-span-2">
                        Nav atrasta neviena klase vai grupa. Palaid StudentGroupSeeder.
                    </div>
                )}
            </div>
        </div>
    );
}

function StudentsTable({
    students,
    groups,
}: {
    students: Student[];
    groups: StudentGroup[];
}) {
    const [search, setSearch] = useState('');
    const [groupId, setGroupId] = useState('all');

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return students.filter((student) => {
            const matchesSearch =
                !query ||
                `${student.name ?? ''} ${student.email ?? ''}`
                    .toLowerCase()
                    .includes(query);

            const matchesGroup =
                groupId === 'all' ||
                (student.groups ?? []).some((group) => String(group.id) === groupId);

            return matchesSearch && matchesGroup;
        });
    }, [students, search, groupId]);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-950">
                            Studentu saraksts
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Visi studenti, kas sistēmā ir pieejami uzdevumu piešķiršanai.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_220px]">
                        <label className="relative block">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Meklēt studentu..."
                                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                            />
                        </label>

                        <select
                            value={groupId}
                            onChange={(event) => setGroupId(event.target.value)}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        >
                            <option value="all">Visas grupas</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Students</th>
                            <th className="px-4 py-3 font-semibold">E-pasts</th>
                            <th className="px-4 py-3 font-semibold">Klases/grupas</th>
                            <th className="px-4 py-3 font-semibold">Avots</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr
                                key={student.id}
                                className="border-b border-slate-100 last:border-0"
                            >
                                <td className="px-4 py-4">
                                    <div className="font-semibold text-slate-950">
                                        {student.name}
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {student.email}
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(student.groups ?? []).map((group) => (
                                            <span
                                                key={group.id}
                                                className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-100"
                                            >
                                                {group.name}
                                            </span>
                                        ))}

                                        {(student.groups ?? []).length === 0 && (
                                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 ring-1 ring-red-100">
                                                Bez grupas
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {student.groups?.[0]
                                        ? sourceLabel(student.groups[0].external_source)
                                        : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredStudents.length === 0 && (
                <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                    Pēc filtriem nav atrasts neviens students.
                </div>
            )}
        </div>
    );
}

export default function TeacherStudentsIndex({
    stats,
    groups,
    students,
}: TeacherStudentsProps) {
    const groupRows = Array.isArray(groups) ? groups : [];
    const studentRows = Array.isArray(students) ? students : [];

    const statsData = {
        students: 0,
        groups: 0,
        students_without_group: 0,
        ...stats,
    };

    return (
        <AuthenticatedLayout
            title="Studenti un grupas"
            subtitle="Studentu, klašu un grupu pārskats"
        >
            <Head title="Studenti un grupas" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-950">
                                Studenti un grupas
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šajā skatā pasniedzējs redz studentus un viņu piesaisti klasēm vai grupām.
                                Pašlaik dati tiek seedoti, bet vēlāk šo pašu struktūru varēs sinhronizēt
                                ar Google Workspace vai iestādes datubāzi.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Datu avots
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                Institution-ready groups
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        title="Studenti"
                        value={formatNumber(statsData.students)}
                        description="Pieejami uzdevumu piešķiršanai"
                        icon={GraduationCap}
                    />

                    <StatCard
                        title="Klases/grupas"
                        value={formatNumber(statsData.groups)}
                        description="Aktīvās studentu grupas"
                        icon={Users}
                    />

                    <StatCard
                        title="Bez grupas"
                        value={formatNumber(statsData.students_without_group)}
                        description="Studenti, kuri vēl nav piesaistīti grupai"
                        icon={statsData.students_without_group ? UserX : UserCheck}
                    />
                </div>

                <GroupsSection groups={groupRows} />

                <StudentsTable students={studentRows} groups={groupRows} />
            </div>
        </AuthenticatedLayout>
    );
}