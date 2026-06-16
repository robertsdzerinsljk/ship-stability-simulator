import { Link, router, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import {
    Activity,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    PackageOpen,
    Settings,
    Ship,
    Users,
    Waves,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

const fullLogoSrc = '/images/ljk-logo.png';
const iconLogoSrc = '/images/ljk-logo-icon.svg';

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
        label: 'Studenti un grupas',
        href: '/teacher/students',
        icon: Users,
        roles: ['teacher', 'admin'],
    },
    {
        label: 'Uzdevumu piešķiršana',
        href: '/teacher/assignments',
        icon: ClipboardCheck,
        roles: ['teacher', 'admin'],
    },
    {
        label: 'Iesniegumi',
        href: '/teacher/submissions',
        icon: GraduationCap,
        roles: ['teacher', 'admin'],
    },
    {
        label: 'Scenāriji',
        href: '/scenarios',
        icon: ClipboardList,
        roles: ['teacher', 'admin'],
    },
    {
        label: 'Kuģi',
        href: '/vessels',
        icon: Ship,
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

function getInitialCollapsedState() {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.localStorage.getItem('app-sidebar-collapsed') === 'true';
}

export default function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
    const { url, props } = usePage<PageProps>();
    const currentPath = url.split('?')[0];

    const userRoles = props.auth?.user?.roles ?? [];
    const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState);

    useEffect(() => {
        const width = isCollapsed ? '5rem' : '18rem';

        document.documentElement.style.setProperty('--app-sidebar-width', width);
        window.localStorage.setItem('app-sidebar-collapsed', String(isCollapsed));
    }, [isCollapsed]);

    const canSee = (item: NavItem) => {
        if (userRoles.includes('admin')) {
            return true;
        }

        return item.roles.some((role) => userRoles.includes(role));
    };

    const visibleNavigation = useMemo(
        () => navigation.filter(canSee),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [userRoles.join('|')],
    );

    const logout = () => {
        router.post(route('logout'), {}, {
            onSuccess: () => {
                window.location.assign(route('login'));
            },
        });
    };

    const renderLogo = (collapsed: boolean) => (
        <Link
            href="/dashboard"
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            title="Ship Stability Simulator"
            onClick={onClose}
        >
            <img
                src={fullLogoSrc}
                alt="RTU Liepājas Jūrniecības koledža"
                className={[
                    'absolute h-16 w-auto max-w-[13.5rem] object-contain transition-all duration-300 ease-out',
                    collapsed
                        ? '-translate-x-4 scale-95 opacity-0 blur-sm'
                        : 'translate-x-0 scale-100 opacity-100 blur-0',
                ].join(' ')}
            />

            <img
                src={iconLogoSrc}
                alt="Liepājas Jūrniecības koledža"
                className={[
                    'absolute h-12 w-12 object-contain transition-all duration-300 ease-out',
                    collapsed
                        ? 'translate-x-0 scale-100 opacity-100 blur-0'
                        : 'translate-x-4 scale-75 opacity-0 blur-sm',
                ].join(' ')}
            />
        </Link>
    );

    const sidebarContent = (mobile = false) => {
        const collapsed = !mobile && isCollapsed;

        return (
            <>
                <div className="relative flex h-24 items-center justify-center border-b border-slate-200 px-4">
                    {renderLogo(collapsed)}

                    {mobile && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                            aria-label="Aizvērt izvēlni"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {visibleNavigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(currentPath, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                title={collapsed ? item.label : undefined}
                                className={[
                                    'group flex items-center rounded-xl py-2.5 text-sm font-medium transition',
                                    collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                                    active
                                        ? 'bg-[#155f4c] text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-[#155f4c]/10 hover:text-[#155f4c]',
                                ].join(' ')}
                            >
                                <Icon className="h-5 w-5 shrink-0" />

                                <span
                                    className={[
                                        'whitespace-nowrap transition-all duration-200',
                                        collapsed
                                            ? 'w-0 overflow-hidden opacity-0'
                                            : 'w-auto opacity-100',
                                    ].join(' ')}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-200 p-3">
                    <button
                        type="button"
                        onClick={logout}
                        title={collapsed ? 'Izrakstīties' : undefined}
                        className={[
                            'flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700',
                            collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                        ].join(' ')}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span
                            className={[
                                'whitespace-nowrap transition-all duration-200',
                                collapsed
                                    ? 'w-0 overflow-hidden opacity-0'
                                    : 'w-auto opacity-100',
                            ].join(' ')}
                        >
                            Izrakstīties
                        </span>
                    </button>
                </div>
            </>
        );
    };

    return (
        <>
            <aside
                className={[
                    'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-out lg:flex',
                    isCollapsed ? 'w-20' : 'w-72',
                ].join(' ')}
            >
                <button
                    type="button"
                    onClick={() => setIsCollapsed((value) => !value)}
                    className="absolute -right-3 top-28 z-40 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#155f4c]/30 hover:text-[#155f4c] lg:inline-flex"
                    aria-label={isCollapsed ? 'Izvērst sānu izvēlni' : 'Sakļaut sānu izvēlni'}
                    title={isCollapsed ? 'Izvērst izvēlni' : 'Sakļaut izvēlni'}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>

                {sidebarContent(false)}
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
                        {sidebarContent(true)}
                    </aside>
                </div>
            )}
        </>
    );
}
