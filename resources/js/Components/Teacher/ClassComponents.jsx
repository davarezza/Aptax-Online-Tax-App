import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export function fmtXp(n) {
    return Number(n).toLocaleString('id-ID');
}

const AVATAR_COLORS = [
    'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-violet-500', 'bg-rose-500', 'bg-indigo-500', 'bg-teal-500',
];

export function getColor(id) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

export function ProgressBar({ value }) {
    const color =
        value === 100 ? 'bg-emerald-500' :
        value >= 70   ? 'bg-[#1A6B3C]'  :
        value >= 50   ? 'bg-amber-400'   : 'bg-rose-400';
    return (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export function Avatar({ name, id, initials, size = 'md' }) {
    const sz  = { sm: 'w-9 h-9 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-lg' };
    const col = getColor(id);
    const label = initials ?? (name?.[0]?.toUpperCase() ?? '?');
    return (
        <div className={`${sz[size]} ${col} rounded-full flex items-center justify-center font-extrabold text-white shrink-0`}>
            {label}
        </div>
    );
}

export function ScoreBadge({ score }) {
    const color =
        score == null ? 'text-gray-400 bg-gray-100'     :
        score >= 90   ? 'text-emerald-600 bg-emerald-50' :
        score >= 70   ? 'text-blue-600 bg-blue-50'       :
                        'text-rose-600 bg-rose-50';
    return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${color}`}>
            {score != null ? `${score}` : 'Belum'}
        </span>
    );
}

export function StudentCard({ student, onClick }) {
    const isInactive = student.activityType === 'inactive';
    return (
        <button
            onClick={() => onClick(student)}
            className="w-full text-left bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-150"
        >
            <div className="flex items-center gap-3">
                <Avatar name={student.name} id={student.id} initials={student.initials} size="md" />
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
                    <span className={`text-base font-extrabold ${
                        student.progress === 100 ? 'text-emerald-500' :
                        student.progress >= 70   ? 'text-[#1A6B3C]'  :
                        student.progress >= 50   ? 'text-amber-500'   : 'text-rose-500'
                    }`}>
                        {student.progress}%
                    </span>
                </div>
            </div>
            <ProgressBar value={student.progress} />
        </button>
    );
}

// ─── Feedback / Chat Panel ────────────────────────────────────────────────────
// STRUKTUR KUNCI:
//   wrapper     → flex flex-col  (mengisi tinggi yg diberikan parent)
//   header      → shrink-0       (tidak ikut menyusut)
//   scroll-body → flex-1 min-h-0 overflow-y-auto   ← min-h-0 adalah kuncinya
//   footer      → shrink-0
//
// Tanpa `min-h-0` pada flex child, browser memberi height minimum = konten,
// sehingga overflow-y-auto tidak aktif dan panel tidak bisa di-scroll ke atas.
export function FeedbackPanel({ task, student, onBack }) {
    const [messages, setMessages] = useState(task.thread ?? []);
    const [input, setInput]       = useState('');
    const [sending, setSending]   = useState(false);
    const bottomRef               = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const send = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        try {
            const { data } = await axios.post(
                route('teacher.class.message', task.submission_id),
                { message: text }
            );
            setMessages(prev => [...prev, data]);
            setInput('');
        } catch (err) {
            console.error('Gagal kirim pesan:', err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">Evaluasi & Feedback</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{task.title}</p>
                </div>
                <ScoreBadge score={task.score} />
            </div>

            <div className="flex-1 min-h-0 overscroll-contain overflow-y-auto px-5 py-4 space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Koreksi AI</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {task.aiFeedback ?? 'Belum ada feedback AI.'}
                    </p>
                </div>

                {task.studentAnswer && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">JAWABAN SISWA</p>
                        <p className="text-xs text-gray-700 font-medium leading-relaxed">{task.studentAnswer}</p>
                    </div>
                )}

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
                        {messages.map((msg) => {
                            const isMe = msg.sender === 'guru';
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${isMe ? 'bg-[#1A6B3C]' : getColor(student.id)}`}>
                                        {msg.avatar}
                                    </div>
                                    <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {!isMe && (
                                            <span className="text-[10px] text-gray-400 mb-0.5 ml-1">{msg.name}</span>
                                        )}
                                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                            isMe
                                                ? 'bg-[#1A6B3C] text-white rounded-br-sm'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}>
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

            <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-1.5 border border-gray-200 focus-within:border-[#1A6B3C] transition-colors">
                    <textarea
                        rows={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tulis feedback ke siswa..."
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none py-1 max-h-24"
                        disabled={sending}
                    />
                    <button
                        onClick={send}
                        disabled={!input.trim() || sending}
                        className="w-8 h-8 rounded-xl bg-[#1A6B3C] flex items-center justify-center text-white disabled:opacity-40 shrink-0 transition-opacity active:scale-95"
                    >
                        {sending ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className="text-center text-[10px] text-gray-300 mt-1.5">
                    Thread ini hanya terlihat oleh kamu dan {student.name}
                </p>
            </div>
        </div>
    );
}

// ─── Student Modal ────────────────────────────────────────────────────────────
// STRUKTUR KUNCI:
//   outer wrapper  → fixed inset-0 flex items-end
//   inner panel    → flex flex-col (TANPA overflow-hidden di sini!)
//                    max-h-[90vh]
//   header         → shrink-0
//   scroll zone    → flex-1 min-h-0 overflow-y-auto   ← sama seperti FeedbackPanel
// ─── Student Modal (FIXED SCROLL) ─────────────────────────────────────────────
export function StudentModal({ student: initialStudent, currentUserId, onClose }) {
    const [activeTask, setActiveTask] = useState(null);
    const [student, setStudent]       = useState(null);
    const [loading, setLoading]       = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(route('teacher.class.student', initialStudent.id))
            .then(({ data }) => setStudent(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [initialStudent.id]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm overflow-hidden"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-md rounded-t-3xl h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20 flex-1">
                        <svg className="w-7 h-7 animate-spin text-[#1A6B3C]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    </div>
                ) : activeTask ? (
                    <div className="flex-1 min-h-0 h-full overflow-hidden">
                        <FeedbackPanel
                            task={activeTask}
                            student={student}
                            currentUserId={currentUserId}
                            onBack={() => setActiveTask(null)}
                        />
                    </div>
                ) : (
                    <>
                        <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0 bg-white">
                            <div className="flex items-start gap-4">
                                <Avatar name={student.name} id={student.id} initials={student.initials} size="lg" />
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-extrabold text-gray-900 text-lg leading-tight">{student.name}</h2>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-xl">
                                            Level {student.level}
                                        </span>
                                        <span className="text-xs font-bold text-indigo-600">
                                            {fmtXp(student.xp)} XP
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {(() => {
                                const done  = student.tasks.filter(t => t.done).length;
                                const total = student.tasks.length;
                                const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
                                return (
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold text-gray-500">Progress Keseluruhan</span>
                                            <span className="text-xs font-bold text-[#1A6B3C]">{pct}%</span>
                                        </div>
                                        <ProgressBar value={pct} />
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 bg-white">
                            {student.tasks.filter(t => t.done).length > 0 && (
                                <>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                                        Soal yang Sudah Dikerjakan
                                    </p>
                                    <div className="space-y-3">
                                        {student.tasks.filter(t => t.done).map(task => (
                                            <div key={task.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
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
                                                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:opacity-90 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    Buka Evaluasi &amp; Feedback
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {student.tasks.filter(t => !t.done).length > 0 && (
                                <>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-5 mb-3">
                                        Belum Dikerjakan
                                    </p>
                                    <div className="space-y-2">
                                        {student.tasks.filter(t => !t.done).map(task => (
                                            <div
                                                key={task.id}
                                                className="bg-gray-50 rounded-2xl px-4 py-3 border border-dashed border-gray-200 flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="text-sm font-bold text-gray-500">{task.title}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{task.tax_topic}</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg shrink-0 ml-2">
                                                    Pending
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {student.tasks.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-2">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">Belum Ada Tugas Dirilis</p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-[240px] leading-relaxed">
                                        Belum ada soal yang dirilis untuk kelas ini.
                                    </p>
                                </div>
                            )}
                            <div className="h-4" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
