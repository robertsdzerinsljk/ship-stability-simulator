import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Anchor,
    PackageOpen,
    Scale,
    ShieldCheck,
    Waves,
} from 'lucide-react';
import MetricCard from '@/Components/dashboard/MetricCard';
import ShipSideProfile from '@/Components/dashboard/ShipSideProfile';

const warnings = [
    {
        title: '2. tilpne tuvojas maksimālajai noslodzei',
        description: 'Aizpildījums pārsniedz 90 %. Ieteicams pārskatīt kravas sadali.',
    },
    {
        title: 'GM rezerve ir zema',
        description: 'Stabilitāte ir droša, bet rezerves robeža nav liela.',
    },
    {
        title: 'Neliels trims uz pakaļgalu',
        description: 'Balasta korekcija var uzlabot kuģa stāvokli.',
    },
];

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            title="Pārskats"
            subtitle="Operatīvais kuģa stāvoklis un galvenie rādītāji"
        >
            <Head title="Pārskats" />

            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    <MetricCard
                        title="Drošības statuss"
                        value="Droši"
                        description="Visi kritiskie limiti izpildīti"
                        icon={ShieldCheck}
                        status="good"
                    />

                    <MetricCard
                        title="Kravas noslodze"
                        value="72%"
                        description="36 542 t no 50 801 t"
                        icon={PackageOpen}
                        status="neutral"
                    />

                    <MetricCard
                        title="GM"
                        value="1,62 m"
                        description="Virs minimālās robežas"
                        icon={Scale}
                        status="good"
                    />

                    <MetricCard
                        title="Trims"
                        value="0,27 m"
                        description="Uz pakaļgalu"
                        icon={Anchor}
                        status="warning"
                    />

                    <MetricCard
                        title="Balasts"
                        value="Līdzsvarots"
                        description="Tanku sadalījums korekts"
                        icon={Waves}
                        status="good"
                    />

                    <MetricCard
                        title="Brīdinājumi"
                        value="3"
                        description="Nepieciešama pārbaude"
                        icon={AlertTriangle}
                        status="warning"
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
                    <ShipSideProfile />

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-950">
                                        Galvenie brīdinājumi
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Sistēmas atrastie riski
                                    </p>
                                </div>

                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            </div>

                            <div className="space-y-3">
                                {warnings.map((warning, index) => (
                                    <div
                                        key={warning.title}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-semibold text-amber-700">
                                                {index + 1}
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-950">
                                                    {warning.title}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {warning.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-slate-700" />
                                <h2 className="text-base font-semibold text-slate-950">
                                    Ātrās darbības
                                </h2>
                            </div>

                            <div className="space-y-2">
                                <a
                                    href="/cargo-plan"
                                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Atvērt kravas plānu
                                </a>

                                <a
                                    href="/stability"
                                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Pārbaudīt stabilitāti
                                </a>

                                <a
                                    href="/ballast"
                                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Veikt balasta korekciju
                                </a>

                                <a
                                    href="/reports"
                                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Ģenerēt pārskatu
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}