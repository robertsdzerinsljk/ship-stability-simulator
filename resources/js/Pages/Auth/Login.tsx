import { FormEventHandler, useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Anchor,
    Boxes,
    CheckCircle2,
    Eye,
    EyeOff,
    Gauge,
    Lock,
    Mail,
    Ship,
    ShieldCheck,
    Waves,
} from 'lucide-react';

type LoginProps = {
    status?: string;
    canResetPassword: boolean;
};

const fullLogoSrc = '/images/ljk-logo.png';
const iconLogoSrc = '/images/ljk-logo-icon.svg';

const slides = [
    {
        title: 'Kuģa stabilitātes simulators mācību procesam',
        text: 'Plāno kravu, koriģē balastu un pārbaudi stabilitātes rādītājus vienotā digitālā vidē.',
        icon: Ship,
    },
    {
        title: 'Reālistiski kravas un balasta scenāriji',
        text: 'Students redz, kā kravas izvietojums un tanku aizpildījums ietekmē GM, trimu un drošības statusu.',
        icon: Boxes,
    },
    {
        title: 'Pasniedzējam pārskatāmi rezultāti un kļūdu analīze',
        text: 'Scenāriji, iesniegumi, brīdinājumi, atskaites un mācību režīma komentāri vienā sistēmā.',
        icon: Gauge,
    },
];

