import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ClipboardCheck,
    ClipboardList,
    FileText,
    GraduationCap,
    Menu,
    Search,
    Settings,
    Ship,
    User,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { type PageProps } from '@/types';
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

type Role = 'student' | 'teacher' | 'admin';

type AppNotification = {
    id: string;
    title: string;
    message: string;
    href: string;
    type: string;
    read_at?: string | null;
    created_at?: string | null;
};

type SharedPageProps = PageProps<{
    auth?: {
        user?: {
            id?: number;
            name?: string;
            email?: string;
            roles?: string[];
        } | null;
    };
    notifications?: {
        unread_count?: number;
        items?: AppNotification[];
    };
}>;

type AppTopbarProps = {
    title: string;
    subtitle?: string;
    onOpenSidebar?: () => void;
};

type SearchItem = {
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
    roles: Role[];
    keywords: string[];
};

const searchItems: SearchItem[] = [
    {
        label: 'Pārskats',
        description: 'Galvenais dashboard skats',
        href: '/dashboard',
        icon: Ship,
        roles: ['student', 'teacher', 'admin'],
        keywords: ['dashboard', 'pārskats', 'sakums', 'home'],
    },
    {
        label: 'Mani uzdevumi',
        description: 'Studentam piešķirtie scenāriji',
        href: '/student/tasks',
        icon: ClipboardCheck,
        roles: ['student', 'admin'],
        keywords: ['student', 'uzdevumi', 'tasks', 'assignment'],
    },
    {
        label: 'Studenti un grupas',
        description: 'Studentu un klašu/grupu pārskats',
        href: '/teacher/students',
        icon: Users,
        roles: ['teacher', 'admin'],
        keywords: ['studenti', 'grupas', 'klases', 'groups'],
    },
    {
        label: 'Uzdevumu piešķiršana',
        description: 'Piešķirt scenāriju studentam vai grupai',
        href: '/teacher/assignments',
        icon: ClipboardCheck,
        roles: ['teacher', 'admin'],
        keywords: ['piešķiršana', 'assignments', 'teacher', 'uzdevumi'],
    },
    {
        label: 'Scenāriji',
        description: 'Scenāriju izveide un publicēšana',
        href: '/scenarios',
        icon: ClipboardList,
        roles: ['teacher', 'admin'],
        keywords: ['scenarios', 'scenāriji', 'uzdevumi'],
    },
    {
        label: 'Iesniegumi',
        description: 'Studentu iesniegto darbu vērtēšana',
        href: '/teacher/submissions',
        icon: GraduationCap,
        roles: ['teacher', 'admin'],
        keywords: ['iesniegumi', 'submissions', 'vērtēšana'],
    },
    {
        label: 'Kuģi',
        description: 'Kuģu datubāze un aktīvā kuģa izvēle',
        href: '/vessels',
        icon: Ship,
        roles: ['teacher', 'admin'],
        keywords: ['kuģi', 'vessels', 'ships'],
    },
    {
        label: 'Kravas plāns',
        description: 'Kravas sadalījums pa tilpnēm',
        href: '/cargo-plan',
        icon: ClipboardList,
        roles: ['student', 'teacher', 'admin'],
        keywords: ['cargo', 'krava', 'kravas plans'],
    },
    {
        label: 'Balasts',
        description: 'Balasta tanku korekcijas',
        href: '/ballast',
        icon: Ship,
        roles: ['student', 'teacher', 'admin'],
        keywords: ['ballast', 'balasts', 'tanki'],
    },
    {
        label: 'Stabilitāte',
        description: 'GM, trims, sasvērums un kritēriji',
        href: '/stability',
        icon: Ship,
        roles: ['student', 'teacher', 'admin'],
        keywords: ['stability', 'stabilitāte', 'gm', 'trim', 'heel'],
    },
    {
        label: 'Atskaites',
        description: 'PDF stabilitātes pārskats',
        href: '/reports',
        icon: FileText,
        roles: ['student', 'teacher', 'admin'],
        keywords: ['reports', 'atskaites', 'pdf'],
    },
    {
        label: 'Iestatījumi',
        description: 'Sistēmas iestatījumi',
        href: '/settings',
        icon: Settings,
        roles: ['admin'],
        keywords: ['settings', 'iestatījumi', 'admin'],
    },
];

