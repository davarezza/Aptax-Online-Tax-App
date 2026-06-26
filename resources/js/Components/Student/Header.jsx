import { router } from '@inertiajs/react';

/**
 * StudentHeader
 *
 * Props:
 * - notifCount  {number}  badge angka di bell (default 0 = tidak tampil)
 * - streakDays  {number}  jumlah hari streak (default 0 = tidak tampil)
 * - userName    {string}  inisial avatar (default 'A')
 */
export default function StudentHeader({
    notifCount = 0,
    streakDays = 0,
    userName = 'A',
}) {
    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin keluar dari APTAX?')) {
            router.post(route('logout'));
        }
    };

    return (
        <header className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between bg-white/70 backdrop-blur-sm border-b border-gray-100/60">
            <div>
                <h1 className="text-base font-black text-[#1A6B3C] tracking-tight leading-none">APTAX</h1>
                <p className="text-[10px] text-gray-400 font-medium">Tax City</p>
            </div>

            <div className="flex items-center gap-2">
                {streakDays > 0 && (
                    <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
                        <span className="text-sm">🔥</span>
                        <span className="text-[10px] font-bold text-orange-500">{streakDays} Hari</span>
                    </div>
                )}

                <div className="relative">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                    {notifCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                            {notifCount}
                        </span>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="relative group cursor-pointer focus:outline-none"
                    title="Keluar Aplikasi"
                    aria-label="Logout"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-xs shadow-md ring-2 ring-white group-hover:ring-red-500 transition-all">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-600 border border-white rounded-full flex items-center justify-center shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-2 h-2 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                        </svg>
                    </div>
                </button>
            </div>
        </header>
    );
}
