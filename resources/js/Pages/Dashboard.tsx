import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    FileText,
    GraduationCap,
    PackageOpen,
    Scale,
    Settings,
    Ship,
    Users,
    Waves,
} from 'lucide-react';

type DashboardMode = 'student' | 'teacher' | 'admin';

type HoldLoad = {
    name?: string;
    code?: string;
    weight_tonnes?: number | string | null;
    capacity_tonnes?: number | string | null;
    load_percent?: number | string | null;
    lcg?: number | string | null;
};

type Analysis = {
    vessel?: {
        id?: number;
        name?: string | null;
        type?: string | null;
        imo_number?: string | null;
    };
    condition?: {
        cargo_plan_name?: string | null;
        mode?: string | null;
    };
    metrics?: {
        displacement?: number | string | null;
        lightship_weight?: number | string | null;
        cargo_weight?: number | string | null;
        ballast_weight?: number | string | null;
        kg?: number | string | null;
        km?: number | string | null;
        gm?: number | string | null;
        free_surface_correction?: number | string | null;
        trim?: number | string | null;
        trim_direction?: string | null;
        heel?: number | string | null;
        fore_draft?: number | string | null;
        aft_draft?: number | string | null;
        mean_draft?: number | string | null;
        max_gz?: number | string | null;
        angle_at_max_gz?: number | string | null;
    };
    criteria?: {
        name?: string;
        requirement?: string;
        actual?: string;
        status?: string;
        comment?: string;
    }[];
    hold_loads?: HoldLoad[];
};

type Workspace = {
    mode?: string;
    assignment_id?: number;
    solution_id?: number;
    status?: string | null;
    is_locked?: boolean;
    scenario_title?: string | null;
    score?: number | string | null;
    teacher_comment?: string | null;
} | null;

type StudentAssignment = {
    id: number;
    status?: string | null;
    assigned_at?: string | null;
    started_at?: string | null;
    submitted_at?: string | null;
    due_at?: string | null;
    has_solution?: boolean;
    score?: number | string | null;
    teacher_comment?: string | null;
    scenario?: {
        id?: number | null;
        title?: string | null;
        difficulty?: string | null;
        mode?: string | null;
    };
    vessel?: {
        id?: number | null;
        name?: string | null;
        type?: string | null;
        imo_number?: string | null;
    };
};

type StudentDashboard = {
    stats?: {
        total?: number | string | null;
        assigned?: number | string | null;
        in_progress?: number | string | null;
        submitted?: number | string | null;
        graded?: number | string | null;
    };
    current_assignment?: StudentAssignment | null;
    recent_assignments?: StudentAssignment[];
} | null;

type SubmissionItem = {
    id: number;
    status?: string | null;
    score?: number | string | null;
    submitted_at?: string | null;
    student?: {
        name?: string | null;
        email?: string | null;
    };
    scenario?: {
        title?: string | null;
    };
    vessel?: {
        name?: string | null;
        imo_number?: string | null;
    };
    metrics?: {
        gm?: number | string | null;
        trim?: number | string | null;
        heel?: number | string | null;
        displacement?: number | string | null;
    };
    criteria_summary?: {
        total?: number | string | null;
        fail?: number | string | null;
        warning?: number | string | null;
        pass?: number | string | null;
    };
};

type TeacherDashboard = {
    stats?: {
        submissions_total?: number | string | null;
        submissions_pending?: number | string | null;
        submissions_graded?: number | string | null;
        average_score?: number | string | null;
        scenarios_total?: number | string | null;
        scenarios_published?: number | string | null;
        vessels_total?: number | string | null;
    };
    recent_submissions?: SubmissionItem[];
} | null;

type AdminDashboard = {
    stats?: {
        users_total?: number | string | null;
        students_total?: number | string | null;
        teachers_total?: number | string | null;
        admins_total?: number | string | null;
        vessels_total?: number | string | null;
        active_vessels_total?: number | string | null;
        scenarios_total?: number | string | null;
        published_scenarios_total?: number | string | null;
        submissions_total?: number | string | null;
        graded_submissions_total?: number | string | null;
    };
    recent_submissions?: SubmissionItem[];
} | null;

