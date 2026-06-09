import ModulePlaceholder from '@/Components/layout/ModulePlaceholder';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function SettingsIndex() {
    return (
        <AuthenticatedLayout
            title="Iestatījumi"
            subtitle="Lietotāji, lomas, kuģu dati, sistēmas parametri un integrācijas"
        >
            <Head title="Iestatījumi" />

            <ModulePlaceholder
                title="Sistēmas iestatījumi"
                description="Šajā sadaļā vēlāk pārvaldīsim lietotājus, lomas, Google autentifikāciju, kuģu datubāzi, kravu tipus, stabilitātes robežvērtības un valodas iestatījumus."
                items={[
                    'Lietotāji un lomas',
                    'Google autentifikācija',
                    'Kuģu datubāze',
                    'Stabilitātes kritēriji',
                ]}
            />
        </AuthenticatedLayout>
    );
}