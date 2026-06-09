import { usePage } from '@inertiajs/react';
import { Bell, Menu, ShieldCheck, UserCircle } from 'lucide-react';

type AppTopbarProps = {
    title: string;
    subtitle?: string;
    onOpenSidebar: () => void;
};

type PageProps = {
    auth?: {
        user?: {
            name?: string;
            email?: string;
        };
    };
};

export default function AppTopbar({ title, subtitle, onOpenSidebar }: AppTopbarProps) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold text-slate-950">
                                {title}
                            </h1>

                            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
                                Mācību režīms
                            </span>
                        </div>

                        {subtitle && (
                            <p className="mt-0.5 text-sm text-slate-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 md:flex">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>Demo kuģis aktīvs</span>
                    </div>

                    <button
                        type="button"
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                    >
                        <Bell className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <UserCircle className="h-5 w-5 text-slate-500" />

                        <div className="hidden text-right sm:block">
                            <p className="text-xs font-medium text-slate-900">
                                {user?.name ?? 'Lietotājs'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                {user?.email ?? 'student@example.com'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}