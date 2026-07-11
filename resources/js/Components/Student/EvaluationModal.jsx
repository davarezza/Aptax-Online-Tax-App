import { useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

function formatAsRupiah(value) {
    const trimmed = String(value ?? '').trim();
    if (trimmed !== '' && /^\d+$/.test(trimmed)) {
        return 'Rp ' + Number(trimmed).toLocaleString('id-ID');
    }
    return value;
}

function parseInline(text, keyPrefix) {
    const codeSegments = text.split(/(`[^`]+`)/g);

    return codeSegments.map((segment, segIdx) => {
        if (segment.startsWith('`') && segment.endsWith('`') && segment.length > 1) {
            return (
                <code
                    key={`${keyPrefix}-code-${segIdx}`}
                    className="inline-block bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold mx-0.5"
                >
                    {segment.slice(1, -1)}
                </code>
            );
        }

        const boldSegments = segment.split(/(\*[^*]+\*)/g);
        return boldSegments.map((part, partIdx) => {
            if (part.startsWith('*') && part.endsWith('*') && part.length > 1) {
                return (
                    <strong key={`${keyPrefix}-b-${segIdx}-${partIdx}`} className="font-extrabold text-slate-800">
                        {part.slice(1, -1)}
                    </strong>
                );
            }
            return <span key={`${keyPrefix}-t-${segIdx}-${partIdx}`}>{part}</span>;
        });
    });
}

function renderAiFeedback(rawText) {
    if (!rawText) return null;

    const lines = rawText.split('\n');

    return lines.map((line, idx) => {
        if (line.trim() === '') {
            return <div key={idx} className="h-2" />;
        }

        const isHeaderLine = /^[\p{Emoji_Presentation}\u2600-\u27BF]/u.test(line);
        const isBullet = /^\*\s+/.test(line);
        const isNoteLine = /^⚠️/.test(line);

        const content = isBullet ? line.replace(/^\*\s+/, '') : line;
        const parsed = parseInline(content, `line-${idx}`);

        if (isBullet) {
            return (
                <div key={idx} className="flex items-start gap-2 pl-0.5">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span className="text-xs text-slate-600 leading-relaxed">{parsed}</span>
                </div>
            );
        }

        if (isHeaderLine) {
            return (
                <p key={idx} className="text-sm font-black text-slate-800 leading-snug">
                    {parsed}
                </p>
            );
        }

        if (isNoteLine) {
            return (
                <p key={idx} className="text-[11px] text-orange-600 font-semibold leading-relaxed bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-2 mt-1">
                    {parsed}
                </p>
            );
        }

        return (
            <p key={idx} className="text-xs text-slate-600 leading-relaxed font-medium">
                {parsed}
            </p>
        );
    });
}

export default function EvaluationModal({ task, currentUser, onClose }) {
    const chatBottomRef = useRef(null);
    const chatForm      = useForm({ message: '' });

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [task.feedbacks.length]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatForm.data.message.trim()) return;

        chatForm.post(route('student.tasks.chat', task.submission_id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => chatForm.reset('message'),
        });
    };

    const scoreColor =
        task.ai_score >= 80
            ? 'text-emerald-600 bg-emerald-50'
            : task.ai_score >= 50
            ? 'text-amber-600 bg-amber-50'
            : 'text-red-600 bg-red-50';

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-t-3xl w-full max-w-md h-[88vh] flex flex-col shadow-2xl animate-slide-up">
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <span className="text-sm font-bold">✕</span>
                    </button>
                    <span className="text-[11px] font-extrabold tracking-wide text-indigo-600 uppercase block mb-0.5">
                        EVALUASI PRIVAT
                    </span>
                    <h3 className="text-lg font-black text-slate-800 pr-8 leading-tight">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-700">
                            {task.status}
                        </span>
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg ${scoreColor}`}>
                            Score: {task.ai_score}
                        </span>
                        <span className="text-[11px] font-extrabold text-amber-600">
                            +{task.xp_earned} XP
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
                    <div className="bg-[#F0F6FF] border border-[#E2EEFF] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px]">
                                🖎
                            </div>
                            <h4 className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                                AI FEEDBACK
                            </h4>
                        </div>
                        <div className="space-y-1.5">
                            {task.ai_feedback
                                ? renderAiFeedback(task.ai_feedback)
                                : <p className="text-xs text-slate-600 leading-relaxed font-medium">Feedback sedang diproses...</p>
                            }
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            JAWABAN KAMU
                        </p>
                        <p className="text-xs text-gray-700 font-bold">{formatAsRupiah(task.student_answer)}</p>
                    </div>

                    {/* Chat thread */}
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-1">
                        THREAD PRIVAT — SISWA &amp; GURU
                    </p>

                    <div className="space-y-3 pt-1">
                        {task.feedbacks.length === 0 && (
                            <p className="text-[11px] text-center text-gray-400 py-4">
                                Belum ada diskusi. Mulai tanyakan sesuatu kepada guru!
                            </p>
                        )}
                        {task.feedbacks.map((msg) => {
                            const isSelf = msg.sender_id === currentUser.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                                >
                                    {!isSelf && (
                                        <span className="text-[9px] text-gray-400 mb-0.5 px-1 font-semibold">
                                            {msg.name} · {msg.role === 'guru' ? 'Guru' : 'Siswa'}
                                        </span>
                                    )}
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                                        isSelf
                                            ? 'bg-[#1A6B3C] text-white rounded-tr-none'
                                            : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                                    }`}>
                                        <p>{msg.message}</p>
                                    </div>
                                    <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                                </div>
                            );
                        })}
                        <div ref={chatBottomRef} />
                    </div>
                </div>

                <form
                    onSubmit={handleSendMessage}
                    className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0"
                >
                    <input
                        type="text"
                        value={chatForm.data.message}
                        onChange={(e) => chatForm.setData('message', e.target.value)}
                        placeholder="Balas catatan privat ke guru..."
                        className="flex-1 bg-gray-50 border border-gray-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A6B3C] text-gray-800"
                        disabled={chatForm.processing}
                    />
                    <button
                        type="submit"
                        disabled={chatForm.processing || !chatForm.data.message.trim()}
                        className="bg-[#1A6B3C] text-white font-bold text-xs px-4 py-3 rounded-xl hover:bg-[#155430] active:scale-95 transition-all shadow-md disabled:opacity-50"
                    >
                        {chatForm.processing ? '...' : 'Kirim'}
                    </button>
                </form>
            </div>
        </div>
    );
}
