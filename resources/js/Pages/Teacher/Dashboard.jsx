import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';

function Stars({ count }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3].map((s) => (
                <svg key={s} viewBox="0 0 24 24" fill={s <= count ? '#F59E0B' : 'none'} stroke={s <= count ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ))}
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <button onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#1A6B3C]' : 'bg-gray-200'}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
        </button>
    );
}

export default function TeacherDashboard() {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [questions, setQuestions] = useState([
        { id: 1, title: 'Kasus Perhitungan PKP Perusahaan Manufaktur', topic: 'PPh Badan', stars: 2, released: true },
        { id: 2, title: 'Simulasi Pelaporan SPT Tahunan OP', topic: 'PPh OP', stars: 1, released: false },
        { id: 3, title: 'Analisis Kasus PPN Impor Barang Modal', topic: 'PPN & PPnBM', stars: 3, released: true },
        { id: 4, title: 'Skenario Penghasilan Tidak Teratur', topic: 'PPh Pasal 21', stars: 2, released: false },
    ]);

    const handleGenerate = () => {
        if (!topic || !difficulty) return;
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setGenerated(true);
            setQuestions((prev) => [{
                id: prev.length + 1,
                title: `Kasus ${topic} – Tingkat ${difficulty} (AI Generated)`,
                topic,
                stars: difficulty === 'Pemula' ? 1 : difficulty === 'Menengah' ? 2 : 3,
                released: false,
            }, ...prev]);
        }, 2200);
    };

    const toggleRelease = (id) => setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, released: !q.released } : q));

    const stats = [
        { label: 'Siswa Aktif', value: '142', icon: '👥', color: 'bg-blue-50 border-blue-100 text-blue-700' },
        { label: 'Rata-rata Selesai', value: '78%', icon: '✅', color: 'bg-green-50 border-green-100 text-green-700' },
        { label: 'Kelas Terbaik', value: '12-B', icon: '⭐', color: 'bg-amber-50 border-amber-100 text-amber-700' },
        { label: 'Butuh Bantuan', value: '6', icon: '🆘', color: 'bg-red-50 border-red-100 text-red-700' },
    ];

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto bg-[#F4F6F9] pb-20">
                <TeacherHeader teacherName="Mr. Davis" teacherRole="Guru Perpajakan" initials="D" isOnline />

                <div className="px-4 py-4 space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Selamat pagi, Mr. Davis! 👋</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Ini ringkasan kelas Anda hari ini.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        {stats.map((s) => (
                            <div key={s.label} className={`border rounded-2xl p-3.5 ${s.color}`}>
                                <div className="text-xl mb-1">{s.icon}</div>
                                <p className="text-xl font-black leading-none">{s.value}</p>
                                <p className="text-[10px] font-medium mt-1 opacity-70">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-red-100 rounded-2xl p-3.5 flex gap-3 shadow-sm">
                        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0 text-base">📢</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Pengumuman Penting</span>
                                <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Action Required</span>
                            </div>
                            <p className="text-xs font-semibold text-gray-800">Reminder: Deadline Pengumpulan SPT</p>
                            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                Kelas 10-A harus kumpulkan SPT simulasi sebelum Jumat 17:00. <strong>12 siswa</strong> masih pending.
                            </p>
                        </div>
                        <button className="shrink-0 self-start bg-[#1A6B3C] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap hover:bg-[#155C34] transition-colors">
                            Review →
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-sm">🤖</div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-xs">Generative AI Case Maker</h3>
                                <p className="text-[10px] text-gray-400">Buat soal kasus pajak otomatis dengan AI</p>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Topik Pajak</label>
                                <select value={topic} onChange={(e) => setTopic(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A6B3C]/30 focus:border-[#1A6B3C] bg-gray-50 text-gray-700">
                                    <option value="">— Pilih Topik —</option>
                                    <option>PPh Pasal 21 – Karyawan</option>
                                    <option>PPh Badan</option>
                                    <option>PPh OP</option>
                                    <option>PPN & PPnBM</option>
                                    <option>Bea Materai</option>
                                    <option>Pajak Daerah</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tingkat Kesulitan</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Pemula', 'Menengah', 'Lanjutan'].map((d) => (
                                        <button key={d} onClick={() => setDifficulty(d)}
                                            className={`py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${difficulty === d ? 'bg-[#1A6B3C] border-[#1A6B3C] text-white' : 'border-gray-200 text-gray-500 hover:border-[#1A6B3C]/40'}`}>
                                            {d === 'Pemula' ? '⭐ ' : d === 'Menengah' ? '⭐⭐ ' : '⭐⭐⭐ '}{d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleGenerate} disabled={!topic || !difficulty || generating}
                                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${topic && difficulty && !generating ? 'bg-[#1A6B3C] text-white shadow-lg shadow-green-900/20 hover:bg-[#155C34] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                {generating ? (
                                    <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg>Membuat Soal AI...</>
                                ) : (
                                    <><span>✨</span> Generate Kuis via AI</>
                                )}
                            </button>
                            {generated && !generating && (
                                <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-green-700">
                                    <span>🎉</span><span>Soal berhasil dibuat dan ditambahkan ke Question Bank!</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-800 text-xs">📚 Question Bank</h3>
                                <p className="text-[10px] text-gray-400">{questions.length} soal tersedia</p>
                            </div>
                            <span className="text-[10px] bg-[#F0F9F4] text-[#1A6B3C] font-semibold px-2.5 py-1 rounded-full border border-[#C8E8D6]">
                                {questions.filter((q) => q.released).length} Dirilis
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Judul Skenario</th>
                                        <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Level</th>
                                        <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Rilis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {questions.map((q, i) => (
                                        <tr key={q.id} className={`hover:bg-gray-50/60 transition-colors ${i === 0 && generated ? 'bg-green-50/40' : ''}`}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800 text-[11px] leading-snug">{q.title}</p>
                                                <p className="text-[9px] text-gray-400 mt-0.5">{q.topic}</p>
                                                {i === 0 && generated && <span className="text-[8px] bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block">AI Generated</span>}
                                            </td>
                                            <td className="px-3 py-3 text-center"><Stars count={q.stars} /></td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <Toggle checked={q.released} onChange={() => toggleRelease(q.id)} />
                                                    <span className={`text-[9px] font-semibold ${q.released ? 'text-[#1A6B3C]' : 'text-gray-400'}`}>{q.released ? 'Aktif' : 'Off'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-700 mb-2.5">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { icon: '📝', label: 'Kelola Tugas', href: '/teacher/maker' },
                                { icon: '📊', label: 'Analitik Kelas', href: '/teacher/analytics' },
                                { icon: '🏅', label: 'Award Badge', href: '/teacher/class' },
                                { icon: '⚙️', label: 'Pengaturan', href: '/teacher/class' },
                            ].map((a) => (
                                <Link key={a.label} href={a.href}
                                    className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#1A6B3C]/30 hover:shadow-sm transition-all group">
                                    <span className="text-xl group-hover:scale-110 transition-transform">{a.icon}</span>
                                    <span className="text-[10px] font-semibold text-gray-600 text-center">{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <TeacherBottomNav active="dashboard" />
        </AppLayout>
    );
}
