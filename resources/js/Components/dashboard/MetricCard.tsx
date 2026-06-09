import type { LucideIcon } from 'lucide-react';

type MetricCardProps = {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    status?: 'good' | 'warning' | 'danger' | 'neutral';
};

const statusClasses = {
    good: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-700 ring-amber-100',
    danger: 'bg-red-50 text-red-700 ring-red-100',
    neutral: 'bg-slate-50 text-slate-700 ring-slate-100',
};

export default function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    status = 'neutral',
}: MetricCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {value}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {description}
                    </p>
                </div>

                <div className={`rounded-xl p-3 ring-1 ${statusClasses[status]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}