export default function Login({ status, canResetPassword }: LoginProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    useEffect(() => {
        const interval = window.setInterval(() => {
            setActiveSlide((previous) => (previous + 1) % slides.length);
        }, 7500);

        return () => window.clearInterval(interval);
    }, []);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post('/login', {
            onSuccess: () => {
                window.location.assign(route('dashboard'));
            },
            onFinish: () => reset('password'),
        });
    };

    const ActiveIcon = slides[activeSlide].icon;

    return (
        <>
            <Head title="Pieslēgšanās" />

            <div className="min-h-screen bg-slate-950 text-slate-950">
                <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
                    <section className="relative hidden overflow-hidden lg:block">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.22),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#064e3b_100%)]" />

                        <div className="absolute inset-0 opacity-[0.08]">
                            <div className="absolute left-[-10%] top-[18%] h-72 w-72 rounded-full border border-white" />
                            <div className="absolute bottom-[10%] right-[8%] h-96 w-96 rounded-full border border-white" />
                            <div className="absolute bottom-0 left-0 h-56 w-full bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.45)_25%,rgba(255,255,255,0.45)_26%,transparent_26%,transparent_50%,rgba(255,255,255,0.45)_50%,rgba(255,255,255,0.45)_51%,transparent_51%)] bg-[length:42px_42px]" />
                        </div>

                        <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 text-white xl:p-14">
                            <div className="flex items-center justify-between">

                            </div>

                            <div className="mx-auto w-full max-w-3xl">
                                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-md">
                                    Liepājas Jūrniecības koledža
                                </div>

                                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                                    <div className="mb-8 flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg">
                                            <ActiveIcon className="h-8 w-8" />
                                        </div>

                                        <div>
                                            <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">
                                                Simulator
                                            </p>
                                            <p className="mt-1 text-sm text-white/70">
                                                Krava • Balasts • Stabilitāte • Atskaites
                                            </p>
                                        </div>
                                    </div>

                                    <h1 className="min-h-[132px] text-4xl font-bold leading-tight xl:text-5xl">
                                        {slides[activeSlide].title}
                                    </h1>

                                    <p className="mt-5 min-h-[70px] max-w-2xl text-base leading-7 text-white/78">
                                        {slides[activeSlide].text}
                                    </p>

                                    <div className="mt-8 flex gap-3">
                                        {slides.map((slide, index) => (
                                            <button
                                                key={slide.title}
                                                type="button"
                                                onClick={() => setActiveSlide(index)}
                                                className={[
                                                    'h-3 rounded-full transition-all',
                                                    index === activeSlide
                                                        ? 'w-11 bg-white'
                                                        : 'w-3 bg-white/35 hover:bg-white/60',
                                                ].join(' ')}
                                                aria-label={`Slaids ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-3 gap-4">
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                        <Waves className="mb-3 h-5 w-5 text-sky-200" />
                                        <p className="text-sm font-semibold">Balasts</p>
                                        <p className="mt-1 text-xs text-white/60">Tanku korekcija</p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                        <Anchor className="mb-3 h-5 w-5 text-emerald-200" />
                                        <p className="text-sm font-semibold">GM / Trims</p>
                                        <p className="mt-1 text-xs text-white/60">Drošības aprēķini</p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                        <CheckCircle2 className="mb-3 h-5 w-5 text-lime-200" />
                                        <p className="text-sm font-semibold">Atskaites</p>
                                        <p className="mt-1 text-xs text-white/60">PDF rezultāti</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-white/45">
                                © {new Date().getFullYear()} Liepājas Jūrniecības koledža
                            </p>
                        </div>
                    </section>

                    <section className="relative flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10 sm:px-8 lg:bg-white">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_35%)] lg:hidden" />

                        <div className="relative w-full max-w-md">
                            <div className="mb-8 text-center lg:hidden">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white p-3 shadow-xl ring-1 ring-slate-200">
                                    <img
                                        src={iconLogoSrc}
                                        alt="Liepājas Jūrniecības koledža"
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <h1 className="text-2xl font-bold text-slate-950">
                                    Ship Stability Simulator
                                </h1>

                                <p className="mt-2 text-sm text-slate-500">
                                    Pieslēdzies simulatora darba videi
                                </p>
                            </div>

                            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-300/40 sm:p-9">
                                <div className="mb-8">
                                    <div className="mb-5 hidden items-center gap-4 lg:flex">
                                        <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-white  ">
                                            <img
                                                src={fullLogoSrc}
                                                alt="Liepājas Jūrniecības koledža"
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        <div>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold tracking-tight text-slate-950 text-center">
                                        Pieslēgšanās kontam
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Ievadiet e-pastu un paroli, lai turpinātu darbu ar
                                        kuģa stabilitātes simulatoru.
                                    </p>
                                </div>

                                {status && (
                                    <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                        {status}
                                    </div>
                                )}

                                <a
                                    href={route('auth.google.redirect')}
                                    className="mb-5 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
                                        />
                                    </svg>
                                    Turpināt ar Google
                                </a>

                                <div className="mb-5 flex items-center gap-3 text-xs font-medium text-slate-400">
                                    <div className="h-px flex-1 bg-slate-100" />
                                    <span>vai</span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            E-pasts
                                        </label>

                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData('email', event.target.value)
                                                }
                                                required
                                                autoFocus
                                                autoComplete="email"
                                                placeholder="epasts@example.com"
                                                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                                            />
                                        </div>

                                        {errors.email && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label
                                                htmlFor="password"
                                                className="block text-sm font-medium text-slate-700"
                                            >
                                                Parole
                                            </label>

                                            {canResetPassword && (
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm font-medium text-slate-500 transition hover:text-emerald-700 hover:underline"
                                                >
                                                    Aizmirsi paroli?
                                                </Link>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={data.password}
                                                onChange={(event) =>
                                                    setData('password', event.target.value)
                                                }
                                                required
                                                autoComplete="current-password"
                                                placeholder="Ievadi paroli"
                                                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((value) => !value)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                                aria-label={showPassword ? 'Paslēpt paroli' : 'Rādīt paroli'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>

                                        {errors.password && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(event) =>
                                                setData('remember', event.target.checked)
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                                        />

                                        Atcerēties mani
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-800 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {processing ? 'Pieslēdzas...' : 'Pieslēgties'}
                                    </button>
                                </form>

                                <div className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
                                    Nav konta?{' '}
                                    <Link
                                        href={route('register')}
                                        className="font-semibold text-emerald-800 hover:underline"
                                    >
                                        Reģistrēties ar LJK e-pastu
                                    </Link>
                                </div>
                            </div>

                            <p className="mt-6 text-center text-xs text-slate-400">
                                Stabilitātes, kravas izvietojuma un balasta mācību simulators
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
