import { router, usePage } from '@inertiajs/react';

export default function StudentHeader() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin keluar dari APTAX?')) {
            router.post(route('logout'));
        }
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'S';
    };

    return (
        <header className="relative z-10 px-4 pt-4 pb-3 flex items-center justify-between bg-white/70 backdrop-blur-sm border-b border-gray-100/60">
            <div>
                <h1 className="text-base font-black text-[#1A6B3C] tracking-tight leading-none">APTAX</h1>
                <p className="text-[10px] text-gray-400 font-medium">Tax City</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <h2 className="text-xs font-bold text-gray-800 tracking-tight leading-tight">
                        {user?.name || 'Nama Siswa'}
                    </h2>
                    <p className="text-[10px] text-[#1A6B3C] font-semibold mt-0.5 leading-none">
                        {user?.class_name || 'Tidak ada kelas'}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="relative group cursor-pointer focus:outline-none"
                    title="Keluar Aplikasi"
                    aria-label="Logout"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-md ring-2 ring-white group-hover:ring-red-500 transition-all">
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
