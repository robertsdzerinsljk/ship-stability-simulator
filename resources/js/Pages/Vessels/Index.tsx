import ModulePlaceholder from '@/Components/layout/ModulePlaceholder';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function VesselsIndex() {
    return (
        <AuthenticatedLayout
            title="Kuģis"
            subtitle="Kuģa tehniskā pase, tilpnes, tanki un drošības limiti"
        >
            <Head title="Kuģis" />

            <ModulePlaceholder
                title="Kuģa profils"
                description="Šajā sadaļā glabāsim kuģa pamatdatus, tilpņu konfigurāciju, balasta tankus, tehniskos limitus un dokumentāciju. Vēlāk šeit piesaistīsim arī reālus kuģu datus."
                items={[
                    'Kuģa pamatparametri',
                    'Kravas tilpnes',
                    'Balasta tanki',
                    'Drošības limiti',
                ]}
            />
        </AuthenticatedLayout>
    );
}