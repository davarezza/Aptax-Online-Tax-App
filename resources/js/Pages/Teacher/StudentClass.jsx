import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';

// ── DATA ──────────────────────────────────────────────────────────────────────

const STUDENTS = [
    {
        id: 1,
        name: 'Budi Santoso',
        initials: 'BS',
        color: 'bg-sky-500',
        lastActivity: 'Menyelesaikan Kuis PPN',
        activityType: 'done',
        progress: 85,
        level: 10,
        xp: 9800,
        tasks: [
            {
                id: 't1', title: 'Introduction to PPh 21', score: 85,
                aiFeedback: 'Secara keseluruhan jawaban sudah baik. Namun perhitungan PTKP untuk status K/1 pada soal nomor 3 masih keliru. Pastikan menggunakan tarif PTKP terbaru sesuai PMK yang berlaku.',
                thread: [
                    { id: 1, sender: 'guru', name: 'Mr. Davis', avatar: 'D', message: 'Perhitungan PPh Pasal 21 bagian PTKP kamu kurang teliti, coba cek lagi status PTKP K/1 ya.', time: '09:15' },
                    { id: 2, sender: 'siswa', name: 'Budi', avatar: 'BS', message: 'Siap Pak, saya akan pelajari lagi bagian PTKP-nya.', time: '10:02' },
                ],
            },
            {
                id: 't2', title: 'VAT (PPN) Fundamentals', score: 78,
                aiFeedback: 'Pemahaman konsep dasar PPN sudah tepat. Kelemahan terdeteksi pada soal penentuan Barang Kena Pajak (BKP) vs Non-BKP. Disarankan mengulas kembali Pasal 4A UU PPN.',
                thread: [
                    { id: 1, sender: 'guru', name: 'Mr. Davis', avatar: 'D', message: 'Untuk bagian Non-BKP, kamu masih ragu-ragu. Coba baca lagi pasal 4A ya Bud.', time: '14:30' },
                ],
            },
            {
                id: 't3', title: 'Filing Deadlines Challenge', score: 92,
                aiFeedback: 'Performa sangat memuaskan! Hampir semua deadline pelaporan dijawab dengan benar. Satu kesalahan minor pada deadline SPT Tahunan Badan — ingat batas waktunya adalah akhir April.',
                thread: [],
            },
        ],
    },
    {
        id: 2,
        name: 'Siti Aminah',
        initials: 'SA',
        color: 'bg-emerald-500',
        lastActivity: 'Menyelesaikan Modul Dasar Pajak',
        activityType: 'done',
        progress: 100,
        level: 14,
        xp: 13200,
        tasks: [
            {
                id: 't1', title: 'Introduction to PPh 21', score: 98,
                aiFeedback: 'Jawaban sempurna! Semua komponen perhitungan PPh 21 dijawab dengan benar dan teliti. Pertahankan performa ini.',
                thread: [
                    { id: 1, sender: 'guru', name: 'Mr. Davis', avatar: 'D', message: 'Luar biasa Siti, score tertinggi di kelas! Tetap semangat ya.', time: '08:00' },
                    { id: 2, sender: 'siswa', name: 'Siti', avatar: 'SA', message: 'Terima kasih Pak! Saya akan terus belajar.', time: '08:15' },
                ],
            },
            {
                id: 't2', title: 'VAT (PPN) Fundamentals', score: 95,
                aiFeedback: 'Penguasaan materi PPN sangat baik. Seluruh konsep BKP, Non-BKP, dan mekanisme pengkreditan Pajak Masukan dijawab dengan tepat.',
                thread: [],
            },
            {
                id: 't3', title: 'Dasar-Dasar Perpajakan', score: 100,
                aiFeedback: 'Nilai sempurna! Semua konsep dasar perpajakan Indonesia dikuasai dengan sangat baik.',
                thread: [],
            },
        ],
    },
    {
        id: 3,
        name: 'Agus Pratama',
        initials: 'AP',
        color: 'bg-amber-500',
        lastActivity: 'Terakhir aktif 2 hari lalu',
        activityType: 'inactive',
        progress: 45,
        level: 7,
        xp: 5400,
        tasks: [
            {
                id: 't1', title: 'Introduction to PPh 21', score: 60,
                aiFeedback: 'Masih banyak konsep yang perlu diperkuat. Terutama pada bagian perhitungan penghasilan neto dan penerapan tarif progresif. Disarankan mengulang materi dari awal.',
                thread: [
                    { id: 1, sender: 'guru', name: 'Mr. Davis', avatar: 'D', message: 'Agus, kamu perlu lebih banyak latihan soal. Coba kerjakan soal latihan di modul 2 dulu ya.', time: '16:00' },
                ],
            },
            {
                id: 't2', title: 'Dasar-Dasar Perpajakan', score: 55,
                aiFeedback: 'Pemahaman dasar tentang sistem perpajakan Indonesia masih lemah. Fokus pada perbedaan antara pajak pusat dan pajak daerah, serta fungsi pajak secara umum.',
                thread: [],
            },
        ],
    },
    {
        id: 4,
        name: 'Dewi Lestari',
        initials: 'DL',
        color: 'bg-violet-500',
        lastActivity: 'Selesai membaca materi PPh 21',
        activityType: 'done',
        progress: 60,
        level: 9,
        xp: 7600,
        tasks: [
            {
                id: 't1', title: 'Introduction to PPh 21', score: 72,
                aiFeedback: 'Pemahaman cukup baik namun masih ada kesalahan pada perhitungan PPh 21 untuk pegawai tidak tetap. Cermati perbedaan metode gross dan gross-up.',
                thread: [
                    { id: 1, sender: 'guru', name: 'Mr. Davis', avatar: 'D', message: 'Dewi, bagian pegawai tidak tetap masih keliru. Pelajari perbedaan gross vs gross-up method ya.', time: '11:30' },
                    { id: 2, sender: 'siswa', name: 'Dewi', avatar: 'DL', message: 'Baik Pak, saya akan pelajari lagi perbedaannya.', time: '13:00' },
                    { id: 3, sender: 'guru', name: 'Mr. Davis', avatar: 'D', message: 'Bagus, kalau ada yang kurang jelas langsung tanya ya.', time: '13:05' },
                ],
            },
            {
                id: 't2', title: 'Filing Deadlines Challenge', score: 68,
                aiFeedback: 'Penguasaan deadline masih perlu ditingkatkan. Beberapa deadline SPT Masa masih tertukar antara tanggal pelaporan dan tanggal penyetoran.',
                thread: [],
            },
        ],
    },
    {
        id: 5,
        name: 'Rendra Kusuma',
        initials: 'RK',
        color: 'bg-rose-500',
        lastActivity: 'Menyelesaikan Kuis PPh 23',
        activityType: 'done',
        progress: 72,
        level: 8,
        xp: 6900,
        tasks: [
            {
                id: 't1', title: 'PPh 23 Withholding', score: 80,
                aiFeedback: 'Pemahaman tentang mekanisme pemotongan PPh 23 sudah cukup baik. Namun masih ada kekeliruan pada penentuan tarif untuk jasa tertentu. Pastikan merujuk pada PMK terbaru.',
                thread: [],
            },
            {
                id: 't2', title: 'Introduction to PPh 21', score: 74,
                aiFeedback: 'Performa di atas rata-rata kelas. Kelemahan utama ada pada soal perhitungan PPh 21 untuk penghasilan tidak teratur.',
                thread: [
                    { id: 1, sender: 'guru', name: 'Mr. Davis', avatar: 'D', message: 'Rendra, secara umum bagus! Tapi perlu perhatikan lagi penghasilan tidak teratur ya.', time: '15:20' },
                ],
            },
        ],
    },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function fmtXp(n) { return n.toLocaleString('id-ID'); }

function ProgressBar({ value }) {
    const color = value === 100 ? 'bg-emerald-500' : value >= 70 ? 'bg-[#1A6B3C]' : value >= 50 ? 'bg-amber-400' : 'bg-rose-400';
    return (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
        </div>
    );
}

function Avatar({ student, size = 'md' }) {
    const sz = { sm: 'w-9 h-9 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-lg' };
    return (
        <div className={`${sz[size]} ${student.color} rounded-full flex items-center justify-center font-extrabold text-white shrink-0`}>
            {student.initials}
        </div>
    );
}

function ScoreBadge({ score }) {
    const color = score >= 90 ? 'text-emerald-600 bg-emerald-50' : score >= 70 ? 'text-blue-600 bg-blue-50' : 'text-rose-600 bg-rose-50';
    return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${color}`}>{score}%</span>
    );
}

// ── FEEDBACK SUB-PANEL ────────────────────────────────────────────────────────

function FeedbackPanel({ task, student, onBack }) {
    const [messages, setMessages] = useState(task.thread);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = () => {
        const text = input.trim();
        if (!text) return;
        setMessages(prev => [...prev, {
            id: Date.now(), sender: 'guru', name: 'Mr. Davis', avatar: 'D',
            message: text,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        }]);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Sub-panel header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
                <button onClick={onBack} className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">Evaluasi & Feedback</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{task.title}</p>
                </div>
                <ScoreBadge score={task.score} />
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* AI Feedback */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Koreksi AI</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{task.aiFeedback}</p>
                </div>

                {/* Chat thread */}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                        Thread Feedback — {student.name}
                    </p>
                    {messages.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">
                            Belum ada pesan. Mulai berikan feedback di bawah.
                        </p>
                    )}
                    <div className="space-y-3">
                        {messages.map(msg => {
                            const isMe = msg.sender === 'guru';
                            return (
                                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${isMe ? 'bg-[#1A6B3C]' : student.color}`}>
                                        {msg.avatar}
                                    </div>
                                    <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {!isMe && <span className="text-[10px] text-gray-400 mb-0.5 ml-1">{msg.name}</span>}
                                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-[#1A6B3C] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                            {msg.message}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-0.5 mx-1">{msg.time}</span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>
                </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-1.5 border border-gray-200 focus-within:border-[#1A6B3C] transition-colors">
                    <textarea
                        rows={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Tulis feedback ke siswa..."
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none py-1 max-h-24"
                    />
                    <button onClick={send} disabled={!input.trim()}
                        className="w-8 h-8 rounded-xl bg-[#1A6B3C] flex items-center justify-center text-white disabled:opacity-40 shrink-0 transition-opacity">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
                <p className="text-center text-[10px] text-gray-300 mt-1.5">Thread ini hanya terlihat oleh kamu dan {student.name}</p>
            </div>
        </div>
    );
}

// ── STUDENT DETAIL MODAL ──────────────────────────────────────────────────────

function StudentModal({ student, onClose }) {
    const [activeTask, setActiveTask] = useState(null);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {activeTask ? (
                    <FeedbackPanel task={activeTask} student={student} onBack={() => setActiveTask(null)} />
                ) : (
                    <>
                        {/* Modal header */}
                        <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
                            <div className="flex items-start gap-4">
                                <Avatar student={student} size="lg" />
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-extrabold text-gray-900 text-lg leading-tight">{student.name}</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Tax Accounting 101</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-xl">
                                            Level {student.level}
                                        </span>
                                        <span className="text-xs font-bold text-indigo-600">
                                            {fmtXp(student.xp)} XP
                                        </span>
                                    </div>
                                </div>
                                <button onClick={onClose}
                                    className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Overall progress */}
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-semibold text-gray-500">Progress Keseluruhan</span>
                                    <span className="text-xs font-bold text-[#1A6B3C]">{student.progress}%</span>
                                </div>
                                <ProgressBar value={student.progress} />
                            </div>
                        </div>

                        {/* Task list */}
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                                Soal yang Sudah Dikerjakan
                            </p>
                            <div className="space-y-3">
                                {student.tasks.map(task => (
                                    <div key={task.id}
                                        className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-800 leading-tight">{task.title}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-[10px] text-gray-400 font-medium">Sudah dikerjakan</span>
                                                </div>
                                            </div>
                                            <ScoreBadge score={task.score} />
                                        </div>
                                        <button
                                            onClick={() => setActiveTask(task)}
                                            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:opacity-90 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Buka Evaluasi & Feedback
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── STUDENT CARD ──────────────────────────────────────────────────────────────

function StudentCard({ student, onClick }) {
    const isInactive = student.activityType === 'inactive';
    return (
        <button onClick={() => onClick(student)}
            className="w-full text-left bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-150">
            <div className="flex items-center gap-3">
                <Avatar student={student} size="md" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        {isInactive ? (
                            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <p className={`text-xs truncate ${isInactive ? 'text-amber-600 font-semibold' : 'text-gray-500'}`}>
                            {student.lastActivity}
                        </p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <span className={`text-base font-extrabold ${student.progress === 100 ? 'text-emerald-500' : student.progress >= 70 ? 'text-[#1A6B3C]' : student.progress >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {student.progress}%
                    </span>
                </div>
            </div>
            <ProgressBar value={student.progress} />
        </button>
    );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function TeacherClass() {
    const [search, setSearch]     = useState('');
    const [filterOpen, setFilter] = useState(false);
    const [sortBy, setSortBy]     = useState('name');    // 'name' | 'progress' | 'xp'
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

                {/* Page title */}
                <div className="px-4 mb-4">
                    <h1 className="text-2xl font-extrabold text-gray-900">Daftar Siswa & Log Aktivitas</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Pantau progres dan aktivitas kelas Anda secara real-time.</p>
                </div>

                {/* Class summary strip */}
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

                {/* Search + filter */}
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
                            <button onClick={() => setSearch('')}
                                className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Sort/filter button */}
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

                {/* Student list */}
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

            {/* Student Detail Modal */}
            {selected && (
                <StudentModal student={selected} onClose={() => setSelected(null)} />
            )}

            <TeacherBottomNav active="class" />
        </AppLayout>
    );
}
