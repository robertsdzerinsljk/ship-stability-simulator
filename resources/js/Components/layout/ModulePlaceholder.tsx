type ModulePlaceholderProps = {
    title: string;
    description: string;
    items: string[];
};

export default function ModulePlaceholder({
    title,
    description,
    items,
}: ModulePlaceholderProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="max-w-3xl">
                <h2 className="text-xl font-semibold text-slate-950">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {items.map((item) => (
                        <div
                            key={item}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}