function roleLabel(role?: string) {
    if (role === 'admin') return 'Administrators';
    if (role === 'teacher') return 'Pasniedzējs';
    if (role === 'student') return 'Students';

    return 'Lietotājs';
}

function canSee(roles: Role[], userRoles: string[]) {
    if (userRoles.includes('admin')) return true;

    return roles.some((role) => userRoles.includes(role));
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

    const notifications = props.notifications?.items ?? [];
    const unreadCount = Number(props.notifications?.unread_count ?? 0);

    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const searchRef = useRef<HTMLDivElement | null>(null);
    const notificationsRef = useRef<HTMLDivElement | null>(null);

    const visibleSearchItems = useMemo(() => {
        return searchItems.filter((item) => canSee(item.roles, roles));
    }, [roles]);

    const filteredSearchItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return visibleSearchItems.slice(0, 6);
        }

        return visibleSearchItems
            .filter((item) => {
                const searchableText = [
                    item.label,
                    item.description,
                    ...item.keywords,
                ]
                    .join(' ')
                    .toLowerCase();

                return searchableText.includes(normalizedQuery);
            })
            .slice(0, 8);
    }, [query, visibleSearchItems]);

    useEffect(() => {
        const closeDropdowns = (event: MouseEvent) => {
            const target = event.target as Node;

            if (searchRef.current && !searchRef.current.contains(target)) {
                setSearchOpen(false);
            }

            if (notificationsRef.current && !notificationsRef.current.contains(target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', closeDropdowns);

        return () => document.removeEventListener('mousedown', closeDropdowns);
    }, []);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        const firstItem = filteredSearchItems[0];

        if (!firstItem) return;

        setSearchOpen(false);
        setQuery('');
        router.visit(firstItem.href);
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setSearchOpen(false);
        }
    };

    const openNotification = (notification: AppNotification) => {
        setNotificationsOpen(false);

        router.post(
            `/notifications/${notification.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.visit(notification.href),
            },
        );
    };

    const markAllAsRead = () => {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    };

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
                    <div ref={searchRef} className="relative hidden xl:block">
                        <form
                            onSubmit={submitSearch}
                            className="flex h-10 w-72 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 transition focus-within:border-[#155f4c] focus-within:ring-4 focus-within:ring-[#155f4c]/10"
                        >
                            <Search className="h-4 w-4 shrink-0" />
                            <input
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setSearchOpen(true);
                                }}
                                onFocus={() => setSearchOpen(true)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Meklēt modulī..."
                                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </form>

                        {searchOpen && (
                            <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                <div className="border-b border-slate-100 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Ātrā meklēšana
                                    </p>
                                </div>

                                <div className="max-h-96 overflow-y-auto p-2">
                                    {filteredSearchItems.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.href}
                                                type="button"
                                                onClick={() => {
                                                    setSearchOpen(false);
                                                    setQuery('');
                                                    router.visit(item.href);
                                                }}
                                                className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                                            >
                                                <div className="rounded-lg bg-[#155f4c]/10 p-2 text-[#155f4c]">
                                                    <Icon className="h-4 w-4" />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-slate-950">
                                                        {item.label}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {filteredSearchItems.length === 0 && (
                                        <div className="px-4 py-6 text-center text-sm text-slate-500">
                                            Nekas netika atrasts.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={notificationsRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setNotificationsOpen((current) => !current)}
                            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                            aria-label="Paziņojumi"
                        >
                            <Bell className="h-5 w-5" />

                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#155f4c] px-1 text-[11px] font-bold text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-950">
                                            Paziņojumi
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Jauni iesniegumi, vērtējumi un termiņi.
                                        </p>
                                    </div>

                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllAsRead}
                                            className="text-xs font-semibold text-[#155f4c] hover:underline"
                                        >
                                            Atzīmēt visus
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-96 overflow-y-auto p-2">
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() => openNotification(notification)}
                                            className={[
                                                'block w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50',
                                                notification.read_at ? 'opacity-70' : 'bg-[#155f4c]/5',
                                            ].join(' ')}
                                        >
                                            <p className="text-sm font-semibold text-slate-950">
                                                {notification.title}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {notification.message}
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                {notification.created_at}
                                            </p>
                                        </button>
                                    ))}

                                    {notifications.length === 0 && (
                                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                                            Nav paziņojumu.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/profile"
                        className="hidden items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-slate-50 sm:flex"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#155f4c] text-white">
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