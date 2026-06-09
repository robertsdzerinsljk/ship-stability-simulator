import ModulePlaceholder from '@/Components/layout/ModulePlaceholder';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ReportsIndex() {
    return (
        <AuthenticatedLayout
            title="Atskaites"
            subtitle="PDF, XLSX un CSV pārskati par simulācijas rezultātiem"
        >
            <Head title="Atskaites" />

            <ModulePlaceholder
                title="Atskaišu modulis"
                description="Šeit lietotājs varēs ģenerēt kravas plāna, balasta, stabilitātes un studenta rezultātu pārskatus. Pirmajā versijā sāksim ar PDF pārskatu."
                items={[
                    'Stabilitātes atskaite',
                    'Kravas plāna atskaite',
                    'Balasta operāciju atskaite',
                    'Rezultātu pārskats',
                ]}
            />
        </AuthenticatedLayout>
    );
}