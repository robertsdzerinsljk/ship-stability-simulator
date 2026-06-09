import ModulePlaceholder from '@/Components/layout/ModulePlaceholder';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function CargoPlanIndex() {
    return (
        <AuthenticatedLayout
            title="Kravas plāns"
            subtitle="Kravas izvietošana pa tilpnēm un plāna validācija"
        >
            <Head title="Kravas plāns" />

            <ModulePlaceholder
                title="Kravas plāna modulis"
                description="Šeit students izvietos kravu pa kuģa tilpnēm, redzēs aizpildījuma procentus, svara sadalījumu, tilpuma limitus un sistēmas brīdinājumus."
                items={[
                    'Kravas pievienošana',
                    'Sadale pa tilpnēm',
                    'Tilpņu aizpildījuma pārbaude',
                    'Kravas plāna validācija',
                ]}
            />
        </AuthenticatedLayout>
    );
}