type Hold = {
    id: number;
    name: string;
    code: string;
    weight_tonnes: number;
    capacity_tonnes: number;
    load_percent: number;
    status: string;
};

type Drafts = {
    fore: number;
    aft: number;
    mean: number;
};

type Vessel = {
    name: string;
    type?: string;
    imo_number?: string;
};

type ShipSideProfileProps = {
    vessel: Vessel;
    holds: Hold[];
    drafts: Drafts;
    totalDisplacement: number;
};

function loadColor(loadPercent: number) {
    if (loadPercent >= 100) {
        return 'bg-red-600';
    }

    if (loadPercent >= 90) {
        return 'bg-red-500';
    }

    if (loadPercent >= 75) {
        return 'bg-amber-500';
    }

    if (loadPercent >= 55) {
        return 'bg-emerald-500';
    }

    return 'bg-sky-500';
}

export default function ShipSideProfile({
    vessel,
    holds,
    drafts,
    totalDisplacement,
}: ShipSideProfileProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-950">
                        {vessel.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {vessel.type ?? 'Kuģis'} · IMO {vessel.imo_number ?? 'nav norādīts'}
                    </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Aktīvs scenārijs
                </span>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                    <div className="relative mx-auto flex h-36 items-end justify-center">
                        <div className="absolute bottom-0 left-8 h-20 w-28 rounded-l-full bg-slate-800" />
                        <div className="absolute bottom-0 right-8 h-20 w-32 rounded-r-full bg-slate-800" />

                        <div className="relative z-10 flex h-24 items-end gap-1 rounded-b-[44px] border-b-[14px] border-slate-900 px-8 pb-3">
                            {holds.map((hold) => (
                                <div
                                    key={hold.id}
                                    className="flex w-20 flex-col items-center justify-end rounded-t-lg border border-slate-300 bg-slate-100 p-1"
                                    title={`${hold.name}: ${hold.weight_tonnes} t / ${hold.capacity_tonnes} t`}
                                >
                                    <div
                                        className={`w-full rounded-md ${loadColor(hold.load_percent)}`}
                                        style={{
                                            height: `${Math.max(18, Math.min(hold.load_percent, 100) * 0.72)}px`,
                                        }}
                                    />

                                    <span className="mt-1 text-xs font-semibold text-slate-700">
                                        {hold.code}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Priekšgala iegrime</p>
                            <p className="text-sm font-semibold text-slate-950">{drafts.fore} m</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Pakaļgala iegrime</p>
                            <p className="text-sm font-semibold text-slate-950">{drafts.aft} m</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Displacement</p>
                            <p className="text-sm font-semibold text-slate-950">
                                {totalDisplacement.toLocaleString('lv-LV')} t
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Tilpņu skaits</p>
                            <p className="text-sm font-semibold text-slate-950">{holds.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}