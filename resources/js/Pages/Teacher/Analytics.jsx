import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';
import { AiModal } from '@/Components/Teacher/AiModal';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
    AreaChart, Area, ResponsiveContainer,
    PieChart, Pie, Legend,
} from 'recharts';

const LEVEL_COLOR = {
    mastered: '#10b981', // emerald-500
    moderate: '#f59e0b', // amber-500
    struggle: '#f43f5e', // rose-500
};

const LEVEL_BADGE = {
    mastered: { badge: 'bg-emerald-100 text-emerald-700', label: 'Mastered' },
    moderate: { badge: 'bg-amber-100 text-amber-700', label: 'Moderate' },
    struggle: { badge: 'bg-rose-100 text-rose-600', label: 'High Struggle' },
};

function fmtXp(n) {
    return Number(n || 0).toLocaleString('id-ID');
}

function RankMedal({ rank }) {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="w-7 text-center text-sm font-bold text-gray-400">{rank}</span>;
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs">
            <p className="font-bold text-gray-700 mb-0.5">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.fill }}>
                    {p.name}: <span className="font-bold">{p.value}</span>
                </p>
            ))}
        </div>
    );
}

function TopicBarChart({ data }) {
    if (!data?.length) {
        return (
            <div className="py-10 text-center text-xs text-gray-400">
                Belum ada data submission yang bisa dianalisis.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 42)}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} unit="%" />
                <YAxis
                    type="category"
                    dataKey="topic"
                    width={140}
                    tick={{ fontSize: 10, fill: '#4b5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pct" name="Akurasi" radius={[0, 6, 6, 0]} barSize={16}>
                    {data.map((entry, i) => (
                        <Cell key={i} fill={LEVEL_COLOR[entry.level]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function MasteryDonut({ data }) {
    const summary = ['mastered', 'moderate', 'struggle'].map((lvl) => ({
        name: LEVEL_BADGE[lvl].label,
        value: data.filter((d) => d.level === lvl).length,
        level: lvl,
    })).filter((d) => d.value > 0);

    if (!summary.length) return null;

    return (
        <ResponsiveContainer width="100%" height={160}>
            <PieChart>
                <Pie
                    data={summary}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                >
                    {summary.map((entry, i) => (
                        <Cell key={i} fill={LEVEL_COLOR[entry.level]} stroke="none" />
                    ))}
                </Pie>
                <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
}

function WeeklyAreaChart({ data }) {
    if (!data?.length) return null;

    return (
        <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                    <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="completed"
                    name="Kuis Selesai"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#weeklyFill)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

function AnalyticsTab({ classStats, topicAnalytics, weeklyProgress, onOpenAI, aiLoading }) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 px-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-extrabold text-emerald-600">{fmtXp(classStats.totalClassXp)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">Total Class XP</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-extrabold text-[#1A6B3C]">{classStats.avgCompletion}%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">Avg. Completion</p>
                </div>
            </div>

            <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-extrabold text-gray-900">Topic Mastery Analysis</h3>
                </div>
                <p className="text-[11px] text-gray-400 mb-2">Rata-rata akurasi AI Score siswa per topik pajak.</p>
                <TopicBarChart data={topicAnalytics} />
                {topicAnalytics.length > 0 && (
                    <div className="mt-2 border-t border-gray-50 pt-2">
                        <MasteryDonut data={topicAnalytics} />
                    </div>
                )}
            </div>

            <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-extrabold text-gray-900 mb-1">Weekly Progress</h3>
                <p className="text-[11px] text-gray-400 mb-2">Tren jumlah kuis yang diselesaikan siswa per minggu.</p>
                <WeeklyAreaChart data={weeklyProgress} />
            </div>

            <div className="mx-4 bg-gray-900 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">AI Diagnostic</p>
                        <p className="text-sm font-extrabold text-white">Laporan Kebingungan Siswa</p>
                    </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    Klik tombol di bawah untuk menjalankan analisis AI terbaru berdasarkan data submission kelas saat ini.
                </p>

                <button
                    onClick={onOpenAI}
                    disabled={aiLoading}
                    className="w-full py-3 bg-emerald-400 hover:bg-emerald-500 active:opacity-90 disabled:opacity-60 text-emerald-950 font-extrabold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    {aiLoading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Menganalisis data kelas...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                            Analisis dengan AI
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function RankingTab({ leaderboardData }) {
    const top = leaderboardData[0]?.xp || 1;

    return (
        <div className="px-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-extrabold text-gray-900">Class Leaderboard</h3>
                <span className="text-xs text-gray-400 font-medium">{leaderboardData.length} siswa</span>
            </div>

            {leaderboardData.length === 0 && (
                <div className="py-10 text-center text-xs text-gray-400">Belum ada siswa di kelas ini.</div>
            )}

            {leaderboardData.map((student) => (
                <div
                    key={student.id}
                    className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border shadow-sm ${
                        student.rank === 1 ? 'border-amber-200 bg-amber-50/60' : 'border-gray-100'
                    }`}
                >
                    <div className="w-8 flex items-center justify-center shrink-0">
                        <RankMedal rank={student.rank} />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-extrabold text-white shrink-0">
                        {student.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Level {student.level}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={`text-sm font-extrabold ${student.rank === 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {fmtXp(student.xp)}
                        </p>
                        <p className="text-[10px] text-gray-400">XP</p>
                    </div>
                </div>
            ))}

            {leaderboardData.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mt-2">
                    <p className="text-xs font-bold text-gray-500 mb-2">📊 Distribusi XP Kelas</p>
                    <div className="space-y-1.5">
                        {leaderboardData.map((s) => (
                            <div key={s.id} className="flex items-center gap-2">
                                <p className="text-[10px] text-gray-500 w-24 truncate shrink-0">{s.name.split(' ')[0]}</p>
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{ width: `${Math.round((s.xp / top) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-gray-600 w-16 text-right shrink-0">{fmtXp(s.xp)} XP</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TeacherAnalytics({ classStats, topicAnalytics, weeklyProgress, leaderboardData, aiDiagnostic }) {
    const [tab, setTab] = useState('analytics');
    const [aiModal, setAiModal] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [diagnosticData, setDiagnosticData] = useState(aiDiagnostic);

    const handleOpenAI = () => {
        setAiLoading(true);
        router.reload({
            only: ['aiDiagnostic'],
            onSuccess: (page) => {
                setDiagnosticData(page.props.aiDiagnostic);
                setAiLoading(false);
                setAiModal(true);
            },
            onError: () => {
                setAiLoading(false);
            },
        });
    };

    return (
        <AppLayout>
            <TeacherHeader teacherName="Mr. Davis" teacherRole="Guru Perpajakan" initials="D" isOnline />

            <div className="pb-28 pt-2">
                <div className="px-4 mb-4">
                    <h1 className="text-2xl font-extrabold text-gray-900">Class Analytics</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Pantau performa dan progres kompetensi kelas Anda.</p>
                </div>

                <div className="flex bg-gray-100 rounded-xl p-1 mx-4 mb-5">
                    {[
                        { key: 'analytics', label: 'Analytics' },
                        { key: 'ranking', label: 'Ranking' },
                    ].map((t) => (
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

                {tab === 'analytics' ? (
                    <AnalyticsTab
                        classStats={classStats}
                        topicAnalytics={topicAnalytics}
                        weeklyProgress={weeklyProgress}
                        onOpenAI={handleOpenAI}
                        aiLoading={aiLoading}
                    />
                ) : (
                    <RankingTab leaderboardData={leaderboardData} />
                )}
            </div>

            {aiModal && <AiModal data={diagnosticData} onClose={() => setAiModal(false)} />}

            <TeacherBottomNav active="analytics" />
        </AppLayout>
    );
}