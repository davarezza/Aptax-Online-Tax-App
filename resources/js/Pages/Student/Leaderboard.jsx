import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';

export default function StudentLeaderboard() {
    const [filterTab, setFilterTab] = useState('global');
    const [showMore, setShowMore] = useState(false);

    // Ambil data asli yang dilemparkan oleh LeaderboardController
    const { currentUserStats, leaderboardData } = usePage().props;

    // Ambil list data sesuai tab, berikan array kosong sebagai fallback jika data belum termuat
    const currentList = leaderboardData?.[filterTab] || [];

    // Tentukan limit tampilan (Default: tampilkan 5 siswa, jika klik lihat lebih banyak tampilkan seluruhnya)
    const filteredLeaderboard = showMore ? currentList : currentList.slice(0, 5);

    const renderRankBadge = (rank) => {
        if (rank === 1) return <span className="text-lg animate-pulse">🥇</span>;
        if (rank === 2) return <span className="text-lg">🥈</span>;
        if (rank === 3) return <span className="text-lg">🥉</span>;
        return <span className="w-5 text-center text-xs font-black text-slate-400">{rank}</span>;
    };

    return (
        <AppLayout>
            <StudentHeader />

            <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto pb-24">

                {/* TOP CARD: Ringkasan Profil Siswa yang Sedang Login */}
                <div className="mx-4 mt-4 p-5 rounded-[32px] bg-gradient-to-b from-[#E6F9F3] to-white border border-[#D5F2E8] shadow-sm flex flex-col items-center relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#22C55E]/10 rounded-full" />

                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[#00C48C] flex items-center justify-center text-white text-2xl font-black shadow-inner tracking-wide">
                            {currentUserStats?.initials}
                        </div>
                        <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#F59E0B] rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-black shadow-sm">
                            {currentUserStats?.level}
                        </div>
                    </div>

                    <h2 className="text-xl font-black text-slate-800 mt-3">{currentUserStats?.name}</h2>
                    <p className="text-xs text-slate-400 font-bold tracking-wide mt-0.5">Peringkat Ke-{currentUserStats?.rank}</p>

                    <div className="mt-4 w-full bg-white/90 border border-[#E4F5F0] rounded-2xl py-4 px-6 shadow-xs text-center">
                        <p className="text-3xl font-black text-[#1F5E39] tracking-tight">
                            {currentUserStats?.xp?.toLocaleString('id-ID')} <span className="text-base font-extrabold text-[#34A867]">XP</span>
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Total Kompetensi Pajak Anda
                        </p>
                    </div>

                    {/* Penamaan format level dinamis sesuai request */}
                    <div className="mt-4 px-4 py-2 bg-[#DCFCE7] text-[#15803D] text-xs font-black rounded-full flex items-center gap-1.5 border border-[#BBF7D0]">
                        <span className="text-[10px]">⚡</span> Level {currentUserStats?.level} - {currentUserStats?.titleLevel}
                    </div>
                </div>

                {/* AREA TAB LIST LEADERBOARD */}
                <div className="px-5 mt-5 flex flex-col flex-1">
                    <h3 className="text-base font-black text-slate-800 mb-3">Papan Peringkat Kompetensi</h3>

                    <div className="bg-gray-200/60 p-1 rounded-2xl flex items-center w-full mb-4">
                        <button
                            onClick={() => setFilterTab('global')}
                            className={`flex-1 text-center font-black text-xs py-2.5 rounded-xl transition-all ${
                                filterTab === 'global' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                            }`}
                        >
                            Global XP
                        </button>
                        <button
                            onClick={() => setFilterTab('weekly')}
                            className={`flex-1 text-center font-black text-xs py-2.5 rounded-xl transition-all ${
                                filterTab === 'weekly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                            }`}
                        >
                            Weekly Quest
                        </button>
                    </div>

                    {filterTab === 'weekly' && (
                        <div className="mb-4 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl flex items-start gap-2.5">
                            <span className="text-amber-500 text-sm shrink-0">⚡</span>
                            <div>
                                <h4 className="text-[11px] font-black text-[#B45309]">Weekly Quest Aktif</h4>
                                <p className="text-[10px] text-[#D97706] font-medium mt-0.5">
                                    Peringkat direset setiap Senin 00:00 — tetap semangat meningkatkan kompetensi fiskal!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* LIST DAFTAR SISWA */}
                    <div className="space-y-2.5">
                        {filteredLeaderboard.map((student) => (
                            <div
                                key={student.id}
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                    student.isSelf
                                        ? 'bg-white border-[#1A6B3C] ring-2 ring-[#1A6B3C]/10'
                                        : 'bg-white border-gray-100 shadow-xs'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 flex justify-center shrink-0">
                                        {renderRankBadge(student.rank)}
                                    </div>

                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${student.badgeColor}`}>
                                        {student.initials}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className={`text-[13px] font-extrabold ${student.isSelf ? 'text-[#1A6B3C]' : 'text-slate-800'}`}>
                                            {student.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-semibold">
                                            Level {student.level} - {student.titleLevel}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className={`text-sm font-black tracking-tight block ${student.isSelf ? 'text-[#1A6B3C]' : 'text-slate-700'}`}>
                                        {student.xp.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider block -mt-0.5">
                                        XP
                                    </span>
                                </div>
                            </div>
                        ))}

                        {currentList.length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-6">Belum ada data skor siswa.</p>
                        )}
                    </div>

                    {/* BUTTON TOGGLE SHOW MORE */}
                    {currentList.length > 5 && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="text-xs font-black px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-slate-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs"
                            >
                                {showMore ? 'Lihat Lebih Sedikit ▲' : 'Lihat Semua Peringkat ▼'}
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <StudentBottomNav active="leaderboard" />
        </AppLayout>
    );
}
