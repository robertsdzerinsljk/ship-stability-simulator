import ModulePlaceholder from '@/Components/layout/ModulePlaceholder';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function BallastIndex() {
    return (
        <AuthenticatedLayout
            title="Balasts"
            subtitle="Balasta tanku pārvaldība un kuģa līdzsvara korekcija"
        >
            <Head title="Balasts" />

            <ModulePlaceholder
                title="Balasta modulis"
                description="Šeit būs iespējams mainīt balasta tanku aizpildījumu, analizēt brīvās virsmas efektu, koriģēt trimu, sasvērumu un stabilitātes rezervi."
                items={[
                    'Tanku aizpildījums',
                    'Piepildīt vai iztukšot tanku',
                    'Pārsūknēšanas operācijas',
                    'Brīvās virsmas riska pārbaude',
                ]}
            />
        </AuthenticatedLayout>
    );
}