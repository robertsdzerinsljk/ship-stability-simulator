import { Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import {
    Bell,
    ChevronDown,
    Menu,
    Search,
    UserCircle,
} from 'lucide-react';

type AppTopbarProps = {
    title?: string;
    subtitle?: string;
    onMenuClick?: () => void;
};

function roleLabel(role: string) {
    if (role === 'admin') {
        return 'Administrators';
    }

    if (role === 'teacher') {
        return 'Pasniedzējs';
    }

    if (role === 'student') {
        return 'Students';
    }

    return role;
}

export default function AppTopbar({
    title = 'Pārskats',
    subtitle = 'Kuģa stabilitātes simulatora darba vide',
    onMenuClick,
}: AppTopbarProps) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;

    const primaryRole = user?.roles?.[0] ?? 'guest';

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-4">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                        aria-label="Atvērt izvēlni"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-semibold text-slate-950 sm:text-xl">
                            {title}
                        </h1>

                        {subtitle && (
                            <p className="mt-0.5 hidden truncate text-sm text-slate-500 sm:block">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 xl:flex">
                        <Search className="h-4 w-4" />
                        <span>Meklēšana vēlāk</span>
                    </div>

                    <button
                        type="button"
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label="Paziņojumi"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
                    </button>

                    <Link
                        href="/profile"
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <UserCircle className="h-5 w-5" />
                        </div>

                        <div className="hidden text-left md:block">
                            <p className="max-w-[180px] truncate text-sm font-semibold text-slate-950">
                                {user?.name ?? 'Lietotājs'}
                            </p>
                            <p className="max-w-[180px] truncate text-xs text-slate-500">
                                {user?.email ?? 'nav e-pasta'} · {roleLabel(primaryRole)}
                            </p>
                        </div>

                        <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
                    </Link>
                </div>
            </div>
        </header>
    );
}