import { Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import {
    Activity,
    BarChart3,
    ClipboardCheck,
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    PackageOpen,
    Settings,
    Ship,
    Waves,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Role = 'student' | 'teacher' | 'admin';

type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    roles: Role[];
};

type AppSidebarProps = {
    isOpen?: boolean;
    onClose?: () => void;
};

const navigation: NavItem[] = [
    {
        label: 'Pārskats',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['student', 'teacher', 'admin'],
    },
    {
        label: 'Mani uzdevumi',
        href: '/student/tasks',
        icon: ClipboardCheck,
        roles: ['student', 'admin'],
    },
    {
        label: 'Kuģi',
        href: '/vessels',
        icon: Ship,
        roles: ['teacher', 'admin'],
    },
    {
        label: 'Scenāriji',
        href: '/scenarios',
        icon: ClipboardList,
        roles: ['teacher', 'admin'],
    },
    {
        label: 'Kravas plāns',
        href: '/cargo-plan',
        icon: PackageOpen,
        roles: ['student', 'teacher', 'admin'],
    },
    {
        label: 'Balasts',
        href: '/ballast',
        icon: Waves,
        roles: ['student', 'teacher', 'admin'],
    },
    {
        label: 'Stabilitāte',
        href: '/stability',
        icon: Activity,
        roles: ['student', 'teacher', 'admin'],
    },
    {
        label: 'Atskaites',
        href: '/reports',
        icon: FileText,
        roles: ['student', 'teacher', 'admin'],
    },
    {
        label: 'Iesniegumi',
        href: '/teacher/submissions',
        icon: GraduationCap,
        roles: ['teacher', 'admin'],
    },
    {
        label: 'Analītika',
        href: '/teacher/analytics',
        icon: BarChart3,
        roles: ['teacher', 'admin'],
    },
    {
        label: 'Iestatījumi',
        href: '/settings',
        icon: Settings,
        roles: ['admin'],
    },
];

function isActive(currentPath: string, href: string) {
    if (href === '/dashboard') {
        return currentPath === '/dashboard';
    }

    return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
    const { url, props } = usePage<PageProps>();
    const currentPath = url.split('?')[0];

    const userRoles = props.auth?.user?.roles ?? [];

    const canSee = (item: NavItem) => {
        if (userRoles.includes('admin')) {
            return true;
        }

        return item.roles.some((role) => userRoles.includes(role));
    };

    const visibleNavigation = navigation.filter(canSee);

    const sidebarContent = (
        <>
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Ship className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-950">
                            Ship Stability
                        </p>
                        <p className="text-xs text-slate-500">
                            Simulator
                        </p>
                    </div>
                </Link>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                    aria-label="Aizvērt izvēlni"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {visibleNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(currentPath, item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={[
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                                active
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                            ].join(' ')}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-200 p-3">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Izrakstīties</span>
                </Link>
            </div>
        </>
    );

    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
                {sidebarContent}
            </aside>

            {isOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/40"
                        onClick={onClose}
                        aria-label="Aizvērt izvēlni"
                    />

                    <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}