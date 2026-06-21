import { useState } from 'react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';
import { AiModal } from '@/Components/Teacher/AiModal';

// ── DATA MOCK UTAMA ───────────────────────────────────────────────────────────

const MASTERY_DATA = [
    { topic: 'Faktur Pajak & PPN',         pct: 88, level: 'mastered' },
    { topic: 'Subjek & Objek Pajak',         pct: 81, level: 'mastered' },
    { topic: 'Dasar-Dasar Perpajakan',       pct: 76, level: 'moderate' },
    { topic: 'Mekanisme PPh 21',             pct: 62, level: 'moderate' },
    { topic: 'Deadline Pelaporan Pajak',     pct: 55, level: 'moderate' },
    { topic: 'PPh 23 & Withholding Tax',     pct: 48, level: 'struggle' },
    { topic: 'Kredit & Pengurang Pajak',     pct: 34, level: 'struggle' },
    { topic: 'Rekonsiliasi Fiskal',          pct: 28, level: 'struggle' },
];

const DIAGNOSTIC_ITEMS = [
    { id: 1, icon: '📉', label: 'High Struggle', color: 'text-rose-400', bg: 'bg-rose-500/10', text: '65% siswa kesulitan menghitung PTKP untuk status pernikahan K/I/3 pada PPh 21.' },
    { id: 2, icon: '⚠️', label: 'Common Error', color: 'text-amber-400', bg: 'bg-amber-500/10', text: 'Mayoritas siswa menukar batas waktu pelaporan SPT Masa PPN (akhir bulan berikutnya).' },
    { id: 3, icon: '🔁', label: 'Skip Pattern', color: 'text-sky-400', bg: 'bg-sky-500/10', text: 'Soal rekonsiliasi fiskal sering dilewati; indikasi kurangnya kepercayaan diri pada topik ini.' },
];

const LEADERBOARD = [
    { id: 1, name: 'Siti Aminah',     initials: 'SA', color: 'bg-emerald-500', xp: 13200, level: 14 },
    { id: 2, name: 'Alex Johnson',    initials: 'AJ', color: 'bg-sky-500',     xp: 12450, level: 12 },
    { id: 3, name: 'Budi Santoso',    initials: 'BS', color: 'bg-blue-500',    xp: 9800,  level: 10 },
    { id: 4, name: 'Rendra Kusuma',   initials: 'RK', color: 'bg-rose-500',    xp: 6900,  level: 8  },
    { id: 5, name: 'Dewi Lestari',    initials: 'DL', color: 'bg-violet-500',  xp: 7600,  level: 9  },
    { id: 6, name: 'Agus Pratama',    initials: 'AP', color: 'bg-amber-500',   xp: 5400,  level: 7  },
];

const SORTED_BOARD = [...LEADERBOARD].sort((a, b) => b.xp - a.xp).map((s, i) => ({ ...s, rank: i + 1 }));

