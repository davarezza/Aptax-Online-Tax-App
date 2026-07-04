import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

const COLORS = {
    green: '#1A6B3C',
    greenLight: '#3F9464',
    orange: '#FAA042',
    orangeLight: '#FCC488',
    gridLine: '#EEF2F1',
};

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
            {label && <p className="font-semibold text-gray-700 mb-0.5">{label}</p>}
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color || entry.payload?.color }} className="font-medium">
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
}

export default function TeacherDashboard({ teacherName, className, statsOverview, chartData, lateSubmissions }) {
    const donutData = chartData?.donutChart ?? [];
    const barData = chartData?.barChart ?? [];
    const lateCount = lateSubmissions?.studentCount ?? 0;
    const lateItems = lateSubmissions?.items ?? [];

    const donutTotal = donutData.reduce((sum, d) => sum + (d.value || 0), 0);

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto bg-[#F4F6F9] pb-24">
                <TeacherHeader teacherName={teacherName} teacherRole="Guru Perpajakan" initials={teacherName?.charAt(0) ?? 'G'} isOnline />
                <div className="px-4 py-4 space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Selamat datang, {teacherName}! 👋</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Ini ringkasan kelas {className}.</p>
                    </div>

                    {/* 4 Kartu Statistik */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {statsOverview?.map((s) => (
                            <div key={s.key ?? s.label} className={`border rounded-2xl p-3.5 ${s.color}`}>
                                <div className="text-xl mb-1">{s.icon}</div>
                                <p className="text-xl font-black leading-none">{s.value}</p>
                                <p className="text-[10px] font-medium mt-1 opacity-70">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {lateCount > 0 && (
                        <div className="bg-white border border-red-100 rounded-2xl p-3.5 flex gap-3 shadow-sm">
                            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0 text-base">⏰</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Peringatan Keterlambatan</span>
                                    <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Aksi Diperlukan</span>
                                </div>
                                <p className="text-xs font-semibold text-gray-800">
                                    {lateCount} siswa terlambat mengerjakan tugas
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                    Ada siswa yang belum mengerjakan atau mengumpulkan tugas melewati batas deadline. Lihat detail di daftar bawah.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-800 mb-1">Performa Siswa Kelas</p>
                            <p className="text-[10px] text-gray-400 mb-2">Performa Baik vs Butuh Bantuan</p>

                            <div className="relative h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={55}
                                            outerRadius={78}
                                            paddingAngle={3}
                                            stroke="none"
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-xl font-black text-gray-800">{donutTotal}</p>
                                    <p className="text-[9px] text-gray-400 font-medium">Total Siswa</p>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 mt-2">
                                {donutData.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-[10px] text-gray-500 font-medium">{entry.name} ({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-800 mb-1">Perbandingan Rata-rata Skor</p>
                            <p className="text-[10px] text-gray-400 mb-3">Kelas Anda vs kelas lain</p>

                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} stroke={COLORS.gridLine} />
                                        <XAxis
                                            dataKey="className"
                                            tick={{ fontSize: 9, fill: '#9CA3AF' }}
                                            interval={0}
                                            angle={-15}
                                            textAnchor="end"
                                            height={40}
                                        />
                                        <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} width={28} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26,107,60,0.05)' }} />
                                        <Bar dataKey="avgScore" name="Rata-rata Skor" radius={[6, 6, 0, 0]}>
                                            {barData.map((entry, index) => (
                                                <Cell
                                                    key={`bar-${index}`}
                                                    fill={entry.isCurrent ? COLORS.green : COLORS.orangeLight}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex justify-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.green }} />
                                    <span className="text-[10px] text-gray-500 font-medium">Kelas Anda</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.orangeLight }} />
                                    <span className="text-[10px] text-gray-500 font-medium">Kelas Lain</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {lateItems.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-800 mb-1">Daftar Siswa Terlambat</p>
                            <p className="text-[10px] text-gray-400 mb-3">{lateItems.length} catatan keterlambatan ditemukan</p>

                            <div className="space-y-2">
                                {lateItems.map((item, i) => {
                                    const isNotStarted = item.status === 'Belum Mengerjakan';
                                    return (
                                        <div
                                            key={`${item.student_id}-${i}`}
                                            className="flex items-center gap-3 border border-gray-100 rounded-xl p-2.5"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                {item.student_name?.charAt(0) ?? '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{item.student_name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{item.task_title}</p>
                                                <p className="text-[9px] text-gray-400 mt-0.5">
                                                    Deadline: {item.deadline}
                                                    {item.submitted_at && ` • Dikumpulkan: ${item.submitted_at}`}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span
                                                    className={`inline-block text-[9px] font-bold px-2 py-1 rounded-full ${
                                                        isNotStarted
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-orange-50 text-orange-600'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                                <p className="text-[9px] text-gray-400 mt-1">{item.days_late} hari</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <TeacherBottomNav active="dashboard" />
        </AppLayout>
    );
}
