import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    GraduationCap,
    Save,
    Scale,
    Ship,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type CriterionStatus = 'pass' | 'warning' | 'fail';

type Submission = {
    id: number;
    status: string;
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

    snapshot: {
        metrics: Record<string, number | string>;
        criteria: {
            name: string;
            requirement: string;
            actual: string;
            status: CriterionStatus;
            comment: string;
        }[];
        hold_loads: {
            name: string;
            code: string;
            weight_tonnes: number;
            capacity_tonnes: number;
            load_percent: number;
            lcg: number;
        }[];
    };
};

type TeacherSubmissionShowProps = {
    submission: Submission;
};

type TeacherSubmissionPageProps = PageProps<{
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}>;

function criterionBadge(status: CriterionStatus) {
    if (status === 'fail') {
        return 'bg-red-50 text-red-700 ring-red-100';
    }

    if (status === 'warning') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

function criterionLabel(status: CriterionStatus) {
    if (status === 'fail') return 'Neatbilst';
    if (status === 'warning') return 'Jāpārbauda';
    return 'Atbilst';
}

function MetricBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
        </div>
    );
}

export default function TeacherSubmissionShow({
    submission,
}: TeacherSubmissionShowProps) {
    const { props } = usePage<TeacherSubmissionPageProps>();
    const success = props.flash?.success;
    const error = props.flash?.error;
    const validationErrors = props.errors;

    const [score, setScore] = useState(
        submission.score !== null ? String(submission.score) : '',
    );
    const [teacherComment, setTeacherComment] = useState(
        submission.teacher_comment ?? '',
    );
    const [processing, setProcessing] = useState(false);

    const submitGrade = (event: FormEvent) => {
        event.preventDefault();

        setProcessing(true);

        router.patch(
            `/teacher/submissions/${submission.id}/grade`,
            {
                score,
                teacher_comment: teacherComment,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const metrics = submission.snapshot.metrics ?? {};
    const criteria = submission.snapshot.criteria ?? [];
    const holdLoads = submission.snapshot.hold_loads ?? [];

    return (
        <AuthenticatedLayout
            title="Iesnieguma pārskats"
            subtitle="Pasniedzēja vērtēšana un stabilitātes snapshot analīze"
        >
            <Head title="Iesnieguma pārskats" />

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

                {validationErrors && Object.keys(validationErrors).length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <strong>Validācijas kļūda:</strong> vērtējumam jābūt robežās no 0 līdz 10.
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <GraduationCap className="h-4 w-4" />
                                {submission.student.name ?? 'Students'} · {submission.student.email ?? '-'}
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                {submission.scenario.title ?? 'Iesniegums'}
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Iesniegts: {submission.submitted_at_display ?? '-'}.
                                Šeit redzams saglabātais stabilitātes aprēķinu snapshot, kas tika
                                nofiksēts studenta iesniegšanas brīdī.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Vērtējums
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {submission.score !== null ? `${submission.score}/10` : 'Nav vērtēts'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricBox
                        label="GM"
                        value={metrics.gm !== undefined ? `${metrics.gm} m` : '-'}
                    />
                    <MetricBox
                        label="Displacement"
                        value={metrics.displacement !== undefined ? `${Number(metrics.displacement).toLocaleString('lv-LV')} t` : '-'}
                    />
                    <MetricBox
                        label="Trims"
                        value={metrics.trim !== undefined ? `${Math.abs(Number(metrics.trim))} m` : '-'}
                    />
                    <MetricBox
                        label="Sasvērums"
                        value={metrics.heel !== undefined ? `${metrics.heel}°` : '-'}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-slate-700" />
                                    <h3 className="text-base font-semibold text-slate-950">
                                        Kritēriju pārbaude
                                    </h3>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Kritērijs</th>
                                            <th className="px-4 py-3 font-semibold">Prasība</th>
                                            <th className="px-4 py-3 font-semibold">Faktiski</th>
                                            <th className="px-4 py-3 font-semibold">Statuss</th>
                                            <th className="px-4 py-3 font-semibold">Komentārs</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {criteria.map((criterion) => (
                                            <tr
                                                key={criterion.name}
                                                className="border-b border-slate-100 last:border-0"
                                            >
                                                <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                                    {criterion.name}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-600">
                                                    {criterion.requirement}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-600">
                                                    {criterion.actual}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${criterionBadge(criterion.status)}`}>
                                                        {criterionLabel(criterion.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-500">
                                                    {criterion.comment}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <Ship className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    Tilpņu noslodze iesniegšanas brīdī
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {holdLoads.map((hold) => (
                                    <div key={hold.code}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-700">
                                                {hold.code} · {hold.name}
                                            </span>
                                            <span className="text-slate-500">
                                                {hold.load_percent}% · {hold.weight_tonnes.toLocaleString('lv-LV')} t
                                            </span>
                                        </div>

                                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={[
                                                    'h-full rounded-full',
                                                    hold.load_percent >= 100
                                                        ? 'bg-red-600'
                                                        : hold.load_percent >= 90
                                                            ? 'bg-red-500'
                                                            : hold.load_percent >= 75
                                                                ? 'bg-amber-500'
                                                                : 'bg-emerald-500',
                                                ].join(' ')}
                                                style={{ width: `${Math.min(hold.load_percent, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    Studenta komentārs
                                </h3>
                            </div>

                            <p className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                {submission.student_comment || 'Students nav pievienojis komentāru.'}
                            </p>
                        </div>

                        <form
                            onSubmit={submitGrade}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-slate-700" />
                                <h3 className="text-base font-semibold text-slate-950">
                                    Vērtēšana
                                </h3>
                            </div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Vērtējums no 0 līdz 10
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.01"
                                value={score}
                                onChange={(event) => setScore(event.target.value)}
                                required
                                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                            />

                            <label className="mb-2 mt-4 block text-sm font-medium text-slate-700">
                                Pasniedzēja komentārs
                            </label>

                            <textarea
                                value={teacherComment}
                                onChange={(event) => setTeacherComment(event.target.value)}
                                rows={5}
                                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                                placeholder="Piemēram: GM robeža izpildīta, bet tilpņu noslodze ir pārāk tuvu limitam."
                            />

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Saglabā...' : 'Saglabāt vērtējumu'}
                            </button>
                        </form>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                            <div className="mb-2 flex items-center gap-2 font-semibold">
                                <AlertTriangle className="h-4 w-4" />
                                Mācību piezīme
                            </div>
                            Vērtējumu vēlāk varēsim aprēķināt arī automātiski pēc kritēriju svara,
                            bet šobrīd pasniedzējs piešķir gala atzīmi manuāli.
                        </div>

                        <Link
                            href="/teacher/submissions"
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Atpakaļ uz iesniegumiem
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}