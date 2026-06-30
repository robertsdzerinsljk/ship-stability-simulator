import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

type StudentGroup = {
    id: number;
    name: string;
    code?: string | null;
    academic_year?: string | null;
};

type StudentTask = {
    id: number;
    status: string;
    assigned_at?: string | null;
    due_at?: string | null;
    submitted_at?: string | null;
    scenario_title: string;
    vessel_name?: string | null;
    score?: number | null;
    teacher_comment?: string | null;
};

type StudentProfile = {
    user: {
        name: string;
        email: string;
        created_at?: string | null;
    };
    groups: StudentGroup[];
    tasks: StudentTask[];
};

type ProfileProps = PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    isStudentProfile?: boolean;
    studentProfile?: StudentProfile | null;
}>;

function statusLabel(status: string) {
    if (status === 'assigned') return 'Piešķirts';
    if (status === 'in_progress') return 'Risināšanā';
    if (status === 'submitted') return 'Iesniegts';
    if (status === 'graded') return 'Novērtēts';
    if (status === 'overdue') return 'Termiņš beidzies';

    return status;
}

function statusBadge(status: string) {
    if (status === 'graded')
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    if (status === 'submitted') return 'bg-blue-50 text-blue-700 ring-blue-100';
    if (status === 'in_progress')
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    if (status === 'overdue') return 'bg-red-50 text-red-700 ring-red-100';

    return 'bg-slate-50 text-slate-700 ring-slate-100';
}

function StudentReadOnlyProfile({ profile }: { profile: StudentProfile }) {
    const groups = Array.isArray(profile.groups) ? profile.groups : [];
    const tasks = Array.isArray(profile.tasks) ? profile.tasks : [];

    return (
        <AuthenticatedLayout
            title="Profils"
            subtitle="Tavi konta dati, grupa un uzdevumu vēsture"
        >
            <Head title="Profils" />

            <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#155f4c]">
                                Skolēna profils
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-950">
                                {profile.user.name}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {profile.user.email}
                            </p>
                        </div>

                        <Link
                            href="/student/tasks"
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#155f4c] px-4 text-sm font-semibold text-white transition hover:bg-[#0f4a3b]"
                        >
                            Mani uzdevumi
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Loma
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">
                                Students
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Aktīvā grupa
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">
                                {groups[0]
                                    ? `${groups[0].name}${groups[0].academic_year ? ` · ${groups[0].academic_year}` : ''}`
                                    : '-'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Konts izveidots
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">
                                {profile.user.created_at ?? '-'}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-950">
                            Grupas
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Grupas tiek piešķirtas onboarding laikā vai
                            administratora iestatījumos.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {groups.map((group) => (
                            <span
                                key={group.id}
                                className="rounded-full bg-[#155f4c]/10 px-3 py-1.5 text-sm font-semibold text-[#155f4c] ring-1 ring-[#155f4c]/15"
                            >
                                {group.name}
                                {group.academic_year
                                    ? ` · ${group.academic_year}`
                                    : ''}
                            </span>
                        ))}

                        {groups.length === 0 && (
                            <p className="text-sm text-slate-500">
                                Grupa vēl nav piesaistīta.
                            </p>
                        )}
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <h3 className="text-lg font-semibold text-slate-950">
                            Uzdevumu vēsture
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Šeit redzami tavi piešķirtie darbi, iesniegšanas
                            statuss un vērtējumi.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-6 py-3">Uzdevums</th>
                                    <th className="px-6 py-3">Statuss</th>
                                    <th className="px-6 py-3">Termiņš</th>
                                    <th className="px-6 py-3">Iesniegts</th>
                                    <th className="px-6 py-3">Atzīme</th>
                                    <th className="px-6 py-3">Komentārs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="align-top">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-950">
                                                {task.scenario_title}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {task.vessel_name ??
                                                    'Kuģis nav norādīts'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={[
                                                    'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                                                    statusBadge(task.status),
                                                ].join(' ')}
                                            >
                                                {statusLabel(task.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {task.due_at ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {task.submitted_at ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-950">
                                            {task.score !== null &&
                                            task.score !== undefined
                                                ? task.score
                                                : '-'}
                                        </td>
                                        <td className="max-w-xs px-6 py-4 text-slate-600">
                                            {task.teacher_comment || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {tasks.length === 0 && (
                        <div className="px-6 py-10 text-center text-sm text-slate-500">
                            Uzdevumu vēsture vēl ir tukša.
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

export default function Edit({
    mustVerifyEmail,
    status,
    isStudentProfile,
    studentProfile,
}: ProfileProps) {
    if (isStudentProfile && studentProfile) {
        return <StudentReadOnlyProfile profile={studentProfile} />;
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
