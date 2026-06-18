import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    ClipboardList,
    GraduationCap,
    Ship,
    Target,
    UserCheck,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type Overview = {
    assignments_count: number;
    submissions_count: number;
    graded_count: number;
    students_count: number;
    scenarios_count: number;
    average_score: number | null;
};

type AssignmentStatusStat = {
    status: string;
    label: string;
    count: number;
};

type ScenarioStat = {
    id: number;
    title: string;
    mode: string;
    difficulty: string;
    vessel_name?: string;
    vessel_type?: string;
    assignments_count: number;
    submissions_count: number;
    graded_count: number;
    average_score: number | null;
    failed_criteria: number;
    warning_criteria: number;
};

type CriteriaStat = {
    name: string;
    pass: number;
    warning: number;
    fail: number;
    total: number;
    issues: number;
};

type ScoreDistribution = {
    range: string;
    count: number;
};

type VesselTypeStat = {
    type: string;
    submissions: number;
    average_score: number | null;
};

type RecentSubmission = {
    id: number;
    student_name?: string;
    student_email?: string;
    scenario_title?: string;
    vessel_name?: string;
    status: string;
    score: number | null;
    submitted_at_display?: string;
};

type TeacherAnalyticsIndexProps = {
    overview: Overview;
    assignmentStatusStats: AssignmentStatusStat[];
    scenarioStats: ScenarioStat[];
    criteriaStats: CriteriaStat[];
    scoreDistribution: ScoreDistribution[];
    vesselTypeStats: VesselTypeStat[];
    recentSubmissions: RecentSubmission[];
};

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

function ChartCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-950">
                    {title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>

            <div className="h-[24rem]">
                {children}
            </div>
        </div>
    );
}

function formatScore(score: number | null) {
    if (score === null || score === undefined) {
        return '-';
    }

    return `${score}/10`;
}

function modeLabel(mode: string) {
    return mode === 'exam' ? 'Eksāmens' : 'Mācību režīms';
}

