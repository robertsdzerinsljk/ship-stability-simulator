import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
    ChevronDown,
    ChevronUp,
    Database,
    Gauge,
    Save,
    Settings,
    ShieldCheck,
    Ship,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type Stats = {
    users?: number;
    students?: number;
    teachers?: number;
    admins?: number;
    cargo_types?: number;
    vessel_limits?: number;
};

type UserRow = {
    id: number;
    name: string;
    email: string;
    auth_provider?: string | null;
    roles: string[];
    student_group_id?: number | null;
    student_group_name?: string | null;
};

type StudentGroup = {
    id: number;
    name: string;
    code?: string | null;
    academic_year?: string | null;
    students_count?: number;
};

type VesselLimit = {
    id: number;
    vessel_name: string;
    min_gm: number;
    max_draft: number;
    max_trim: number;
    max_heel: number;
    max_compartment_load_percent: number;
    load_line_note?: string | null;
};

type CargoType = {
    id: number;
    name: string;
    category: string;
    density?: number | null;
    stowage_factor?: number | null;
    status: string;
    notes?: string | null;
};

type SettingsIndexProps = {
    stats?: Stats;
    roles?: string[];
    users?: UserRow[];
    studentGroups?: StudentGroup[];
    vesselLimits?: VesselLimit[];
    cargoTypes?: CargoType[];
};

type SettingsPageProps = PageProps<{
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}>;

function formatNumber(value?: number | null, digits = 0) {
    return Number(value ?? 0).toLocaleString('lv-LV', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
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

function UserRolesForm({ user, roles }: { user: UserRow; roles: string[] }) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles ?? []);
    const [saving, setSaving] = useState(false);

    const toggleRole = (role: string) => {
        setSelectedRoles((current) => {
            if (current.includes(role)) {
                return current.filter((item) => item !== role);
            }

            return [...current, role];
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);

        router.patch(
            `/settings/users/${user.id}/roles`,
            { roles: selectedRoles },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="font-semibold text-slate-950">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs text-slate-400">Auth: {user.auth_provider ?? 'local'}</p>
                </div>

                <button
                    type="submit"
                    disabled={saving || selectedRoles.length === 0}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saglabā...' : 'Saglabāt'}
                </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {roles.map((role) => (
                    <label
                        key={`${user.id}-${role}`}
                        className={[
                            'inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ring-1 transition',
                            selectedRoles.includes(role)
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                                : 'bg-slate-50 text-slate-600 ring-slate-100',
                        ].join(' ')}
                    >
                        <input
                            type="checkbox"
                            checked={selectedRoles.includes(role)}
                            onChange={() => toggleRole(role)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                        />
                        {role}
                    </label>
                ))}
            </div>
        </form>
    );
}

function UserGroupForm({
    user,
    groups,
}: {
    user: UserRow;
    groups: StudentGroup[];
}) {
    const [studentGroupId, setStudentGroupId] = useState(
        user.student_group_id ? String(user.student_group_id) : '',
    );
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);

        router.patch(
            `/settings/users/${user.id}/group`,
            { student_group_id: studentGroupId || null },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    if (! user.roles.includes('student')) {
        return null;
    }

    return (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select
                value={studentGroupId}
                onChange={(event) => setStudentGroupId(event.target.value)}
                className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
            >
                <option value="">Nav grupas</option>
                {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                        {group.name} · {group.academic_year ?? '-'}
                    </option>
                ))}
            </select>

            <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
            >
                {saving ? 'Saglabā...' : 'Piesaistīt grupu'}
            </button>
        </form>
    );
}

function DeleteUserButton({ user }: { user: UserRow }) {
    const [deleting, setDeleting] = useState(false);

    const destroy = () => {
        if (! window.confirm(`Dzēst lietotāju ${user.name}?`)) {
            return;
        }

        setDeleting(true);

        router.delete(`/settings/users/${user.id}`, {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <button
            type="button"
            onClick={destroy}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-semibold text-red-700 ring-1 ring-red-100 transition hover:bg-red-100 disabled:opacity-60"
        >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Dzēš...' : 'Dzēst'}
        </button>
    );
}

function CreateUserForm({
    roles,
    groups,
}: {
    roles: string[];
    groups: StudentGroup[];
}) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
        student_group_id: '',
    });
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);

        router.post('/settings/users', form, {
            preserveScroll: true,
            onSuccess: () =>
                setForm({
                    name: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                    roles: [],
                    student_group_id: '',
                }),
            onFinish: () => setSaving(false),
        });
    };

    const toggleRole = (role: string) => {
        setForm((current) => ({
            ...current,
            roles: current.roles.includes(role)
                ? current.roles.filter((item) => item !== role)
                : [...current.roles, role],
        }));
    };

    return (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-slate-700" />
                <h3 className="font-semibold text-slate-950">Pievienot lietotāju</h3>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Vārds, uzvārds"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    required
                />
                <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="vards@ljkstudents.lv"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    required
                />
                <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="Parole"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    required
                />
                <input
                    type="password"
                    value={form.password_confirmation}
                    onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })}
                    placeholder="Atkārtot paroli"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    required
                />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {roles.map((role) => (
                    <label key={role} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-100">
                        <input
                            type="checkbox"
                            checked={form.roles.includes(role)}
                            onChange={() => toggleRole(role)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                        />
                        {role}
                    </label>
                ))}
            </div>

            <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <select
                    value={form.student_group_id}
                    onChange={(event) => setForm({ ...form, student_group_id: event.target.value })}
                    className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                >
                    <option value="">Studentam grupa nav norādīta</option>
                    {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name} · {group.academic_year ?? '-'}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                    <UserPlus className="h-4 w-4" />
                    {saving ? 'Veido...' : 'Izveidot'}
                </button>
            </div>
        </form>
    );
}

