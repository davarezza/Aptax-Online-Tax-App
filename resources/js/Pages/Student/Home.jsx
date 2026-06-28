import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';
import AnswerModal from '@/Components/Student/AnswerModal';

const SCENE = {
    normal: {
        sky:      'from-[#7BC8C8] via-[#A8DDD4] to-[#B5E8BE]',
        ground:   'from-[#7EC87E] to-[#5FAD5F]',
        cloud:    ['bg-white/60', 'bg-white/40', 'bg-white/50'],
        tree:     ['bg-[#2D7A2D]', 'bg-[#3D8A3D]', 'bg-[#2D7A2D]'],
        building: 'from-[#B8D4E8] to-[#D0E8F4]',
        roof:     'bg-[#2A5F8A]',
        side:     'from-[#8AB0CC] to-[#A0C4DC]',
        base:     'bg-[#8AB0CC]',
        aptax:    'bg-[#1A6B3C]',
        book:     'bg-[#C8B89A]',
    },
    // Tugas sudah lewat deadline tapi belum dikerjakan → gedung "rusak"
    damaged: {
        sky:      'from-[#8B6060] via-[#9E7070] to-[#A88080]',
        ground:   'from-[#7A6A4A] to-[#5A4E36]',
        cloud:    ['bg-orange-900/20', 'bg-orange-900/15', 'bg-orange-900/18'],
        tree:     ['bg-[#5A4A2A]', 'bg-[#6A5A3A]', 'bg-[#4A3A1E]'],
        building: 'from-[#9A8A7A] to-[#B09A88]',
        roof:     'bg-[#6A4A3A]',
        side:     'from-[#8A7A6A] to-[#9A8A7A]',
        base:     'bg-[#7A6A5A]',
        aptax:    'bg-[#6A3A2A]',
        book:     'bg-[#9A8A7A]',
    },
    // Sudah dikerjakan ATAU tidak ada task → gedung abu-abu tenang
    done: {
        sky:      'from-[#9BA8A8] via-[#B8C2C0] to-[#C8D0CC]',
        ground:   'from-[#8A9E8A] to-[#6B826B]',
        cloud:    ['bg-white/30', 'bg-white/20', 'bg-white/25'],
        tree:     ['bg-[#5A6E5A]', 'bg-[#627062]', 'bg-[#5A6E5A]'],
        building: 'from-[#8A9EAA] to-[#9EAEB8]',
        roof:     'bg-[#5A7080]',
        side:     'from-[#7A90A0] to-[#8A9EAA]',
        base:     'bg-[#7A90A0]',
        aptax:    'bg-[#4A6060]',
        book:     'bg-[#8A8078]',
    },
};

function Building({ scene, showCracks, onClick, disabled }) {
    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={`relative group ${!disabled ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className={`relative transition-transform ${!disabled ? 'group-hover:scale-105 group-active:scale-95' : ''} duration-200`}>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/15 rounded-full blur-md" />

                {/* Sampul buku */}
                <div className={`w-40 h-6 ${scene.book} rounded-sm mx-auto relative`}>
                    <div className="absolute inset-x-4 top-0 h-1 bg-white/20 rounded-sm" />
                </div>

                {/* Badan gedung */}
                <div className="relative mx-auto w-28">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-full h-8 bg-gradient-to-r ${scene.building} border-b border-white/20 relative`}>
                            <div className="absolute inset-x-3 inset-y-1.5 grid grid-cols-4 gap-1">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className={`rounded-sm ${i % 2 === 0 && j % 2 === 0 ? 'bg-amber-200/80' : 'bg-white/50'}`} />
                                ))}
                            </div>
                            {showCracks && i === 2 && (
                                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 112 32">
                                    <polyline points="30,0 38,12 28,20 40,32" stroke="#5A3020" strokeWidth="1.5" fill="none" />
                                    <polyline points="75,0 68,16 80,28" stroke="#5A3020" strokeWidth="1" fill="none" />
                                </svg>
                            )}
                        </div>
                    ))}

                    {/* Atap */}
                    <div className={`w-full h-5 ${scene.roof} rounded-t-sm relative`}>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-6 bg-black/30 rounded-full" />
                        {showCracks && <div className="absolute top-0 right-4 w-3 h-5 bg-black/20 skew-x-3" />}
                    </div>

                    {/* Sisi gedung */}
                    <div
                        className={`absolute top-0 -left-6 h-full w-6 bg-gradient-to-r ${scene.side}`}
                        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 90%, 0 10%)' }}
                    />
                </div>

                {/* Label APTAX */}
                <div className={`absolute top-[30%] left-1/2 -translate-x-1/2 ${scene.aptax} text-white text-[7px] font-black px-2 py-0.5 rounded tracking-widest z-10`}>
                    APTAX
                </div>

                {/* Alas */}
                <div className={`w-28 h-6 ${scene.base} mx-auto relative border-t border-white/20`}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-5 bg-black/20 rounded-t-sm" />
                </div>
            </div>
        </div>
    );
}

