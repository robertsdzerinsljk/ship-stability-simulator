import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

type StudentGroup = {
    id: number;
    name: string;
    code?: string | null;
    academic_year?: string | null;
};

type Props = {
    academicYears?: string[];
    groups?: StudentGroup[];
};

export default function StudentGroupOnboarding({
    academicYears,
    groups,
}: Props) {
    const years = Array.isArray(academicYears) ? academicYears : [];
    const groupRows = Array.isArray(groups) ? groups : [];
    const [groupMode, setGroupMode] = useState<'existing' | 'new'>(
        groupRows.length > 0 ? 'existing' : 'new',
    );

    const { data, setData, post, processing, errors } = useForm({
        academic_year: years[0] ?? '',
        group_mode: groupMode,
        student_group_id: '',
        group_code: '',
    });

    const filteredGroups = useMemo(
        () =>
            groupRows.filter(
                (group) => group.academic_year === data.academic_year,
            ),
        [data.academic_year, groupRows],
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(route('onboarding.student-group.update'));
    };

    const setMode = (mode: 'existing' | 'new') => {
        setGroupMode(mode);
        setData('group_mode', mode);
    };

    return (
        <GuestLayout>
            <Head title="Grupas izvēle" />

            <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Pirmais solis
                    </p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-950">
                        Izvēlies mācību gadu un grupu
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        Šī informācija nepieciešama, lai pasniedzēji varētu
                        piešķirt uzdevumus pareizajai grupai.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Mācību gads
                        </span>
                        <select
                            value={data.academic_year}
                            onChange={(event) => {
                                setData({
                                    ...data,
                                    academic_year: event.target.value,
                                    student_group_id: '',
                                });
                            }}
                            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                            required
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        {errors.academic_year && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.academic_year}
                            </p>
                        )}
                    </label>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => setMode('existing')}
                            className={[
                                'h-10 rounded-lg text-sm font-semibold transition',
                                groupMode === 'existing'
                                    ? 'bg-white text-slate-950 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800',
                            ].join(' ')}
                        >
                            Esoša grupa
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('new')}
                            className={[
                                'h-10 rounded-lg text-sm font-semibold transition',
                                groupMode === 'new'
                                    ? 'bg-white text-slate-950 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800',
                            ].join(' ')}
                        >
                            Jauna grupa
                        </button>
                    </div>

                    {groupMode === 'existing' ? (
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Grupa
                            </span>
                            <select
                                value={data.student_group_id}
                                onChange={(event) =>
                                    setData(
                                        'student_group_id',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                                required
                            >
                                <option value="">Izvēlies grupu</option>
                                {filteredGroups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name} · {group.academic_year}
                                    </option>
                                ))}
                            </select>
                            {filteredGroups.length === 0 && (
                                <p className="mt-2 text-sm text-slate-500">
                                    Šim mācību gadam vēl nav grupu. Izveido
                                    jaunu zem blakus izvēles.
                                </p>
                            )}
                            {errors.student_group_id && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.student_group_id}
                                </p>
                            )}
                        </label>
                    ) : (
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Grupas kods
                            </span>
                            <input
                                value={data.group_code}
                                onChange={(event) =>
                                    setData('group_code', event.target.value)
                                }
                                placeholder="Piemēram, S-21"
                                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm uppercase outline-none transition placeholder:normal-case focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                                required
                            />
                            {errors.group_code && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.group_code}
                                </p>
                            )}
                        </label>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-800 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {processing ? 'Saglabā...' : 'Turpināt'}
                    </button>
                </form>
            </div>
        </GuestLayout>
    );
}
