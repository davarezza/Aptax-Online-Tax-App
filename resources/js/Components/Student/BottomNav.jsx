import { Link } from '@inertiajs/react';

const links = [
    {
        key: 'home',
        label: 'Home',
        href: '/student/home',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
        ),
    },
    {
        key: 'modules',
        label: 'Modules',
        href: '/student/modules',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
        ),
    },
    {
        key: 'tasks',
        label: 'Tasks',
        href: '/student/tasks',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
    {
        key: 'leaderboard',
        label: 'Leaderboard',
        href: '/student/leaderboard',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v12l-4-2-4 2V4M6 20h12" />
            </svg>
        ),
    },
];

export default function StudentBottomNav({ active = 'home' }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md w-full mx-auto bg-[#F5F0E8] border-t border-[#E0D8C8] flex z-20">
            {links.map((l) => {
                const isActive = active === l.key;
                return (
                    <Link
                        key={l.key}
                        href={l.href}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                            isActive ? 'text-[#1A6B3C]' : 'text-[#A09880]'
                        }`}
                    >
                        {isActive ? (
                            <span className="bg-[#1A6B3C] text-white rounded-xl px-3 py-1 flex items-center gap-1.5 text-xs font-semibold">
                                {l.icon}
                                {l.label}
                            </span>
                        ) : (
                            <>
                                {l.icon}
                                <span className="text-[10px] font-medium">{l.label}</span>
                            </>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
