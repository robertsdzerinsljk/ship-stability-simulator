import AppSidebar from '@/Components/layout/AppSidebar';
import AppTopbar from '@/Components/layout/AppTopbar';
import { PropsWithChildren, ReactNode, useState } from 'react';

type AuthenticatedLayoutProps = PropsWithChildren<{
    title?: string;
    subtitle?: string;
    header?: ReactNode;
}>;

export default function AuthenticatedLayout({
    title,
    subtitle,
    header,
    children,
}: AuthenticatedLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const resolvedTitle = title ?? (header ? 'Profils' : 'Pārskats');

    return (
        <div className="min-h-screen bg-slate-50">
            <AppSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-72">
                <AppTopbar
                    title={resolvedTitle}
                    subtitle={subtitle}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    {header && (
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            {header}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}