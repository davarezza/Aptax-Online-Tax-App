import { useState } from 'react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';

function QuizModal({ onClose }) {
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const question = {
        scenario:
            'PT Maju Bersama menerima penghasilan bruto Rp 500.000.000 pada tahun pajak 2024 dengan total biaya operasional Rp 320.000.000. Berdasarkan UU PPh, berapakah Penghasilan Kena Pajak (PKP) perusahaan tersebut?',
        options: [
            { id: 'a', label: 'A', text: 'Rp 820.000.000' },
            { id: 'b', label: 'B', text: 'Rp 180.000.000' },
            { id: 'c', label: 'C', text: 'Rp 500.000.000' },
            { id: 'd', label: 'D', text: 'Rp 320.000.000' },
        ],
        correct: 'b',
    };

    const handleSubmit = () => {
        if (!selected) return;
        setSubmitted(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
                </div>
                <div className="px-5 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-[10px] font-bold tracking-widest text-[#1A6B3C] uppercase">
                                📋 Kuis Pajak Penghasilan
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">PT Maju Bersama · Difficulty: Intermediate</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                            ✕
                        </button>
                    </div>
                    <div className="bg-[#F0F9F4] border border-[#C8E8D6] rounded-2xl p-4 mb-5">
                        <p className="text-[11px] font-semibold text-[#1A6B3C] mb-1.5">📌 Skenario Kasus</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{question.scenario}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Pilih Jawaban</p>
                    <div className="space-y-2.5 mb-6">
                        {question.options.map((opt) => {
                            let style = 'border-gray-200 bg-white text-gray-700';
                            if (submitted) {
                                if (opt.id === question.correct) style = 'border-[#1A6B3C] bg-[#F0F9F4] text-[#1A6B3C] font-semibold';
                                else if (selected === opt.id) style = 'border-red-400 bg-red-50 text-red-600';
                                else style = 'border-gray-100 bg-gray-50 text-gray-400';
                            } else if (selected === opt.id) {
                                style = 'border-[#1A6B3C] bg-[#F0F9F4] text-[#1A6B3C]';
                            }
                            return (
                                <button key={opt.id} disabled={submitted} onClick={() => setSelected(opt.id)}
                                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${style}`}>
                                    <span className="w-7 h-7 rounded-lg bg-current/10 flex items-center justify-center text-xs font-bold shrink-0">{opt.label}</span>
                                    <span className="text-sm">{opt.text}</span>
                                </button>
                            );
                        })}
                    </div>
                    {submitted && (
                        <div className={`rounded-2xl p-4 mb-4 text-center ${selected === question.correct ? 'bg-[#F0F9F4] border border-[#C8E8D6]' : 'bg-red-50 border border-red-200'}`}>
                            {selected === question.correct ? (
                                <>
                                    <p className="text-2xl mb-1">🎉</p>
                                    <p className="font-bold text-[#1A6B3C]">Jawaban Benar!</p>
                                    <p className="text-xs text-gray-500 mt-1">PKP = Rp 500jt − Rp 320jt = <strong>Rp 180.000.000</strong></p>
                                    <p className="text-xs font-bold text-[#1A6B3C] mt-2">+50 XP diperoleh! 🏆</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl mb-1">😔</p>
                                    <p className="font-bold text-red-500">Jawaban Kurang Tepat</p>
                                    <p className="text-xs text-gray-500 mt-1">Jawaban benar: B · Rp 180.000.000</p>
                                    <p className="text-xs text-gray-400 mt-2">Pelajari kembali modul PPh Badan yuk!</p>
                                </>
                            )}
                        </div>
                    )}
                    {!submitted ? (
                        <button onClick={handleSubmit} disabled={!selected}
                            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${selected ? 'bg-[#1A6B3C] text-white shadow-lg shadow-green-900/20 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                            Kirim Jawaban
                        </button>
                    ) : (
                        <button onClick={onClose} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-[#1A6B3C] text-white shadow-lg shadow-green-900/20 active:scale-95">
                            Selesai & Tutup
                        </button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.32,0.72,0,1) forwards; }
            `}</style>
        </div>
    );
}

export default function StudentHome() {
    const [quizOpen, setQuizOpen] = useState(false);
    const xp = 1450;
    const level = 12;
    const xpForNext = 300;
    const xpProgress = 210;

    return (
        <AppLayout>
            <StudentHeader notifCount={1} streakDays={3} userName="A" />
            <div className="px-4 pt-3 pb-2">
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-[#1A6B3C] flex items-center justify-center text-white text-xs font-black">{level}</div>
                        <span className="text-xs font-bold text-gray-700">Level {level}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400">{xpProgress} / {xpForNext} XP</span>
                            <span className="text-[10px] font-bold text-[#1A6B3C]">next level</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#1A6B3C] to-[#34C27A] rounded-full" style={{ width: `${(xpProgress / xpForNext) * 100}%` }} />
                        </div>
                    </div>
                    <div className="shrink-0 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 text-center">
                        <p className="text-[9px] text-amber-600 font-medium leading-none mb-0.5">Total XP</p>
                        <p className="text-sm font-black text-amber-700">{xp.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden mx-3 mb-3 rounded-3xl bg-gradient-to-b from-[#7BC8C8] via-[#A8DDD4] to-[#B5E8BE]">
                <div className="absolute top-4 left-8 w-16 h-6 bg-white/60 rounded-full blur-sm" />
                <div className="absolute top-7 left-14 w-10 h-4 bg-white/40 rounded-full blur-sm" />
                <div className="absolute top-5 right-10 w-12 h-5 bg-white/50 rounded-full blur-sm" />
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-b from-[#7EC87E] to-[#5FAD5F] rounded-t-[40px]" />
                <div className="absolute bottom-0 left-0 right-0 h-2/3">
                    <div className="w-full h-px bg-[#8CB88C]/60 absolute" style={{ top: '40%' }} />
                    <div className="h-full w-px bg-[#8CB88C]/60 absolute" style={{ left: '50%' }} />
                </div>
                <div className="absolute bottom-[38%] left-6"><div className="w-6 h-8 bg-[#2D7A2D] rounded-full opacity-80" /><div className="w-2 h-3 bg-[#5C3A1E] rounded-sm mx-auto" /></div>
                <div className="absolute bottom-[42%] right-8"><div className="w-5 h-7 bg-[#3D8A3D] rounded-full opacity-80" /><div className="w-2 h-2 bg-[#5C3A1E] rounded-sm mx-auto" /></div>
                <div className="absolute bottom-[35%] right-16"><div className="w-4 h-6 bg-[#2D7A2D] rounded-full opacity-70" /><div className="w-1.5 h-2 bg-[#5C3A1E] rounded-sm mx-auto" /></div>

                <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '8%' }}>
                    <button onClick={() => setQuizOpen(true)} className="relative group focus:outline-none" aria-label="Klik untuk mengerjakan kuis">
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#00C9A7] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap animate-bounce-slow z-10">
                            Kuis Baru! 📋
                        </div>
                        <div className="absolute -top-3 -right-3 z-10">
                            <div className="relative bg-white rounded-full p-1.5 shadow-md border border-gray-100">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2} className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">1</span>
                            </div>
                        </div>
                        <div className="relative transition-transform group-hover:scale-105 group-active:scale-95 duration-200">
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/15 rounded-full blur-md" />
                            <div className="w-40 h-6 bg-[#C8B89A] rounded-sm mx-auto relative"><div className="absolute inset-x-4 top-0 h-1 bg-[#D4C4A8] rounded-sm" /></div>
                            <div className="relative mx-auto w-28">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full h-8 bg-gradient-to-r from-[#B8D4E8] to-[#D0E8F4] border-b border-[#9EC0D8]/40 relative">
                                        <div className="absolute inset-x-3 inset-y-1.5 grid grid-cols-4 gap-1">
                                            {[...Array(4)].map((_, j) => (<div key={j} className={`rounded-sm ${i % 2 === 0 && j % 2 === 0 ? 'bg-amber-200/80' : 'bg-white/50'}`} />))}
                                        </div>
                                    </div>
                                ))}
                                <div className="w-full h-5 bg-[#2A5F8A] rounded-t-sm relative">
                                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-6 bg-[#1E4A6E] rounded-full" />
                                </div>
                                <div className="absolute top-0 -left-6 h-full w-6 bg-gradient-to-r from-[#8AB0CC] to-[#A0C4DC]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 90%, 0 10%)' }} />
                            </div>
                            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 bg-[#1A6B3C] text-white text-[7px] font-black px-2 py-0.5 rounded tracking-widest z-10">APTAX</div>
                            <div className="w-28 h-6 bg-[#8AB0CC] mx-auto relative border-t border-[#6894AE]">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-5 bg-[#5A7A9A] rounded-t-sm" />
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-white/80 font-medium mt-2 drop-shadow">Ketuk gedung untuk mulai kuis</p>
                    </button>
                </div>
            </div>

            <StudentBottomNav active="home" />
            {quizOpen && <QuizModal onClose={() => setQuizOpen(false)} />}

            <style>{`
                @keyframes bounce-slow { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
            `}</style>
        </AppLayout>
    );
}