function CreateGroupForm() {
    const currentYear = new Date().getFullYear();
    const [form, setForm] = useState({
        name: '',
        code: '',
        academic_year: `${currentYear}/${currentYear + 1}`,
        type: 'class',
        description: '',
    });
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);

        router.post('/settings/student-groups', form, {
            preserveScroll: true,
            onSuccess: () => setForm({ ...form, name: '', code: '', description: '' }),
            onFinish: () => setSaving(false),
        });
    };

    return (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 p-4">
            <h3 className="mb-4 font-semibold text-slate-950">Pievienot grupu</h3>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="S-21"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm uppercase outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    required
                />
                <input
                    value={form.code}
                    onChange={(event) => setForm({ ...form, code: event.target.value })}
                    placeholder="Kods"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm uppercase outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
                <input
                    value={form.academic_year}
                    onChange={(event) => setForm({ ...form, academic_year: event.target.value })}
                    placeholder="2025/2026"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    required
                />
                <select
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                >
                    <option value="class">class</option>
                    <option value="course">course</option>
                    <option value="group">group</option>
                </select>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:col-span-2 xl:col-span-4 xl:w-fit"
                >
                    {saving ? 'Veido...' : 'Izveidot'}
                </button>
            </div>
        </form>
    );
}

function VesselLimitForm({ limit }: { limit: VesselLimit }) {
    const [form, setForm] = useState({
        min_gm: String(limit.min_gm),
        max_draft: String(limit.max_draft),
        max_trim: String(limit.max_trim),
        max_heel: String(limit.max_heel),
        max_compartment_load_percent: String(limit.max_compartment_load_percent),
        load_line_note: limit.load_line_note ?? '',
    });
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);

        router.patch(`/settings/vessel-limits/${limit.id}`, form, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="font-semibold text-slate-950">{limit.vessel_name}</p>
                    <p className="mt-1 text-sm text-slate-500">Stabilitātes robežvērtības</p>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saglabā...' : 'Saglabāt'}
                </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {[
                    ['min_gm', 'Min GM'],
                    ['max_draft', 'Max draft'],
                    ['max_trim', 'Max trim'],
                    ['max_heel', 'Max heel'],
                    ['max_compartment_load_percent', 'Tilpnes %'],
                ].map(([key, label]) => (
                    <label key={key} className="block">
                        <span className="text-xs font-medium text-slate-500">{label}</span>
                        <input
                            type="number"
                            step="0.001"
                            value={form[key as keyof typeof form]}
                            onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                            className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        />
                    </label>
                ))}
            </div>

            <label className="mt-3 block">
                <span className="text-xs font-medium text-slate-500">Load line note</span>
                <textarea
                    value={form.load_line_note}
                    onChange={(event) => setForm({ ...form, load_line_note: event.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
            </label>
        </form>
    );
}

function CargoTypeForm({ cargoType }: { cargoType: CargoType }) {
    const [form, setForm] = useState({
        name: cargoType.name,
        category: cargoType.category,
        density: cargoType.density !== null && cargoType.density !== undefined ? String(cargoType.density) : '',
        stowage_factor:
            cargoType.stowage_factor !== null && cargoType.stowage_factor !== undefined
                ? String(cargoType.stowage_factor)
                : '',
        status: cargoType.status,
        notes: cargoType.notes ?? '',
    });
    const [saving, setSaving] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);

        router.patch(`/settings/cargo-types/${cargoType.id}`, form, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(120px,0.7fr)_repeat(3,minmax(100px,0.55fr))_auto] lg:items-end">
                <label className="block">
                    <span className="text-xs font-medium text-slate-500">Nosaukums</span>
                    <input
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-medium text-slate-500">Kategorija</span>
                    <input
                        value={form.category}
                        onChange={(event) => setForm({ ...form, category: event.target.value })}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-medium text-slate-500">Density</span>
                    <input
                        type="number"
                        step="0.001"
                        value={form.density}
                        onChange={(event) => setForm({ ...form, density: event.target.value })}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-medium text-slate-500">Stowage</span>
                    <input
                        type="number"
                        step="0.001"
                        value={form.stowage_factor}
                        onChange={(event) => setForm({ ...form, stowage_factor: event.target.value })}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-medium text-slate-500">Statuss</span>
                    <select
                        value={form.status}
                        onChange={(event) => setForm({ ...form, status: event.target.value })}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                    </select>
                </label>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save className="h-4 w-4" />
                    {saving ? '...' : 'Saglabāt'}
                </button>
            </div>

            <label className="mt-3 block">
                <span className="text-xs font-medium text-slate-500">Piezīmes</span>
                <textarea
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
            </label>
        </form>
    );
}