export default function StudentHome() {
    const { auth, latestTask, latestSubmission } = usePage().props;
    const user = auth?.user;

    const level      = user?.level || 1;
    const xp         = user?.total_exp || 0;
    const xpProgress = user?.xp_progress || 0;
    const xpForNext  = user?.xp_for_next || 50;

    const [quizOpen, setQuizOpen]       = useState(false);
    const [justSubmitted, setJustSubmitted] = useState(false);

    const isEmpty        = !latestTask;
    const isDone         = !!latestSubmission || justSubmitted;
    const isPastDeadline = latestTask?.is_past_deadline ?? false;

    // Gedung rusak hanya jika: ada task, lewat deadline, DAN belum dikerjakan
    const isShowDamaged  = !isEmpty && isPastDeadline && !isDone;
    // Gedung bisa diklik hanya jika: ada task dan belum selesai (boleh terlambat)
    const isClickable    = !isEmpty && !isDone;

    const sceneKey = isDone || isEmpty ? 'done' : isShowDamaged ? 'damaged' : 'normal';
    const scene    = SCENE[sceneKey];

    // Badge di atas gedung
    const badge = (() => {
        if (isEmpty)        return { text: 'Belum ada kuis 😴',    color: 'bg-gray-500/90' };
        if (isDone)         return { text: 'Kuis selesai ✅',       color: 'bg-gray-500/90' };
        if (isPastDeadline) return { text: 'Lewat deadline ⚠️ — XP 50% & -20 Poin', color: 'bg-orange-700/90' };
        return              { text: 'Kuis Baru! 📋',               color: 'bg-[#00C9A7] animate-bounce-slow' };
    })();

    const sublabel = (() => {
        if (isEmpty)        return 'Belum ada tugas baru rilis';
        if (isDone)         return 'Cek halaman Tugas untuk evaluasi';
        if (isPastDeadline) return 'Ketuk untuk kerjakan (penalti berlaku)';
        return              'Ketuk gedung untuk mulai kuis';
    })();

    return (
        <AppLayout>
            <StudentHeader />

            {/* XP Bar */}
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
                                {Math.min(((xpProgress / xpForNext) * 100), 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#1A6B3C] to-[#34C27A] rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((xpProgress / xpForNext) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="shrink-0 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 text-center">
                        <p className="text-[9px] text-amber-600 font-medium leading-none mb-0.5">Total XP</p>
                        <p className="text-sm font-black text-amber-700">{xp.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>

            {/* Scene */}
            <div className={`flex-1 relative overflow-hidden mx-3 mb-3 rounded-3xl bg-gradient-to-b ${scene.sky} transition-all duration-700`}>

                {/* Awan */}
                <div className={`absolute top-4 left-8 w-16 h-6 ${scene.cloud[0]} rounded-full blur-sm transition-all duration-700`} />
                <div className={`absolute top-7 left-14 w-10 h-4 ${scene.cloud[1]} rounded-full blur-sm transition-all duration-700`} />
                <div className={`absolute top-5 right-10 w-12 h-5 ${scene.cloud[2]} rounded-full blur-sm transition-all duration-700`} />

                {/* Tanah */}
                <div className={`absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-b ${scene.ground} rounded-t-[40px] transition-all duration-700`} />
                <div className="absolute bottom-0 left-0 right-0 h-2/3">
                    <div className="w-full h-px bg-white/10 absolute" style={{ top: '40%' }} />
                    <div className="h-full w-px bg-white/10 absolute" style={{ left: '50%' }} />
                </div>

                {/* Pohon */}
                <div className="absolute bottom-[38%] left-6">
                    <div className={`w-6 h-8 ${scene.tree[0]} rounded-full opacity-80 transition-all duration-700`} />
                    <div className="w-2 h-3 bg-[#5C3A1E] rounded-sm mx-auto" />
                </div>
                <div className="absolute bottom-[42%] right-8">
                    <div className={`w-5 h-7 ${scene.tree[1]} rounded-full opacity-80 transition-all duration-700`} />
                    <div className="w-2 h-2 bg-[#5C3A1E] rounded-sm mx-auto" />
                </div>
                <div className="absolute bottom-[35%] right-16">
                    <div className={`w-4 h-6 ${scene.tree[2]} rounded-full opacity-70 transition-all duration-700`} />
                    <div className="w-1.5 h-2 bg-[#5C3A1E] rounded-sm mx-auto" />
                </div>

                {/* Gedung + badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: '8%' }}>

                    {/* Badge */}
                    <div className={`${badge.color} text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg mb-3 max-w-[85%] text-center`}>
                        {badge.text}
                    </div>

                    <Building
                        scene={scene}
                        showCracks={isShowDamaged}
                        onClick={() => setQuizOpen(true)}
                        disabled={!isClickable}
                    />

                    <p className="text-[10px] text-center text-white/80 font-medium mt-3 drop-shadow">
                        {sublabel}
                    </p>
                </div>

                {/* Banner bawah saat sudah selesai */}
                {isDone && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-max max-w-[85%]">
                        <div className="bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-2 text-center">
                            <span>✅</span>
                            <span>Kuis terbaru sudah selesai — cek halaman Tugas</span>
                        </div>
                    </div>
                )}
            </div>

            <StudentBottomNav active="home" />

            {quizOpen && latestTask && !isDone && (
                <AnswerModal
                    task={latestTask}
                    routeName="student.task.submit"
                    onClose={() => setQuizOpen(false)}
                    onSubmitSuccess={() => {
                        setJustSubmitted(true);
                        setQuizOpen(false);
                    }}
                />
            )}

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
            `}</style>
        </AppLayout>
    );
}
