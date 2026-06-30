import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type UserSummary = {
    name?: string | null;
    email?: string | null;
};

type Props = {
    academicYears?: string[];
    groupCodes?: string[];
    user?: UserSummary | null;
};

export default function StudentGroupOnboarding({
    academicYears,
    groupCodes,
    user,
}: Props) {
    const years = Array.isArray(academicYears) ? academicYears : [];
    const codes = Array.isArray(groupCodes) ? groupCodes : [];

    const { data, setData, post, processing, errors } = useForm({
        academic_year: '',
        group_code: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post('/onboarding/student-group');
    };

    const logout = () => {
        router.post('/logout');
    };

    return (
        <GuestLayout logoHref="/login">
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

                {user && (
                    <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Pierakstījies kā
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                                {user.name || user.email}
                            </p>
                            {user.email && (
                                <p className="truncate text-xs text-slate-500">
                                    {user.email}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={logout}
                            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Izrakstīties
                        </button>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Mācību gads
                        </span>
                        <select
                            value={data.academic_year}
                            onChange={(event) =>
                                setData('academic_year', event.target.value)
                            }
                            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                            required
                        >
                            <option value="" disabled>
                                Izvēlies mācību gadu
                            </option>
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

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Grupa
                        </span>
                        <select
                            value={data.group_code}
                            onChange={(event) =>
                                setData('group_code', event.target.value)
                            }
                            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                            required
                        >
                            <option value="" disabled>
                                Izvēlies grupu
                            </option>
                            {codes.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                        {errors.group_code && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.group_code}
                            </p>
                        )}
                    </label>

                    <button
                        type="submit"
                        disabled={
                            processing ||
                            !data.academic_year ||
                            !data.group_code
                        }
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-800 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {processing ? 'Saglabā...' : 'Turpināt'}
                    </button>
                </form>
            </div>
        </GuestLayout>
    );
}
