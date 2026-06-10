import { Link, usePage } from '@inertiajs/react';
import { Bell, Menu, Search, User } from 'lucide-react';
import { type PageProps } from '@/types';

type SharedPageProps = PageProps<{
    auth?: {
        user?: {
            id?: number;
            name?: string;
            email?: string;
            roles?: string[];
        } | null;
    };
}>;

type AppTopbarProps = {
    title: string;
    subtitle?: string;
    onOpenSidebar?: () => void;
};

function roleLabel(role?: string) {
    if (role === 'admin') {
        return 'Administrators';
    }

    if (role === 'teacher') {
        return 'Pasniedzējs';
    }

    if (role === 'student') {
        return 'Students';
    }

    return 'Lietotājs';
}

export default function AppTopbar({
    title,
    subtitle,
    onOpenSidebar,
}: AppTopbarProps) {
    const { props } = usePage<SharedPageProps>();

    const user = props.auth?.user;
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const mainRole = roles[0];

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-4">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
                        aria-label="Atvērt izvēlni"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-semibold text-slate-950">
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
                    <div className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 xl:flex">
                        <Search className="h-4 w-4" />
                        <span>Meklēt modulī...</span>
                    </div>

                    <button
                        type="button"
                        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label="Paziņojumi"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
                    </button>

                    <Link
                        href="/profile"
                        className="hidden items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-slate-50 sm:flex"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <User className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 text-left">
                            <p className="max-w-36 truncate text-sm font-semibold text-slate-950">
                                {user?.name ?? 'Nav e-pasta'}
                            </p>
                            <p className="max-w-36 truncate text-xs text-slate-500">
                                {roleLabel(mainRole)}
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}