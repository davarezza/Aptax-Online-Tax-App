import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';
import QuizModal from '@/Components/Student/QuizModal';

export default function StudentHome() {
    const [quizOpen, setQuizOpen] = useState(false);
    const { auth, latestTask } = usePage().props;
    const user = auth?.user;

    const level = user?.level || 1;
    const xp = user?.total_xp || 0;
    const xpProgress = user?.xp_progress || 0;
    const xpForNext = user?.xp_for_next || 50;

    return (
        <AppLayout>
            <StudentHeader />
            <div className="px-4 pt-3 pb-2">
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-[#1A6B3C] flex items-center justify-center text-white text-xs font-black">
                            {level}
                        </div>
                        <span className="text-xs font-bold text-gray-700">Level {level}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400">{xpProgress} / {xpForNext} XP</span>
                            <span className="text-[10px] font-bold text-[#1A6B3C]">
                                {((xpProgress / xpForNext) * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#1A6B3C] to-[#34C27A] rounded-full transition-all duration-500"
                                style={{ width: `${(xpProgress / xpForNext) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="shrink-0 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 text-center">
                        <p className="text-[9px] text-amber-600 font-medium leading-none mb-0.5">Total XP</p>
                        <p className="text-sm font-black text-amber-700">{xp.toLocaleString('id-ID')}</p>
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
                    <button
                        onClick={() => latestTask && setQuizOpen(true)}
                        className={`relative group focus:outline-none transition-all ${!latestTask ? 'opacity-75 cursor-not-allowed' : ''}`}
                        aria-label={latestTask ? "Klik untuk mengerjakan kuis" : "Belum ada kuis tersedia"}
                        disabled={!latestTask}
                    >
                        {latestTask ? (
                            <>
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
                            </>
                        ) : (
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-500/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap z-10">
                                Kosong 😴
                            </div>
                        )}

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
                        <p className="text-[10px] text-center text-white/80 font-medium mt-2 drop-shadow">
                            {latestTask ? 'Ketuk gedung untuk mulai kuis' : 'Belum ada tugas baru rilis'}
                        </p>
                    </button>
                </div>
            </div>

            <StudentBottomNav active="home" />
            {quizOpen && latestTask && (
                <QuizModal task={latestTask} onClose={() => setQuizOpen(false)} />
            )}

            <style>{`
                @keyframes bounce-slow { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
            `}</style>
        </AppLayout>
    );
}
