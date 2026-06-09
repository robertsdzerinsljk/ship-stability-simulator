import { ReactNode, useState } from 'react';
import AppSidebar from '@/Components/layout/AppSidebar';
import AppTopbar from '@/Components/layout/AppTopbar';

type AuthenticatedLayoutProps = {
    children: ReactNode;
    title?: string;
    subtitle?: string;
};

export default function AuthenticatedLayout({
    children,
    title = 'Pārskats',
    subtitle,
}: AuthenticatedLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <AppSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-72">
                <AppTopbar
                    title={title}
                    subtitle={subtitle}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}