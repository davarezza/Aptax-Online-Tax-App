import { router, usePage } from '@inertiajs/react';

export default function TeacherHeader() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'S';
    };

    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin keluar dari APTAX?')) {
            router.post(route('logout'));
        }
    };

    return (
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div>
                <h1 className="text-base font-black text-[#1A6B3C] tracking-tight leading-none">APTAX</h1>
                <p className="text-[10px] text-gray-400 font-medium">Teacher Dashboard</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <h2 className="text-xs font-bold text-gray-800 tracking-tight leading-tight">
                        {user?.name || 'Nama Siswa'}
                    </h2>
                    <p className="text-[10px] text-[#1A6B3C] font-semibold mt-0.5 leading-none">
                        Guru Kelas
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="relative group cursor-pointer focus:outline-none"
                    title="Keluar Aplikasi"
                    aria-label="Logout"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-xs shadow-md ring-2 ring-white group-hover:ring-red-500 transition-all">
                        {getInitial(user?.name)}
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