type DashboardProps = {
    mode?: DashboardMode;
    analysis?: Analysis | null;
    workspace?: Workspace;
    studentDashboard?: StudentDashboard;
    teacherDashboard?: TeacherDashboard;
    adminDashboard?: AdminDashboard;
};

function toNumber(value: number | string | null | undefined) {
    const number = Number(value ?? 0);

    return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: number | string | null | undefined, digits = 2) {
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

function criteriaBadge(status?: string) {
    if (status === 'fail') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

    if (status === 'warning') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

function criteriaLabel(status?: string) {
    if (status === 'fail') {
        return 'Neatbilst';
    }

    if (status === 'warning') {
        return 'Jāpārbauda';
    }

    if (status === 'pass') {
        return 'Atbilst';
    }

    return status ?? '-';
}

function loadStatusText(loadPercent: number) {
    if (loadPercent > 100) {
        return 'Pārsniegts';
    }

    if (loadPercent >= 90) {
        return 'Augsta noslodze';
    }

    if (loadPercent >= 60) {
        return 'Optimāli';
    }

    if (loadPercent > 0) {
        return 'Zema noslodze';
    }

    return 'Tukšs';
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

function QuickLink({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:bg-[#E7EFED] hover:border-slate-300 hover:shadow-md"
        >
            <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[#155f4c] p-3 text-white">
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <h3 className="font-semibold text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    );
}

function shipLoadColor(loadPercent: number) {
    if (loadPercent > 100) {
        return '#dc2626';
    }

    if (loadPercent >= 90) {
        return '#f59e0b';
    }

    if (loadPercent >= 60) {
        return '#22c55e';
    }

    if (loadPercent > 0) {
        return '#0ea5e9';
    }

    return '#cbd5e1';
}

function shipLoadLabel(loadPercent: number) {
    if (loadPercent > 100) {
        return 'Pārslogots';
    }

    if (loadPercent >= 90) {
        return 'Augsta noslodze';
    }

    if (loadPercent >= 60) {
        return 'Labi';
    }

    if (loadPercent > 0) {
        return 'Zema noslodze';
    }

    return 'Tukšs';
}

function ShipCargoSideProfile({
    holdLoads,
    vesselName,
    metrics,
}: {
    holdLoads: HoldLoad[];
    vesselName?: string | null;
    metrics?: Analysis['metrics'];
}) {
    if (holdLoads.length === 0) {
        return null;
    }

    const visibleHolds = holdLoads.slice(0, 10);
    const holdCount = Math.max(visibleHolds.length, 1);

    const startX = 185;
    const endX = 770;
    const gap = 7;
    const availableWidth = endX - startX;
    const holdWidth = (availableWidth - gap * (holdCount - 1)) / holdCount;

    const overloadedCount = visibleHolds.filter((hold) => toNumber(hold.load_percent) > 100).length;
    const warningCount = visibleHolds.filter((hold) => {
        const load = toNumber(hold.load_percent);
        return load >= 90 && load <= 100;
    }).length;

    const averageLoad =
        visibleHolds.reduce((sum, hold) => sum + toNumber(hold.load_percent), 0) /
        Math.max(visibleHolds.length, 1);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-slate-950">
                            Kuģa stāvokļa kopsavilkums
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Kuģa sānskats ar kravas tilpņu aizpildījumu un galvenajiem stabilitātes rādītājiem.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                            Vidējā noslodze: {formatNumber(averageLoad, 1)}%
                        </span>

                        <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 ring-1 ring-amber-100">
                            Brīdinājumi: {formatNumber(warningCount, 0)}
                        </span>

                        <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700 ring-1 ring-red-100">
                            Pārslogoti: {formatNumber(overloadedCount, 0)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50 to-white p-4">
                    <svg
                        viewBox="0 0 960 330"
                        className="h-auto w-full"
                        role="img"
                        aria-label="Kuģa sānskats ar kravas tilpņu noslodzi"
                    >
                        <defs>
                            <linearGradient id="shipHullGradient" x1="0" x2="1" y1="0" y2="1">
                                <stop offset="0%" stopColor="#1f2937" />
                                <stop offset="100%" stopColor="#020617" />
                            </linearGradient>

                            <linearGradient id="shipDeckGradient" x1="0" x2="1" y1="0" y2="0">
                                <stop offset="0%" stopColor="#f8fafc" />
                                <stop offset="100%" stopColor="#e2e8f0" />
                            </linearGradient>

                            <filter id="shipShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow
                                    dx="0"
                                    dy="8"
                                    stdDeviation="8"
                                    floodColor="#0f172a"
                                    floodOpacity="0.18"
                                />
                            </filter>
                        </defs>

                        <rect x="0" y="0" width="960" height="330" rx="28" fill="#f8fafc" />

                        <path
                            d="M55 258 C175 285 740 292 890 258"
                            stroke="#bae6fd"
                            strokeWidth="8"
                            strokeLinecap="round"
                            fill="none"
                        />

                        <path
                            d="M92 214 L810 214 C855 214 893 202 922 177 L875 260 C820 289 195 289 102 260 Z"
                            fill="url(#shipHullGradient)"
                            filter="url(#shipShadow)"
                        />

                        <path
                            d="M120 207 L818 207"
                            stroke="#94a3b8"
                            strokeWidth="5"
                            strokeLinecap="round"
                        />

                        <path
                            d="M90 214 L122 174 L152 214 Z"
                            fill="#111827"
                        />

                        <path
                            d="M810 214 L900 178 L855 214 Z"
                            fill="#111827"
                        />

                        <rect
                            x="124"
                            y="151"
                            width="690"
                            height="12"
                            rx="5"
                            fill="url(#shipDeckGradient)"
                            stroke="#cbd5e1"
                        />

                        <rect x="105" y="103" width="58" height="47" rx="5" fill="#f8fafc" stroke="#94a3b8" />
                        <rect x="116" y="86" width="40" height="22" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
                        <rect x="123" y="70" width="24" height="18" rx="3" fill="#f8fafc" stroke="#94a3b8" />

                        <rect x="115" y="113" width="11" height="9" rx="1" fill="#38bdf8" opacity="0.75" />
                        <rect x="133" y="113" width="11" height="9" rx="1" fill="#38bdf8" opacity="0.75" />
                        <rect x="151" y="113" width="7" height="9" rx="1" fill="#38bdf8" opacity="0.75" />

                        <line x1="135" y1="70" x2="135" y2="36" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                        <line x1="137" y1="45" x2="180" y2="62" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />

                        <line x1="300" y1="151" x2="278" y2="82" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                        <line x1="278" y1="82" x2="350" y2="116" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

                        <line x1="470" y1="151" x2="448" y2="82" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                        <line x1="448" y1="82" x2="520" y2="116" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

                        <line x1="640" y1="151" x2="618" y2="82" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                        <line x1="618" y1="82" x2="690" y2="116" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

                        {visibleHolds.map((hold, index) => {
                            const loadPercent = toNumber(hold.load_percent);
                            const safeLoadPercent = Math.min(Math.max(loadPercent, 0), 100);
                            const x = startX + index * (holdWidth + gap);
                            const outerY = 161;
                            const outerHeight = 54;
                            const fillHeight = Math.max((safeLoadPercent / 100) * outerHeight, loadPercent > 0 ? 8 : 0);
                            const fillY = outerY + outerHeight - fillHeight;
                            const color = shipLoadColor(loadPercent);

                            return (
                                <g key={`${hold.code ?? 'hold'}-${index}`}>
                                    <rect
                                        x={x}
                                        y={outerY}
                                        width={holdWidth}
                                        height={outerHeight}
                                        rx="5"
                                        fill="#ffffff"
                                        stroke="#cbd5e1"
                                        strokeWidth="1.5"
                                    />

                                    <rect
                                        x={x + 2}
                                        y={fillY}
                                        width={holdWidth - 4}
                                        height={fillHeight}
                                        rx="4"
                                        fill={color}
                                        opacity="0.95"
                                    />

                                    {loadPercent > 100 && (
                                        <rect
                                            x={x + 2}
                                            y={outerY + 2}
                                            width={holdWidth - 4}
                                            height="8"
                                            rx="3"
                                            fill="#991b1b"
                                        />
                                    )}

                                    <text
                                        x={x + holdWidth / 2}
                                        y={outerY + 22}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="#0f172a"
                                    >
                                        {hold.code ?? `H${index + 1}`}
                                    </text>

                                    <text
                                        x={x + holdWidth / 2}
                                        y={outerY + 40}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="#0f172a"
                                    >
                                        {formatNumber(loadPercent, 0)}%
                                    </text>
                                </g>
                            );
                        })}

                        <text
                            x="125"
                            y="295"
                            fontSize="13"
                            fontWeight="700"
                            fill="#0f172a"
                        >
                            {vesselName ?? 'Kuģis'}
                        </text>

                        <text
                            x="125"
                            y="313"
                            fontSize="11"
                            fill="#64748b"
                        >
                            Kravas tilpņu noslodze pēc aktīvā risinājuma
                        </text>
                    </svg>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <p className="text-xs font-medium text-slate-500">Priekšgala iegrime</p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                            {formatNumber(metrics?.fore_draft, 2)} m
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <p className="text-xs font-medium text-slate-500">Pakaļgala iegrime</p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                            {formatNumber(metrics?.aft_draft, 2)} m
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <p className="text-xs font-medium text-slate-500">GM</p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                            {formatNumber(metrics?.gm, 3)} m
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <p className="text-xs font-medium text-slate-500">Trims</p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                            {formatNumber(metrics?.trim, 3)} m
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <p className="text-xs font-medium text-slate-500">Sasvērums</p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                            {formatNumber(metrics?.heel, 3)}°
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <p className="text-xs font-medium text-slate-500">Kopējā krava</p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                            {formatNumber(metrics?.cargo_weight, 2)} t
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-slate-500 md:grid-cols-5">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        Tukšs
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                        Zema noslodze
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Labi
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        Augsta noslodze
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                        Pārslogots
                    </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-100">
                    Šis sānskats ir paredzēts ātrai situācijas uztverei — students uzreiz redz,
                    kuras kravas tilpnes ir vairāk noslogotas un kurās varētu būt nepieciešama
                    kravas pārdale.
                </div>
            </div>
        </div>
    );
}

function StudentDashboardView({
    analysis,
    workspace,
    studentDashboard,
}: {
    analysis?: Analysis | null;
    workspace?: Workspace;
    studentDashboard?: StudentDashboard;
}) {
    const stats = {
        total: 0,
        assigned: 0,
        in_progress: 0,
        submitted: 0,
        graded: 0,
        ...studentDashboard?.stats,
    };

    const assignment = studentDashboard?.current_assignment ?? null;
    const recentAssignments = Array.isArray(studentDashboard?.recent_assignments)
        ? studentDashboard?.recent_assignments ?? []
        : [];

    const metrics = {
        displacement: 0,
        cargo_weight: 0,
        ballast_weight: 0,
        kg: 0,
        km: 0,
        gm: 0,
        trim: 0,
        trim_direction: '-',
        heel: 0,
        fore_draft: 0,
        aft_draft: 0,
        ...analysis?.metrics,
    };

    const vessel = {
        name: assignment?.vessel?.name ?? analysis?.vessel?.name ?? '-',
        imo_number: assignment?.vessel?.imo_number ?? analysis?.vessel?.imo_number ?? '-',
        type: assignment?.vessel?.type ?? analysis?.vessel?.type ?? '-',
    };

    const criteria = Array.isArray(analysis?.criteria) ? analysis?.criteria ?? [] : [];
    const holdLoads = Array.isArray(analysis?.hold_loads) ? analysis?.hold_loads ?? [] : [];

    const failCount = criteria.filter((item) => item.status === 'fail').length;
    const warningCount = criteria.filter((item) => item.status === 'warning').length;

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            {assignment && (
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(assignment.status)}`}>
                                    {statusLabel(assignment.status)}
                                </span>
                            )}

                            {assignment?.scenario?.difficulty && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {difficultyLabel(assignment.scenario.difficulty)}
                                </span>
                            )}

                            {workspace?.score !== null && workspace?.score !== undefined && (
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                                    Vērtējums: {formatNumber(workspace.score, 1)}/10
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl font-semibold text-slate-950">
                            {assignment?.scenario?.title ?? workspace?.scenario_title ?? 'Nav aktīva uzdevuma'}
                        </h2>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            {assignment
                                ? `Kuģis: ${vessel.name} · IMO ${vessel.imo_number}. Šeit redzams tavs aktuālais darba stāvoklis, kravas tilpņu noslodze un galvenie stabilitātes rādītāji.`
                                : 'Tev pašlaik nav aktīva uzdevuma. Atver sadaļu “Mani uzdevumi”, lai sāktu risināšanu.'}
                        </p>

                        {workspace?.teacher_comment && (
                            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                                <strong>Pasniedzēja komentārs:</strong>
                                <br />
                                {workspace.teacher_comment}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/student/tasks"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <ClipboardCheck className="h-4 w-4" />
                            Mani uzdevumi
                        </Link>

                        {assignment && (
                            <Link
                                href={`/student/tasks/${assignment.id}`}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Atvērt uzdevumu
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Kopā uzdevumi"
                    value={formatNumber(stats.total, 0)}
                    description="Visi piešķirtie uzdevumi"
                    icon={ClipboardList}
                />

                <StatCard
                    title="Risināšanā"
                    value={formatNumber(stats.in_progress, 0)}
                    description="Pašlaik aktīvie risinājumi"
                    icon={Activity}
                />

                <StatCard
                    title="Iesniegti"
                    value={formatNumber(stats.submitted, 0)}
                    description="Gaida vērtējumu"
                    icon={FileText}
                />

                <StatCard
                    title="Novērtēti"
                    value={formatNumber(stats.graded, 0)}
                    description="Darbi ar vērtējumu"
                    icon={CheckCircle2}
                />
            </div>

            {analysis && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Displacement"
                            value={`${formatNumber(metrics.displacement)} t`}
                            description={`Krava ${formatNumber(metrics.cargo_weight)} t · Balasts ${formatNumber(metrics.ballast_weight)} t`}
                            icon={PackageOpen}
                        />

                        <StatCard
                            title="GM"
                            value={`${formatNumber(metrics.gm, 3)} m`}
                            description={`KG ${formatNumber(metrics.kg, 3)} m · KM ${formatNumber(metrics.km, 3)} m`}
                            icon={Scale}
                        />

                        <StatCard
                            title="Trim"
                            value={`${formatNumber(metrics.trim, 3)} m`}
                            description={metrics.trim_direction ?? '-'}
                            icon={Ship}
                        />

                        <StatCard
                            title="Heel"
                            value={`${formatNumber(metrics.heel, 3)}°`}
                            description={`Fail: ${failCount} · Warning: ${warningCount}`}
                            icon={warningCount > 0 || failCount > 0 ? AlertTriangle : Waves}
                        />
                    </div>

                    <ShipCargoSideProfile
    holdLoads={holdLoads}
    vesselName={vessel.name}
    metrics={metrics}
/>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <QuickLink
                            href="/cargo-plan"
                            icon={PackageOpen}
                            title="Kravas plāns"
                            description="Pārbaudi vai rediģē kravas izvietojumu."
                        />

                        <QuickLink
                            href="/ballast"
                            icon={Waves}
                            title="Balasts"
                            description="Pārbaudi vai rediģē balasta tanku stāvokli."
                        />

                        <QuickLink
                            href="/stability"
                            icon={Activity}
                            title="Stabilitāte"
                            description="Apskati GM, trim, heel un kritērijus."
                        />

                        <QuickLink
                            href="/reports"
                            icon={FileText}
                            title="Atskaites"
                            description="Ģenerē pārskatu vai PDF par risinājumu."
                        />
                    </div>

                    {criteria.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-4">
                                <h3 className="text-base font-semibold text-slate-950">
                                    Kritēriju kopsavilkums
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Kritērijs</th>
                                            <th className="px-4 py-3 font-semibold">Prasība</th>
                                            <th className="px-4 py-3 font-semibold">Faktiski</th>
                                            <th className="px-4 py-3 font-semibold">Statuss</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {criteria.slice(0, 6).map((criterion, index) => (
                                            <tr
                                                key={`${criterion.name ?? 'criterion'}-${index}`}
                                                className="border-b border-slate-100 last:border-0"
                                            >
                                                <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                                    {criterion.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-600">
                                                    {criterion.requirement ?? '-'}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-600">
                                                    {criterion.actual ?? '-'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${criteriaBadge(criterion.status)}`}>
                                                        {criteriaLabel(criterion.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {recentAssignments.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-950">
                        Pēdējie uzdevumi
                    </h3>

                    <div className="mt-4 space-y-3">
                        {recentAssignments.map((item) => (
                            <Link
                                key={item.id}
                                href={`/student/tasks/${item.id}`}
                                className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(item.status)}`}>
                                            {statusLabel(item.status)}
                                        </div>
                                        <p className="font-semibold text-slate-950">
                                            {item.scenario?.title ?? '-'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.vessel?.name ?? '-'} · IMO {item.vessel?.imo_number ?? '-'}
                                        </p>
                                    </div>

                                    {item.score !== null && item.score !== undefined && (
                                        <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                                            {formatNumber(item.score, 1)}/10
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function TeacherDashboardView({
    teacherDashboard,
}: {
    teacherDashboard?: TeacherDashboard;
}) {
    const stats = {
        submissions_total: 0,
        submissions_pending: 0,
        submissions_graded: 0,
        average_score: null,
        scenarios_total: 0,
        scenarios_published: 0,
        vessels_total: 0,
        ...teacherDashboard?.stats,
    };

    const recentSubmissions = Array.isArray(teacherDashboard?.recent_submissions)
        ? teacherDashboard?.recent_submissions ?? []
        : [];

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-950">
                            Pasniedzēja pārskats
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            Šeit redzami iesniegumi, scenāriji un ātrās darbības studentu darbu vērtēšanai.
                        </p>
                    </div>

                    <Link
                        href="/teacher/submissions"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        <GraduationCap className="h-4 w-4" />
                        Atvērt iesniegumus
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Iesniegumi"
                    value={formatNumber(stats.submissions_total, 0)}
                    description="Visi studentu iesniegumi"
                    icon={FileText}
                />

                <StatCard
                    title="Gaida vērtējumu"
                    value={formatNumber(stats.submissions_pending, 0)}
                    description="Statuss: submitted"
                    icon={AlertTriangle}
                />

                <StatCard
                    title="Novērtēti"
                    value={formatNumber(stats.submissions_graded, 0)}
                    description="Statuss: graded"
                    icon={CheckCircle2}
                />

                <StatCard
                    title="Vidējais vērtējums"
                    value={
                        stats.average_score === null || stats.average_score === undefined
                            ? '-'
                            : `${formatNumber(stats.average_score, 2)}/10`
                    }
                    description="No novērtētajiem darbiem"
                    icon={Scale}
                />
            </div>

           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <QuickLink
        href="/teacher/assignments"
        icon={ClipboardCheck}
        title="Uzdevumu piešķiršana"
        description="Piešķir publicētus scenārijus studentam vai visai grupai."
    />

    <QuickLink
        href="/teacher/students"
        icon={Users}
        title="Studenti un grupas"
        description="Apskati studentus, klases un grupu piesaisti."
    />

    <QuickLink
        href="/teacher/submissions"
        icon={GraduationCap}
        title="Vērtēšana"
        description="Atver studentu iesniegumus un vērtē snapshot rezultātus."
    />

    <QuickLink
        href="/scenarios"
        icon={ClipboardList}
        title="Scenāriji"
        description={`${formatNumber(stats.scenarios_published, 0)} publicēti no ${formatNumber(stats.scenarios_total, 0)} scenārijiem.`}
    />
</div>

            <RecentSubmissionsTable submissions={recentSubmissions} />
        </div>
    );
}

function AdminDashboardView({
    adminDashboard,
}: {
    adminDashboard?: AdminDashboard;
}) {
    const stats = {
        users_total: 0,
        students_total: 0,
        teachers_total: 0,
        admins_total: 0,
        vessels_total: 0,
        active_vessels_total: 0,
        scenarios_total: 0,
        published_scenarios_total: 0,
        submissions_total: 0,
        graded_submissions_total: 0,
        ...adminDashboard?.stats,
    };

    const recentSubmissions = Array.isArray(adminDashboard?.recent_submissions)
        ? adminDashboard?.recent_submissions ?? []
        : [];

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-950">
                            Administratora pārskats
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            Sistēmas lietotāju, kuģu, scenāriju un iesniegumu kopsavilkums.
                        </p>
                    </div>

                    <Link
                        href="/settings"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        <Settings className="h-4 w-4" />
                        Iestatījumi
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Lietotāji"
                    value={formatNumber(stats.users_total, 0)}
                    description={`Studenti ${formatNumber(stats.students_total, 0)} · Pasniedzēji ${formatNumber(stats.teachers_total, 0)}`}
                    icon={Users}
                />

                <StatCard
                    title="Kuģi"
                    value={formatNumber(stats.vessels_total, 0)}
                    description={`${formatNumber(stats.active_vessels_total, 0)} aktīvi`}
                    icon={Ship}
                />

                <StatCard
                    title="Scenāriji"
                    value={formatNumber(stats.scenarios_total, 0)}
                    description={`${formatNumber(stats.published_scenarios_total, 0)} publicēti`}
                    icon={ClipboardList}
                />

                <StatCard
                    title="Iesniegumi"
                    value={formatNumber(stats.submissions_total, 0)}
                    description={`${formatNumber(stats.graded_submissions_total, 0)} novērtēti`}
                    icon={FileText}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <QuickLink
        href="/teacher/assignments"
        icon={ClipboardCheck}
        title="Piešķīrumi"
        description="Pārskati scenāriju piešķiršanu studentiem un grupām."
    />

    <QuickLink
        href="/teacher/students"
        icon={Users}
        title="Studenti un grupas"
        description="Pārskati studentu sarakstu un grupu struktūru."
    />

    <QuickLink
        href="/vessels"
        icon={Ship}
        title="Kuģi"
        description="Pārslēdz aktīvo kuģi un apskati kuģu datubāzi."
    />

    <QuickLink
        href="/teacher/analytics"
        icon={BarChart3}
        title="Analītika"
        description="Skati kopējo sistēmas rezultātu analīzi."
    />
</div>

            <RecentSubmissionsTable submissions={recentSubmissions} />
        </div>
    );
}

function RecentSubmissionsTable({
    submissions,
}: {
    submissions: SubmissionItem[];
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-950">
                    Pēdējie iesniegumi
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Jaunākie studentu iesniegtie risinājumi.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Students</th>
                            <th className="px-4 py-3 font-semibold">Scenārijs</th>
                            <th className="px-4 py-3 font-semibold">Kuģis</th>
                            <th className="px-4 py-3 font-semibold">GM</th>
                            <th className="px-4 py-3 font-semibold">Kritēriji</th>
                            <th className="px-4 py-3 font-semibold">Statuss</th>
                            <th className="px-4 py-3 font-semibold">Darbība</th>
                        </tr>
                    </thead>

                    <tbody>
                        {submissions.map((submission) => {
                            const failCount = toNumber(submission.criteria_summary?.fail);
                            const warningCount = toNumber(submission.criteria_summary?.warning);

                            return (
                                <tr
                                    key={submission.id}
                                    className="border-b border-slate-100 last:border-0"
                                >
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-semibold text-slate-950">
                                            {submission.student?.name ?? '-'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {submission.student?.email ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">
                                        {submission.scenario?.title ?? '-'}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">
                                        {submission.vessel?.name ?? '-'}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">
                                        {formatNumber(submission.metrics?.gm, 3)} m
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">
                                        Fail: {formatNumber(failCount, 0)} · Warning: {formatNumber(warningCount, 0)}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(submission.status)}`}>
                                            {statusLabel(submission.status)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <Link
                                            href={`/teacher/submissions/${submission.id}`}
                                            className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            Atvērt
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {submissions.length === 0 && (
                <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                    Iesniegumi vēl nav atrasti.
                </div>
            )}
        </div>
    );
}

export default function Dashboard({
    mode = 'student',
    analysis,
    workspace,
    studentDashboard,
    teacherDashboard,
    adminDashboard,
}: DashboardProps) {
    return (
        <AuthenticatedLayout
            title="Pārskats"
            subtitle="Sistēmas sākuma panelis pēc lietotāja lomas"
        >
            <Head title="Pārskats" />

            {mode === 'student' && (
                <StudentDashboardView
                    analysis={analysis}
                    workspace={workspace}
                    studentDashboard={studentDashboard}
                />
            )}

            {mode === 'teacher' && (
                <TeacherDashboardView teacherDashboard={teacherDashboard} />
            )}

            {mode === 'admin' && (
                <AdminDashboardView adminDashboard={adminDashboard} />
            )}
        </AuthenticatedLayout>
    );
}