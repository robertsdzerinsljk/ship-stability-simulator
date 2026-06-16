import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const iconLogoSrc = '/images/ljk-logo-icon.svg';

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registrācija" />

            <div className="fixed inset-0 z-[999] overflow-y-auto overflow-x-hidden bg-transparent">
                <div className="relative isolate flex min-h-[100svh] w-full items-start justify-center px-4 pt-3 pb-3 sm:px-6 sm:pt-4 lg:pt-5">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none fixed inset-0 -z-10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-white" />

                        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
                        <div className="absolute -right-40 top-20 h-[28rem] w-[28rem] rounded-full bg-teal-300/25 blur-3xl" />
                        <div className="absolute bottom-[-12rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-900/10 blur-3xl" />

                        <div
                            className="absolute inset-0 opacity-[0.35]"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(15, 118, 110, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 118, 110, 0.08) 1px, transparent 1px)',
                                backgroundSize: '42px 42px',
                            }}
                        />

                        <div className="absolute left-[8%] top-[18%] hidden h-20 w-20 rounded-[1.7rem] border border-white/70 bg-white/35 shadow-2xl backdrop-blur-xl sm:block" />
                        <div className="absolute right-[10%] top-[56%] hidden h-16 w-16 rotate-12 rounded-2xl border border-white/70 bg-white/30 shadow-2xl backdrop-blur-xl sm:block" />
                        <div className="absolute bottom-[16%] left-[18%] hidden h-10 w-10 rounded-full border border-white/70 bg-white/35 shadow-xl backdrop-blur-xl sm:block" />
                    </div>

                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-2.5 text-center mt-12">
                            <div className="mx-auto mb-2 flex items-center justify-center rounded-xl">
                                <img src={iconLogoSrc} alt="Logo" className="h-12 w-12" />
                            </div>

                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-800">
                                Ship Stability
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                                Izveidot kontu
                            </h1>

                            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-600 sm:text-sm">
                                Reģistrācija pieejama tikai LJK lietotājiem ar
                                iestādes e-pasta adresi.
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/85 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-5">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent"
                            />

                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl"
                            />

                            <div className="relative mb-3 rounded-2xl border border-emerald-900/10 bg-emerald-900/[0.04] p-3">
                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-sm font-bold text-white shadow-lg shadow-emerald-900/20">
                                        @
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-950">
                                            Atļautie e-pasti
                                        </p>
                                        <p className="mt-0.5 text-sm leading-5 text-slate-600">
                                            Pasniedzējiem{' '}
                                            <span className="font-semibold text-emerald-900">
                                                @ljk.lv
                                            </span>
                                            , studentiem{' '}
                                            <span className="font-semibold text-emerald-900">
                                                @ljkstudents.lv
                                            </span>
                                            .
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submit} className="relative space-y-2.5">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-slate-700">
                                            Vārds
                                        </span>
                                        <input
                                            value={data.first_name}
                                            onChange={(event) =>
                                                setData(
                                                    'first_name',
                                                    event.target.value,
                                                )
                                            }
                                            autoComplete="given-name"
                                            autoFocus
                                            required
                                            placeholder="Vārds"
                                            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/10"
                                        />
                                        {errors.first_name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.first_name}
                                            </p>
                                        )}
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-semibold text-slate-700">
                                            Uzvārds
                                        </span>
                                        <input
                                            value={data.last_name}
                                            onChange={(event) =>
                                                setData(
                                                    'last_name',
                                                    event.target.value,
                                                )
                                            }
                                            autoComplete="family-name"
                                            required
                                            placeholder="Uzvārds"
                                            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/10"
                                        />
                                        {errors.last_name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.last_name}
                                            </p>
                                        )}
                                    </label>
                                </div>

                                <label className="block">
                                    <span className="text-sm font-semibold text-slate-700">
                                        E-pasts
                                    </span>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(event) =>
                                            setData('email', event.target.value)
                                        }
                                        autoComplete="email"
                                        placeholder="e-pasts@ljkstudents.lv"
                                        required
                                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/10"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </label>

                                <label className="block">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Parole
                                    </span>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                        required
                                        placeholder="Ievadi paroli"
                                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/10"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </label>

                                <label className="block">
                                    <span className="text-sm font-semibold text-slate-700">
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
                                        placeholder="Atkārto paroli"
                                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/10"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-2 flex h-10 w-full items-center justify-center rounded-xl bg-emerald-900 text-sm font-semibold text-white shadow-lg shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:bg-emerald-950 hover:shadow-xl hover:shadow-emerald-900/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {processing ? 'Reģistrē...' : 'Reģistrēties'}
                                </button>
                            </form>

                            <div className="relative mt-3 rounded-2xl px-4 py-2 text-center text-sm text-slate-500">
                                Konts jau ir?{' '}
                                <Link
                                    href={route('login')}
                                    className="font-semibold text-emerald-900 underline-offset-4 transition hover:text-emerald-950 hover:underline"
                                >
                                    Pieslēgties
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}