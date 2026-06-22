import { Link } from '@inertiajs/react';

/**
 * TeacherHeader
 *
 * Props:
 *  - teacherName  {string}  nama lengkap guru, misal "Mr. Davis"
 *  - teacherRole  {string}  jabatan/mata pelajaran, misal "Guru Perpajakan"
 *  - initials     {string}  inisial untuk avatar (default 'D')
 *  - isOnline     {boolean} tampilkan dot hijau online (default true)
 */
export default function TeacherHeader({
    teacherName = 'Mr. Davis',
    teacherRole = 'Guru Perpajakan',
    initials = 'D',
    isOnline = true,
}) {
    return (
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div>
                <h1 className="text-base font-black text-[#1A6B3C] tracking-tight leading-none">APTAX</h1>
                <p className="text-[10px] text-gray-400 font-medium">Teacher Dashboard</p>
            </div>

            <div className="flex items-center gap-2.5">
                <div className="text-right">
                    <p className="text-xs font-semibold text-gray-800 leading-none">{teacherName}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{teacherRole}</p>
                </div>

                <Link href="/teacher/profile" className="relative group" aria-label="Profil Guru">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A6B3C] to-[#34C27A] flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-white group-hover:ring-[#34C27A] transition-all">
                        {initials.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                    )}
                </Link>
            </div>
        </header>
    );
}
