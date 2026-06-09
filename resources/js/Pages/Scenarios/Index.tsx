import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import {
    AlertTriangle,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    FilePenLine,
    GraduationCap,
    Plus,
    Ship,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type Scenario = {
    id: number;
    title: string;
    short_description?: string;
    course?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    mode: 'training' | 'exam';
    status: 'draft' | 'published' | 'archived';
    due_at?: string;
    due_at_display?: string;
    estimated_minutes?: number;
    vessel_name?: string;
    cargo_plan_name?: string;
    creator_name?: string;
    show_hints: boolean;
    allow_solution_comparison: boolean;
};

type VesselOption = {
    id: number;
    name: string;
    type?: string;
    imo_number?: string;
};

type CargoPlanOption = {
    id: number;
    name: string;
    vessel_id: number;
    vessel_name?: string;
};

type ScenariosIndexProps = {
    scenarios: Scenario[];
    vessels: VesselOption[];
    cargoPlans: CargoPlanOption[];
};

type ScenarioPageProps = PageProps<{
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}>;

function statusBadge(status: Scenario['status']) {
    if (status === 'published') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (status === 'archived') {
        return 'bg-slate-100 text-slate-600 ring-slate-200';
    }

    return 'bg-amber-50 text-amber-700 ring-amber-100';
}

function statusLabel(status: Scenario['status']) {
    if (status === 'published') {
        return 'Publicēts';
    }

    if (status === 'archived') {
        return 'Arhivēts';
    }

    return 'Melnraksts';
}

function difficultyLabel(difficulty: Scenario['difficulty']) {
    if (difficulty === 'easy') {
        return 'Viegls';
    }

    if (difficulty === 'hard') {
        return 'Sarežģīts';
    }

    return 'Vidējs';
}

function modeLabel(mode: Scenario['mode']) {
    return mode === 'exam' ? 'Eksāmens' : 'Mācību režīms';
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
    icon: typeof ClipboardList;
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

function ScenarioForm({
    vessels,
    cargoPlans,
}: {
    vessels: VesselOption[];
    cargoPlans: CargoPlanOption[];
}) {
    const firstVesselId = vessels[0]?.id ?? '';

    const [vesselId, setVesselId] = useState(String(firstVesselId));
    const [cargoPlanId, setCargoPlanId] = useState('');
    const [title, setTitle] = useState('');
    const [course, setCourse] = useState('Kuģa stabilitāte');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [mode, setMode] = useState<'training' | 'exam'>('training');
    const [dueAt, setDueAt] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState('45');
    const [shortDescription, setShortDescription] = useState('');
    const [taskText, setTaskText] = useState('');
    const [finalRequirements, setFinalRequirements] = useState('');
    const [studentHints, setStudentHints] = useState('');
    const [showHints, setShowHints] = useState(true);
    const [allowSolutionComparison, setAllowSolutionComparison] = useState(false);
    const [processing, setProcessing] = useState(false);

    const filteredCargoPlans = useMemo(() => {
        return cargoPlans.filter((plan) => String(plan.vessel_id) === String(vesselId));
    }, [cargoPlans, vesselId]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        setProcessing(true);

        router.post(
            '/scenarios',
            {
                vessel_id: vesselId,
                cargo_plan_id: cargoPlanId || null,
                title,
                short_description: shortDescription,
                task_text: taskText,
                course,
                difficulty,
                mode,
                due_at: dueAt || null,
                estimated_minutes: estimatedMinutes || null,
                final_requirements: finalRequirements,
                student_hints: studentHints,
                show_hints: showHints,
                allow_solution_comparison: allowSolutionComparison,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setTitle('');
                    setShortDescription('');
                    setTaskText('');
                    setFinalRequirements('');
                    setStudentHints('');
                    setCargoPlanId('');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-950">
                    Izveidot jaunu scenāriju
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Scenārijs sākumā tiek saglabāts kā melnraksts. Pēc pārbaudes to var publicēt studentiem.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Scenārija nosaukums
                        </label>
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                            placeholder="Piemēram: Kravas sadales pārbaude"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Kurss / priekšmets
                        </label>
                        <input
                            value={course}
                            onChange={(event) => setCourse(event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Kuģis
                        </label>
                        <select
                            value={vesselId}
                            onChange={(event) => {
                                setVesselId(event.target.value);
                                setCargoPlanId('');
                            }}
                            required
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        >
                            {vessels.map((vessel) => (
                                <option key={vessel.id} value={vessel.id}>
                                    {vessel.name} {vessel.imo_number ? `· IMO ${vessel.imo_number}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Aktīvais kravas plāns
                        </label>
                        <select
                            value={cargoPlanId}
                            onChange={(event) => setCargoPlanId(event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        >
                            <option value="">Bez piesaistīta kravas plāna</option>
                            {filteredCargoPlans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Režīms
                        </label>
                        <select
                            value={mode}
                            onChange={(event) => setMode(event.target.value as 'training' | 'exam')}
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        >
                            <option value="training">Mācību režīms</option>
                            <option value="exam">Eksāmena režīms</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Grūtības pakāpe
                        </label>
                        <select
                            value={difficulty}
                            onChange={(event) => setDifficulty(event.target.value as 'easy' | 'medium' | 'hard')}
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        >
                            <option value="easy">Viegls</option>
                            <option value="medium">Vidējs</option>
                            <option value="hard">Sarežģīts</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Termiņš
                        </label>
                        <input
                            type="datetime-local"
                            value={dueAt}
                            onChange={(event) => setDueAt(event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Aptuvenais izpildes laiks minūtēs
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="600"
                            value={estimatedMinutes}
                            onChange={(event) => setEstimatedMinutes(event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Īss apraksts
                    </label>
                    <textarea
                        value={shortDescription}
                        onChange={(event) => setShortDescription(event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        placeholder="Īss scenārija kopsavilkums studentam vai pasniedzējam."
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Uzdevuma teksts
                    </label>
                    <textarea
                        value={taskText}
                        onChange={(event) => setTaskText(event.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        placeholder="Apraksti, kas studentam jāizdara simulatorā."
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Gala prasības
                    </label>
                    <textarea
                        value={finalRequirements}
                        onChange={(event) => setFinalRequirements(event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        placeholder="Piemēram: GM jābūt virs robežas, trims pieļaujamās robežās, jāģenerē PDF pārskats."
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Hinti studentam
                    </label>
                    <textarea
                        value={studentHints}
                        onChange={(event) => setStudentHints(event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        placeholder="Hinti tiks izmantoti mācību režīmā."
                    />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={showHints}
                            onChange={(event) => setShowHints(event.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                        />
                        Rādīt hintus mācību režīmā
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={allowSolutionComparison}
                            onChange={(event) => setAllowSolutionComparison(event.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                        />
                        Atļaut risinājuma salīdzināšanu
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Plus className="h-4 w-4" />
                    {processing ? 'Saglabā...' : 'Izveidot scenāriju'}
                </button>
            </form>
        </div>
    );
}

function ScenarioList({ scenarios }: { scenarios: Scenario[] }) {
    const updateStatus = (scenarioId: number, status: Scenario['status']) => {
        router.patch(
            `/scenarios/${scenarioId}/status`,
            { status },
            { preserveScroll: true },
        );
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-950">
                    Scenāriju saraksts
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Pārvaldi mācību un eksāmenu scenārijus.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Scenārijs</th>
                            <th className="px-4 py-3 font-semibold">Kuģis / kravas plāns</th>
                            <th className="px-4 py-3 font-semibold">Režīms</th>
                            <th className="px-4 py-3 font-semibold">Termiņš</th>
                            <th className="px-4 py-3 font-semibold">Statuss</th>
                            <th className="px-4 py-3 font-semibold">Darbības</th>
                        </tr>
                    </thead>

                    <tbody>
                        {scenarios.map((scenario) => (
                            <tr
                                key={scenario.id}
                                className="border-b border-slate-100 align-top last:border-0"
                            >
                                <td className="px-4 py-4">
                                    <div className="font-semibold text-slate-950">
                                        {scenario.title}
                                    </div>
                                    <div className="mt-1 max-w-xl text-sm text-slate-500">
                                        {scenario.short_description ?? 'Nav apraksta'}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                                            {scenario.course ?? 'Nav kursa'}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                                            {difficultyLabel(scenario.difficulty)}
                                        </span>
                                        {scenario.show_hints && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                                                Hinti ieslēgti
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    <div className="font-medium text-slate-800">
                                        {scenario.vessel_name ?? '-'}
                                    </div>
                                    <div className="mt-1 text-slate-500">
                                        {scenario.cargo_plan_name ?? 'Nav kravas plāna'}
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <span
                                        className={[
                                            'rounded-full px-3 py-1 text-xs font-medium ring-1',
                                            scenario.mode === 'exam'
                                                ? 'bg-red-50 text-red-700 ring-red-100'
                                                : 'bg-blue-50 text-blue-700 ring-blue-100',
                                        ].join(' ')}
                                    >
                                        {modeLabel(scenario.mode)}
                                    </span>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    <div>{scenario.due_at_display ?? 'Nav termiņa'}</div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        {scenario.estimated_minutes
                                            ? `${scenario.estimated_minutes} min`
                                            : 'Laiks nav norādīts'}
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadge(scenario.status)}`}>
                                        {statusLabel(scenario.status)}
                                    </span>
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(scenario.id, 'draft')}
                                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                        >
                                            Melnraksts
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => updateStatus(scenario.id, 'published')}
                                            className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                                        >
                                            Publicēt
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => updateStatus(scenario.id, 'archived')}
                                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                        >
                                            Arhivēt
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {scenarios.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-10 text-center text-sm text-slate-500"
                                >
                                    Pagaidām nav izveidots neviens scenārijs.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function ScenariosIndex({
    scenarios,
    vessels,
    cargoPlans,
}: ScenariosIndexProps) {
    const { props } = usePage<ScenarioPageProps>();
    const success = props.flash?.success;
    const error = props.flash?.error;
    const validationErrors = props.errors;

    const publishedCount = scenarios.filter((item) => item.status === 'published').length;
    const draftCount = scenarios.filter((item) => item.status === 'draft').length;
    const examCount = scenarios.filter((item) => item.mode === 'exam').length;

    return (
        <AuthenticatedLayout
            title="Scenāriji"
            subtitle="Pasniedzēja veidoti mācību un eksāmenu uzdevumi"
        >
            <Head title="Scenāriji" />

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
                        <strong>Validācijas kļūda:</strong> pārbaudi obligātos laukus un mēģini vēlreiz.
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                <ClipboardList className="h-4 w-4" />
                                Scenāriju pārvaldība
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-950">
                                Mācību un eksāmenu scenāriji
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Šeit pasniedzējs var izveidot simulatora uzdevumu, piesaistīt kuģi,
                                kravas plānu, izvēlēties mācību vai eksāmena režīmu un definēt gala prasības.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                Kopā scenāriji
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {scenarios.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Publicēti"
                        value={`${publishedCount}`}
                        description="Pieejami studentiem"
                        icon={CheckCircle2}
                    />

                    <SummaryCard
                        title="Melnraksti"
                        value={`${draftCount}`}
                        description="Vēl nav publicēti"
                        icon={FilePenLine}
                    />

                    <SummaryCard
                        title="Eksāmeni"
                        value={`${examCount}`}
                        description="Uzdevumi ar ierobežotu palīdzību"
                        icon={GraduationCap}
                    />

                    <SummaryCard
                        title="Termiņi"
                        value={`${scenarios.filter((item) => item.due_at_display).length}`}
                        description="Scenāriji ar norādītu nodošanas laiku"
                        icon={CalendarClock}
                    />
                </div>

                <ScenarioForm vessels={vessels} cargoPlans={cargoPlans} />

                <ScenarioList scenarios={scenarios} />

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                    <div className="mb-2 flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-4 w-4" />
                        Nākamais uzlabojums
                    </div>
                    Šobrīd scenārijs tiek izveidots un publicēts, bet vēl nav studentu piešķiršanas.
                    Nākamajā solī pievienosim <strong>uzdevumu piešķiršanu studentiem/grupām</strong> un studenta darba plūsmu.
                </div>
            </div>
        </AuthenticatedLayout>
    );
}