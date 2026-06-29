import { useState } from 'react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';
import { StudentCard, StudentModal } from '@/Components/Teacher/ClassComponents';

export default function TeacherClass({
    classInfo,
    studentsList = [],
    classStats   = { total: 0, avgProgress: 0, tuntas: 0 },
    activityLogs = [],
    currentUser,
}) {
    const [search, setSearch]     = useState('');
    const [filterOpen, setFilter] = useState(false);
    const [sortBy, setSortBy]     = useState('name');
    const [selected, setSelected] = useState(null);
    const [showLog, setShowLog]   = useState(false);

    const filtered = [...studentsList]
        .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'progress') return b.progress - a.progress;
            if (sortBy === 'xp')       return b.xp - a.xp;
            return a.name.localeCompare(b.name);
        });

    const stats = [
        { label: 'Total Siswa',  value: classStats.total,       color: 'text-gray-900' },
        { label: 'Avg. Progress', value: `${classStats.avgProgress}%`, color: 'text-[#1A6B3C]' },
        { label: 'Tuntas 100%',  value: classStats.tuntas,      color: 'text-emerald-600' },
    ];

    return (
        <AppLayout>
            <TeacherHeader
                teacherName={currentUser?.name ?? 'Guru'}
                teacherRole="Guru Perpajakan"
                initials={currentUser?.name?.[0]?.toUpperCase() ?? 'G'}
                isOnline
            />

            <div className="pb-28 pt-2">

                {/* ── Judul ── */}
                <div className="px-4 mb-4">
                    <h1 className="text-2xl font-extrabold text-gray-900">Daftar Siswa & Log Aktivitas</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {classInfo
                            ? `${classInfo.name} · ${classInfo.code}`
                            : 'Pantau progres dan aktivitas kelas Anda secara real-time.'
                        }
                    </p>
                </div>

                {/* ── Statistik ── */}
                <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
                    {stats.map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
                            <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-tight">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Log Aktivitas (collapsible) ── */}
                {activityLogs.length > 0 && (
                    <div className="mx-4 mb-4">
                        <button
                            onClick={() => setShowLog(v => !v)}
                            className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm text-sm font-bold text-gray-700"
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Log Aktivitas Terbaru
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showLog ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showLog && (
                            <div className="mt-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
                                {activityLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-700 leading-snug">{log.label}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-gray-400">{log.time}</span>
                                                {log.score != null && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                                        log.score >= 90 ? 'bg-emerald-100 text-emerald-700' :
                                                        log.score >= 70 ? 'bg-blue-100 text-blue-700'     :
                                                        'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {log.score}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Search + Sort ── */}
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
                        <button
                            onClick={() => setFilter(p => !p)}
                            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-sm transition-colors ${
                                filterOpen ? 'bg-[#1A6B3C] border-[#1A6B3C] text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-[#1A6B3C]'
                            }`}
                        >
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
                                    <button
                                        key={opt.key}
                                        onClick={() => { setSortBy(opt.key); setFilter(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                            sortBy === opt.key ? 'bg-[#1A6B3C] text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                                <div className="h-2" />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Daftar siswa ── */}
                <div className="px-4">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm font-medium">
                                {studentsList.length === 0 ? 'Belum ada siswa di kelas ini.' : 'Siswa tidak ditemukan.'}
                            </p>
                        </div>
                    ) : (
                        filtered.map(student => (
                            <StudentCard key={student.id} student={student} onClick={setSelected} />
                        ))
                    )}
                </div>
            </div>

            {/* Modal detail siswa */}
            {selected && (
                <StudentModal
                    student={selected}
                    currentUserId={currentUser?.id}
                    onClose={() => setSelected(null)}
                />
            )}

            <TeacherBottomNav active="class" />
        </AppLayout>
    );
}