export default function SettingsIndex({
    stats,
    roles,
    users,
    studentGroups,
    vesselLimits,
    cargoTypes,
}: SettingsIndexProps) {
    const { props } = usePage<SettingsPageProps>();
    const statsData = { users: 0, students: 0, teachers: 0, admins: 0, cargo_types: 0, vessel_limits: 0, ...stats };
    const roleRows = Array.isArray(roles) ? roles : [];
    const userRows = Array.isArray(users) ? users : [];
    const groupRows = Array.isArray(studentGroups) ? studentGroups : [];
    const limitRows = Array.isArray(vesselLimits) ? vesselLimits : [];
    const cargoRows = Array.isArray(cargoTypes) ? cargoTypes : [];
    const validationError = props.errors ? Object.values(props.errors)[0] : null;
    const [showAllUsers, setShowAllUsers] = useState(false);
    const visibleUserRows = showAllUsers ? userRows : userRows.slice(0, 8);
    const hiddenUserCount = Math.max(userRows.length - visibleUserRows.length, 0);

    return (
        <AuthenticatedLayout
            title="Iestatījumi"
            subtitle="Lietotāji, lomas, kuģu robežvērtības un kravu pamatdati"
        >
            <Head title="Iestatījumi" />

            <div className="space-y-6">
                {props.flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {props.flash.success}
                    </div>
                )}

                {(props.flash?.error || validationError) && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {props.flash?.error ?? validationError}
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <Settings className="h-4 w-4" />
                                Admin
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-950">
                                Sistēmas pamatpārvaldība
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šeit administrators pārvalda lomas, simulatora stabilitātes robežvērtības un kravu tipus.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Lomas</p>
                            <p className="mt-1 text-lg font-semibold">{roleRows.join(' / ') || '-'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Lietotāji" value={formatNumber(statsData.users)} description={`${formatNumber(statsData.students)} studenti`} icon={Users} />
                    <StatCard title="Pasniedzēji" value={formatNumber(statsData.teachers)} description={`${formatNumber(statsData.admins)} administratori`} icon={ShieldCheck} />
                    <StatCard title="Kuģu robežas" value={formatNumber(statsData.vessel_limits)} description="Stabilitātes kritēriju ieraksti" icon={Ship} />
                    <StatCard title="Kravu tipi" value={formatNumber(statsData.cargo_types)} description="Kravas blīvuma un SF dati" icon={Database} />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <Users className="h-5 w-5 text-slate-700" />
                        <div>
                            <h3 className="font-semibold text-slate-950">Lietotāji un lomas</h3>
                            <p className="text-sm text-slate-500">Lomas nosaka redzamās sadaļas un atļautās darbības.</p>
                        </div>
                    </div>

                    <div className="mb-4 grid gap-4 xl:grid-cols-2">
                        <CreateUserForm roles={roleRows} groups={groupRows} />
                        <CreateGroupForm />
                    </div>

                    <div className="mb-4 rounded-2xl border border-slate-200 p-4">
                        <h3 className="mb-3 font-semibold text-slate-950">Aktīvās grupas</h3>
                        <div className="grid gap-2 md:grid-cols-2">
                            {groupRows.map((group) => (
                                <div key={group.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
                                    <span className="font-semibold text-slate-950">{group.name}</span>
                                    <span className="text-slate-500"> · {group.academic_year ?? '-'}</span>
                                    <span className="text-slate-400"> · {group.students_count ?? 0} studenti</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-950">Lietotāju saraksts</h3>
                            <p className="text-sm text-slate-500">
                                Rādīti {visibleUserRows.length} no {userRows.length} lietotājiem.
                            </p>
                        </div>

                        {userRows.length > 8 && (
                            <button
                                type="button"
                                onClick={() => setShowAllUsers((value) => !value)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                                {showAllUsers ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                                {showAllUsers ? 'Sakļaut sarakstu' : `Rādīt visus (${hiddenUserCount})`}
                            </button>
                        )}
                    </div>

                    <div className="grid gap-3">
                        {visibleUserRows.map((user) => (
                            <div key={user.id} className="rounded-2xl border border-slate-200 p-4">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="flex-1">
                                        <UserRolesForm user={user} roles={roleRows} />
                                        <UserGroupForm user={user} groups={groupRows} />
                                    </div>
                                    <DeleteUserButton user={user} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <Gauge className="h-5 w-5 text-slate-700" />
                        <div>
                            <h3 className="font-semibold text-slate-950">Stabilitātes robežvērtības</h3>
                            <p className="text-sm text-slate-500">Šīs vērtības izmanto simulatora kritēriju pārbaudēs.</p>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {limitRows.map((limit) => (
                            <VesselLimitForm key={limit.id} limit={limit} />
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <Database className="h-5 w-5 text-slate-700" />
                        <div>
                            <h3 className="font-semibold text-slate-950">Kravu tipi</h3>
                            <p className="text-sm text-slate-500">Kravu blīvums tiek izmantots tilpuma aprēķinos.</p>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {cargoRows.map((cargoType) => (
                            <CargoTypeForm key={cargoType.id} cargoType={cargoType} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
