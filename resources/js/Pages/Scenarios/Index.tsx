import ModulePlaceholder from '@/Components/layout/ModulePlaceholder';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ScenariosIndex() {
    return (
        <AuthenticatedLayout
            title="Scenāriji"
            subtitle="Pasniedzēja veidoti mācību un eksāmenu uzdevumi"
        >
            <Head title="Scenāriji" />

            <ModulePlaceholder
                title="Scenāriju veidošanas modulis"
                description="Šeit pasniedzējs varēs izveidot kuģa stabilitātes uzdevumus, definēt sākuma stāvokli, kravas nosacījumus, balasta stāvokli, vērtēšanas kritērijus un piešķirt scenārijus studentiem."
                items={[
                    'Jauns mācību scenārijs',
                    'Eksāmena režīms bez hintiem',
                    'Piešķiršana grupām vai studentiem',
                    'Scenārija validācija pirms publicēšanas',
                ]}
            />
        </AuthenticatedLayout>
    );
}