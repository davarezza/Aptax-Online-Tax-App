import { Link } from '@inertiajs/react';

const links = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/teacher/dashboard',
        icon: (className) => (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
        ),
    },
    {
        key: 'maker',
        label: 'Maker',
        href: '/teacher/maker',
        icon: (className) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
    },
    {
        key: 'spt',
        label: 'Buat Soal SPT',
        href: '/teacher/spt',
        isHighlight: true, // Marker bulatan tengah
        icon: (className) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        key: 'class',
        label: 'Class',
        href: '/teacher/class',
        icon: (className) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        key: 'analytics',
        label: 'Analytics',
        href: '/teacher/analytics',
        icon: (className) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
];

export default function TeacherBottomNav({ active = 'dashboard' }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md w-full mx-auto bg-white border-t border-gray-200 flex items-center justify-between px-1 py-1 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            {links.map((l) => {
                const isActive = active === l.key;

                if (l.isHighlight) {
                    return (
                        <Link
                            key={l.key}
                            href={l.href}
                            className="flex-1 flex flex-col items-center justify-center"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-all duration-200 ${
                                isActive ? 'bg-[#114B29] scale-105' : 'bg-[#1A6B3C]'
                            }`}>
                                {l.icon('w-5 h-5')}
                            </div>
                            <span className={`text-[10px] font-semibold mt-1 transition-colors ${
                                isActive ? 'text-[#1A6B3C]' : 'text-gray-400'
                            }`}>
                                {l.label}
                            </span>
                        </Link>
                    );
                }

                return (
                    <Link
                        key={l.key}
                        href={l.href}
                        className={`flex-1 flex flex-col items-center justify-center transition-colors ${
                            isActive ? 'text-[#1A6B3C]' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <div className="w-10 h-10 flex items-center justify-center">
                            {l.icon('w-5 h-5')}
                        </div>
                        <span className="text-[10px] font-semibold">
                            {l.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
