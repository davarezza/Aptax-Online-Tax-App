import { useState } from 'react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';
import { StudentCard, StudentModal } from '@/Components/Teacher/ClassComponents';

const STUDENTS = [
    {
        id: 1, name: 'Budi Santoso', initials: 'BS', color: 'bg-sky-500', lastActivity: 'Menyelesaikan Kuis PPN', activityType: 'done', progress: 85, level: 10, xp: 9800,
        tasks: [
            { id: 't1', title: 'Introduction to PPh 21', score: 85, aiFeedback: 'Secara keseluruhan jawaban sudah baik. Namun perhitungan PTKP untuk status K/1 pada soal nomor 3 masih keliru...', thread: [] },
            { id: 't2', title: 'VAT (PPN) Fundamentals', score: 78, aiFeedback: 'Pemahaman konsep dasar PPN sudah tepat...', thread: [] },
            { id: 't3', title: 'Filing Deadlines Challenge', score: 92, aiFeedback: 'Performa sangat memuaskan!...', thread: [] }
        ]
    },
    { id: 2, name: 'Siti Aminah', initials: 'SA', color: 'bg-emerald-500', lastActivity: 'Menyelesaikan Modul Dasar Pajak', activityType: 'done', progress: 100, level: 14, xp: 13200, tasks: [] },
    { id: 3, name: 'Agus Pratama', initials: 'AP', color: 'bg-amber-500', lastActivity: 'Terakhir aktif 2 hari lalu', activityType: 'inactive', progress: 45, level: 7, xp: 5400, tasks: [] },
    { id: 4, name: 'Dewi Lestari', initials: 'DL', color: 'bg-violet-500', lastActivity: 'Selesai membaca materi PPh 21', activityType: 'done', progress: 60, level: 9, xp: 7600, tasks: [] },
    { id: 5, name: 'Rendra Kusuma', initials: 'RK', color: 'bg-rose-500', lastActivity: 'Menyelesaikan Kuis PPh 23', activityType: 'done', progress: 72, level: 8, xp: 6900, tasks: [] }
];

export default function TeacherClass() {
    const [search, setSearch]     = useState('');
    const [filterOpen, setFilter] = useState(false);
    const [sortBy, setSortBy]     = useState('name');
    const [selected, setSelected] = useState(null);

    const filtered = STUDENTS
        .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'progress') return b.progress - a.progress;
            if (sortBy === 'xp')       return b.xp - a.xp;
            return a.name.localeCompare(b.name);
        });

    const avgProgress = Math.round(STUDENTS.reduce((s, x) => s + x.progress, 0) / STUDENTS.length);

    return (
        <AppLayout>
            <TeacherHeader teacherName="Mr. Davis" teacherRole="Guru Perpajakan" initials="D" isOnline />
            <div className="pb-28 pt-2">
                <div className="px-4 mb-4">
                    <h1 className="text-2xl font-extrabold text-gray-900">Daftar Siswa & Log Aktivitas</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Pantau progres dan aktivitas kelas Anda secara real-time.</p>
                </div>

                <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
                    {[
                        { label: 'Total Siswa', value: STUDENTS.length, color: 'text-gray-900' },
                        { label: 'Avg. Progress', value: `${avgProgress}%`, color: 'text-[#1A6B3C]' },
                        { label: 'Tuntas 100%', value: STUDENTS.filter(s => s.progress === 100).length, color: 'text-emerald-600' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
                            <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-tight">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 px-4 mb-5">
                    <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 shadow-sm focus-within:border-[#1A6B3C] transition-colors">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari siswa..."
                            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <button onClick={() => setFilter(p => !p)}
                            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-sm transition-colors
                                ${filterOpen ? 'bg-[#1A6B3C] border-[#1A6B3C] text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-[#1A6B3C]'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                            </svg>
                        </button>
                        {filterOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">Urutkan</p>
                                {[
                                    { key: 'name',     label: 'Nama (A–Z)' },
                                    { key: 'progress', label: 'Progress Tertinggi' },
                                    { key: 'xp',       label: 'XP Tertinggi' },
                                ].map(opt => (
                                    <button key={opt.key}
                                        onClick={() => { setSortBy(opt.key); setFilter(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                                            ${sortBy === opt.key ? 'bg-[#1A6B3C] text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                                <div className="h-2" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-4">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm font-medium">Siswa tidak ditemukan</p>
                        </div>
                    ) : (
                        filtered.map(student => (
                            <StudentCard key={student.id} student={student} onClick={setSelected} />
                        ))
                    )}
                </div>
            </div>
            {selected && (
                <StudentModal student={selected} onClose={() => setSelected(null)} />
            )}
            <TeacherBottomNav active="class" />
        </AppLayout>
    );
}
