const holds = [
    { name: '1', load: 64, color: 'bg-orange-400' },
    { name: '2', load: 91, color: 'bg-red-500' },
    { name: '3', load: 71, color: 'bg-amber-400' },
    { name: '4', load: 100, color: 'bg-emerald-500' },
    { name: '5', load: 42, color: 'bg-lime-500' },
    { name: '6', load: 54, color: 'bg-sky-500' },
    { name: '7', load: 31, color: 'bg-blue-500' },
];

export default function ShipSideProfile() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-950">
                        Kuģa stāvoklis
                    </h2>
                    <p className="text-sm text-slate-500">
                        Vienkāršots sānskats ar tilpņu noslodzi
                    </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Drošs
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
                                    key={hold.name}
                                    className="flex w-20 flex-col items-center justify-end rounded-t-lg border border-slate-300 bg-slate-100 p-1"
                                >
                                    <div
                                        className={`w-full rounded-md ${hold.color}`}
                                        style={{ height: `${Math.max(18, hold.load * 0.72)}px` }}
                                    />

                                    <span className="mt-1 text-xs font-semibold text-slate-700">
                                        {hold.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Priekšgala iegrime</p>
                            <p className="text-sm font-semibold text-slate-950">8,42 m</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Pakaļgala iegrime</p>
                            <p className="text-sm font-semibold text-slate-950">8,15 m</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Kopējā krava</p>
                            <p className="text-sm font-semibold text-slate-950">36 542 t</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Tilpņu skaits</p>
                            <p className="text-sm font-semibold text-slate-950">7</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}