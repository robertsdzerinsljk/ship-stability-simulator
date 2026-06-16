import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reģistrācija" />

            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Ship Stability
                    </p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-950">
                        Izveidot kontu
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        Reģistrācija atļauta tikai ar LJK e-pastu:
                        pasniedzējiem @ljk.lv, studentiem @ljkstudents.lv.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Vārds, uzvārds
                        </span>
                        <input
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            autoComplete="name"
                            autoFocus
                            required
                            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        />
                        {errors.name && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            E-pasts
                        </span>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            autoComplete="email"
                            placeholder="vards@ljkstudents.lv"
                            required
                            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Parole
                        </span>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            autoComplete="new-password"
                            required
                            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Atkārtot paroli
                        </span>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(event) =>
                                setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            autoComplete="new-password"
                            required
                            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                        />
                        {errors.password_confirmation && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </label>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-800 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {processing ? 'Reģistrē...' : 'Reģistrēties'}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-slate-500">
                    Konts jau ir?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-emerald-800 hover:underline"
                    >
                        Pieslēgties
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