export default function TeacherAnalyticsIndex({
    overview,
    assignmentStatusStats,
    scenarioStats,
    criteriaStats,
    scoreDistribution,
    vesselTypeStats,
    recentSubmissions,
}: TeacherAnalyticsIndexProps) {
    const topIssue = criteriaStats[0];

    return (
        <AuthenticatedLayout
            title="Analītika"
            subtitle="Studentu rezultāti, biežākās kļūdas un scenāriju statistika"
        >
            <Head title="Analītika" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <BarChart3 className="h-4 w-4" />
                                Pasniedzēja analītika
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                Studentu darba rezultātu pārskats
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šajā sadaļā pasniedzējs var redzēt, cik uzdevumi ir piešķirti,
                                cik ir iesniegti, kādi kritēriji visbiežāk rada kļūdas un kā
                                rezultāti atšķiras pa scenārijiem un kuģu tipiem.
                            </p>
                        </div>

                        <Link
                            href="/teacher/submissions"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Atvērt iesniegumus
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Piešķirtie uzdevumi"
                        value={`${overview.assignments_count}`}
                        description={`${overview.students_count} unikāli studenti`}
                        icon={ClipboardList}
                    />

                    <SummaryCard
                        title="Iesniegumi"
                        value={`${overview.submissions_count}`}
                        description={`${overview.graded_count} jau novērtēti`}
                        icon={CheckCircle2}
                    />

                    <SummaryCard
                        title="Vidējais vērtējums"
                        value={overview.average_score !== null ? `${overview.average_score}/10` : '-'}
                        description="Aprēķināts no novērtētajiem iesniegumiem"
                        icon={GraduationCap}
                    />

                    <SummaryCard
                        title="Biežākā problēma"
                        value={topIssue ? `${topIssue.issues}` : '0'}
                        description={topIssue ? topIssue.name : 'Nav datu par kritērijiem'}
                        icon={AlertTriangle}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <ChartCard
                        title="Uzdevumu statusi"
                        description="Cik uzdevumi ir piešķirti, procesā, iesniegti un novērtēti."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={assignmentStatusStats} margin={{ top: 10, right: 24, left: 12, bottom: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" height={42} tickMargin={8} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" name="Skaits" fill="#0f172a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Vērtējumu sadalījums"
                        description="Cik iesniegumi ietilpst katrā vērtējumu intervālā."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreDistribution} margin={{ top: 10, right: 24, left: 12, bottom: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" height={42} tickMargin={8} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" name="Iesniegumi" fill="#047857" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <ChartCard
                        title="Kritēriju problēmas"
                        description="Biežākie warning un fail statusi stabilitātes kritērijos."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={criteriaStats.slice(0, 8)} margin={{ top: 10, right: 24, left: 12, bottom: 32 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11 }}
                                    interval={0}
                                    angle={-20}
                                    textAnchor="end"
                                    height={90}
                                    tickMargin={8}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={28} />
                                <Bar dataKey="warning" name="Warning" fill="#d97706" />
                                <Bar dataKey="fail" name="Fail" fill="#dc2626" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Rezultāti pa kuģu tipiem"
                        description="Iesniegumu skaits un vidējais vērtējums pēc kuģa tipa."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={vesselTypeStats} margin={{ top: 10, right: 24, left: 12, bottom: 32 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="type"
                                    tick={{ fontSize: 11 }}
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                    height={70}
                                    tickMargin={8}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={28} />
                                <Bar dataKey="submissions" name="Iesniegumi" fill="#2563eb" />
                                <Bar dataKey="average_score" name="Vidējais vērtējums" fill="#7c3aed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Scenāriju rezultāti
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Salīdzinājums starp scenārijiem, iesniegumiem, vērtējumiem un kritēriju kļūdām.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Scenārijs</th>
                                    <th className="px-4 py-3 font-semibold">Kuģis</th>
                                    <th className="px-4 py-3 font-semibold">Režīms</th>
                                    <th className="px-4 py-3 font-semibold">Piešķirts</th>
                                    <th className="px-4 py-3 font-semibold">Iesniegts</th>
                                    <th className="px-4 py-3 font-semibold">Novērtēts</th>
                                    <th className="px-4 py-3 font-semibold">Vidēji</th>
                                    <th className="px-4 py-3 font-semibold">Kļūdas</th>
                                </tr>
                            </thead>

                            <tbody>
                                {scenarioStats.map((scenario) => (
                                    <tr
                                        key={scenario.id}
                                        className="border-b border-slate-100 align-top last:border-0"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-950">
                                                {scenario.title}
                                            </div>
                                            <div className="mt-1 text-sm text-slate-500">
                                                Grūtība: {scenario.difficulty}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Ship className="h-4 w-4 text-slate-400" />
                                                {scenario.vessel_name ?? '-'}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                {scenario.vessel_type ?? '-'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {modeLabel(scenario.mode)}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                            {scenario.assignments_count}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                            {scenario.submissions_count}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                            {scenario.graded_count}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                            {formatScore(scenario.average_score)}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100">
                                                Fail: {scenario.failed_criteria}
                                            </span>
                                            <span className="ml-2 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                                                Warning: {scenario.warning_criteria}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {scenarioStats.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                        >
                                            Pagaidām nav scenāriju datu.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-950">
                            Pēdējie iesniegumi
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Ātra piekļuve nesenajiem studentu darbiem.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Students</th>
                                    <th className="px-4 py-3 font-semibold">Scenārijs</th>
                                    <th className="px-4 py-3 font-semibold">Kuģis</th>
                                    <th className="px-4 py-3 font-semibold">Statuss</th>
                                    <th className="px-4 py-3 font-semibold">Vērtējums</th>
                                    <th className="px-4 py-3 font-semibold">Darbība</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSubmissions.map((submission) => (
                                    <tr
                                        key={submission.id}
                                        className="border-b border-slate-100 last:border-0"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-950">
                                                {submission.student_name ?? 'Students'}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {submission.student_email ?? '-'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {submission.scenario_title ?? '-'}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {submission.vessel_name ?? '-'}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {submission.status === 'graded' ? 'Novērtēts' : 'Iesniegts'}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                            {formatScore(submission.score)}
                                        </td>

                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/teacher/submissions/${submission.id}`}
                                                className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                                            >
                                                Atvērt
                                            </Link>
                                        </td>
                                    </tr>
                                ))}

                                {recentSubmissions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                        >
                                            Pagaidām nav iesniegumu.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                    <div className="mb-2 flex items-center gap-2 font-semibold">
                        <Target className="h-4 w-4" />
                        Ko šī analītika dod pasniedzējam?
                    </div>
                    Pasniedzējs var ātri redzēt, vai studenti biežāk kļūdās ar GM, trimu,
                    sasvērumu, brīvās virsmas efektu vai tilpņu noslodzi. Tas palīdz saprast,
                    kurai tēmai nākamajā nodarbībā jāpievērš vairāk uzmanības.
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
