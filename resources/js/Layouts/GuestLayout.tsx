import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const fullLogoSrc = '/images/ljk-logo.png';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-5 py-10 sm:px-8">
            <div className="mb-6">
                <Link href="/">
                    <img
                        src={fullLogoSrc}
                        alt="Liepajas Jurniecibas koledza"
                        className="h-20 w-auto object-contain"
                    />
                </Link>
            </div>

            <div className="w-full max-w-3xl">
                {children}
            </div>
        </div>
    );
}