const masteryConfig = {
    mastered: { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Mastered' },
    moderate: { bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700',     label: 'Moderate' },
    struggle: { bar: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-600',       label: 'High Struggle' },
};

function fmtXp(n) { return n.toLocaleString('id-ID'); }

function RankMedal({ rank }) {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="w-7 text-center text-sm font-bold text-gray-400">{rank}</span>;
}

// ── ANALYTICS SUB-TAB ─────────────────────────────────────────────────────────

function AnalyticsTab({ onOpenAI }) {
    const totalXp = LEADERBOARD.reduce((s, x) => s + x.xp, 0);
    const avgCompl = 78;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 px-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-extrabold text-indigo-600">{fmtXp(totalXp)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">Total Class XP</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-extrabold text-[#1A6B3C]">{avgCompl}%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">Avg. Completion</p>
                </div>
            </div>

            <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-extrabold text-gray-900 mb-3">Topic Mastery Heatmap</h3>
                <div className="space-y-3">
                    {MASTERY_DATA.map((item) => {
                        const cfg = masteryConfig[item.level];
                        return (
                            <div key={item.topic}>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-semibold text-gray-700 truncate pr-2 flex-1">{item.topic}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${item.pct}%` }} />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5 text-right">{item.pct}% akurasi kelas</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mx-4 bg-gray-900 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">AI Diagnostic</p>
                        <p className="text-sm font-extrabold text-white">Laporan Kebingungan Siswa</p>
                    </div>
                </div>

                <div className="space-y-2.5 mb-4">
                    {DIAGNOSTIC_ITEMS.map(item => (
                        <div key={item.id} className={`${item.bg} rounded-xl p-3 flex items-start gap-2.5`}>
                            <span className="text-base shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                                <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${item.color}`}>{item.label}</p>
                                <p className="text-xs text-gray-300 leading-relaxed">{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={onOpenAI} className="w-full py-3 bg-[#4ADE80] hover:bg-[#22c55e] active:opacity-90 text-[#14532d] font-extrabold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Analisis dengan AI
                </button>
            </div>
        </div>
    );
}

// ── RANKING SUB-TAB ───────────────────────────────────────────────────────────

function RankingTab() {
    return (
        <div className="px-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-extrabold text-gray-900">Class Leaderboard</h3>
                <span className="text-xs text-gray-400 font-medium">{SORTED_BOARD.length} siswa</span>
            </div>

            {SORTED_BOARD.map((student) => (
                <div key={student.id} className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border shadow-sm ${student.rank === 1 ? 'border-amber-200 bg-amber-50/60' : 'border-gray-100'}`}>
                    <div className="w-8 flex items-center justify-center shrink-0">
                        <RankMedal rank={student.rank} />
                    </div>
                    <div className={`w-10 h-10 rounded-full ${student.color} flex items-center justify-center text-sm font-extrabold text-white shrink-0`}>
                        {student.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Level {student.level}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={`text-sm font-extrabold ${student.rank === 1 ? 'text-amber-600' : 'text-indigo-600'}`}>{fmtXp(student.xp)}</p>
                        <p className="text-[10px] text-gray-400">XP</p>
                    </div>
                </div>
            ))}

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mt-2">
                <p className="text-xs font-bold text-gray-500 mb-2">📊 Distribusi XP Kelas</p>
                <div className="space-y-1.5">
                    {SORTED_BOARD.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                            <p className="text-[10px] text-gray-500 w-24 truncate shrink-0">{s.name.split(' ')[0]}</p>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${Math.round((s.xp / SORTED_BOARD[0].xp) * 100)}%` }} />
                            </div>
                            <p className="text-[10px] font-bold text-gray-600 w-16 text-right shrink-0">{fmtXp(s.xp)} XP</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── COMPONENT UTAMA PAGE ──────────────────────────────────────────────────────

export default function TeacherAnalytics() {
    const [tab, setTab]         = useState('analytics'); // 'analytics' | 'ranking'
    const [aiModal, setAiModal] = useState(false);

    return (
        <AppLayout>
            <TeacherHeader teacherName="Mr. Davis" teacherRole="Guru Perpajakan" initials="D" isOnline />

            <div className="pb-28 pt-2">
                {/* Page header */}
                <div className="px-4 mb-4">
                    <h1 className="text-2xl font-extrabold text-gray-900">Class Analytics</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Pantau performa dan progres kompetensi kelas Anda.</p>
                </div>

                {/* Tab toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1 mx-4 mb-5">
                    {[
                        { key: 'analytics', label: 'Analytics' },
                        { key: 'ranking',   label: 'Ranking'   },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                                tab === t.key ? 'bg-white text-[#1A6B3C] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Switch Render Tab */}
                {tab === 'analytics'
                    ? <AnalyticsTab onOpenAI={() => setAiModal(true)} />
                    : <RankingTab />
                }
            </div>

            {/* AI Modal component yang di-isolasi */}
            {aiModal && <AiModal onClose={() => setAiModal(false)} />}

            <TeacherBottomNav active="analytics" />
        </AppLayout>
    );
}
