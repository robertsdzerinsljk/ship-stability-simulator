import ModulePlaceholder from '@/Components/layout/ModulePlaceholder';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function StabilityIndex() {
    return (
        <AuthenticatedLayout
            title="Stabilitāte"
            subtitle="GM, KG, KM, GZ līkne, trims un drošības kritēriji"
        >
            <Head title="Stabilitāte" />

            <ModulePlaceholder
                title="Stabilitātes analīze"
                description="Šeit atradīsies kuģa stabilitātes aprēķinu rezultāti, GZ līkne, šķērspēka profils, lieces momenta profils un kritēriju pārbaude."
                items={[
                    'GM un KG aprēķins',
                    'GZ līkne',
                    'Šķērspēka profils',
                    'Lieces momenta profils',
                ]}
            />
        </AuthenticatedLayout>
    );
}