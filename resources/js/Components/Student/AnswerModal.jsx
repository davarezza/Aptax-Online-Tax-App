import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AnswerModal({
    task,
    routeName      = 'student.task.submit',
    routeParams    = undefined,
    payloadBuilder = null,
    onClose,
    onSubmitSuccess,
}) {
    const [rawAnswer, setRawAnswer]       = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizResult, setQuizResult]     = useState(null);
    const hasSubmitted                    = !!quizResult;

    const isPastDeadline = task?.is_past_deadline ?? false;

    const effectiveXpReward = isPastDeadline
        ? (task?.xp_reward_late ?? Math.round((task?.xp_reward ?? 0) * 0.5))
        : (task?.xp_reward ?? 0);

    const formatRupiah = (value) => {
        if (!value) return '';
        const numberString = value.toString().replace(/[^0-9]/g, '');
        const split = numberString.split('');
        let sisa = split.length % 3;
        let rupiah = split.slice(0, sisa).join('');
        let ribuan = split.slice(sisa).join('').match(/\d{3}/gi);

        if (ribuan) {
            let separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }
        return `Rp ${rupiah}`;
    };

    const handleInputChange = (e) => {
        const cleanValue = e.target.value.replace(/[^0-9]/g, '');
        setRawAnswer(cleanValue);
    };

    const handleSubmit = () => {
        if (!rawAnswer || isSubmitting) return;
        setIsSubmitting(true);

        const payload = payloadBuilder
            ? payloadBuilder(rawAnswer)
            : { task_id: task.id, student_answer: rawAnswer };

        const url = routeParams !== undefined
            ? route(routeName, routeParams)
            : route(routeName);

        router.post(url, payload, {
            preserveState: true,
            onSuccess: (page) => {
                const flash = page.props.flash;
                if (flash?.aiScore !== undefined) {
                    setQuizResult({
                        aiScore:         flash.aiScore,
                        xpEarned:        flash.xpChange ?? 0,
                        pointPenalty:    flash.pointPenalty ?? 0,
                        isPastDeadline:  flash.isPastDeadline ?? false,
                    });
                    onSubmitSuccess?.({
                        aiScore:         flash.aiScore,
                        xpEarned:        flash.xpChange ?? 0,
                        pointPenalty:    flash.pointPenalty ?? 0,
                        isPastDeadline:  flash.isPastDeadline ?? false,
                    });
                } else {
                    handleClose();
                }
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleClose = () => {
        setRawAnswer('');
        setQuizResult(null);
        onClose();
    };

    const isGoodScore = (quizResult?.aiScore ?? 0) >= 70;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
                </div>

                <div className="px-5 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-[10px] font-bold tracking-widest text-[#1A6B3C] uppercase block">
                                📋 Kuis · {task.tax_topic}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {task.title} · <span className="capitalize">{task.difficulty}</span>
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {isPastDeadline && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2.5">
                            <span className="text-base shrink-0 mt-0.5">⚠️</span>
                            <div>
                                <p className="text-xs font-extrabold text-orange-700">Tugas Melewati Deadline</p>
                                <p className="text-[11px] text-orange-600 mt-0.5 leading-relaxed">
                                    Kamu masih bisa mengerjakan tugas ini, namun akan dikenakan:
                                </p>
                                <ul className="mt-1 space-y-0.5">
                                    <li className="text-[11px] font-bold text-orange-700">• XP berkurang 50% → maks. {effectiveXpReward} XP</li>
                                    <li className="text-[11px] font-bold text-orange-700">• Penalti -20 Poin</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#F0F9F4] border border-[#C8E8D6] rounded-2xl p-4 mb-4">
                        <p className="text-[11px] font-semibold text-[#1A6B3C] mb-1.5">📌 Skenario Kasus</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                            {isPastDeadline
                                ? `Maks. +${effectiveXpReward} XP (terlambat)`
                                : `Maks. +${task.xp_reward} XP`
                            }
                        </span>
                        {isPastDeadline && (
                            <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                                -20 Poin
                            </span>
                        )}
                    </div>

                    {/* FIELD INPUT RUPIAH */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wide">
                            Input Nominal Jawaban Anda
                        </label>
                        <div className={`bg-gray-50 rounded-xl border-2 transition-all px-3.5 py-3 flex items-center ${
                            hasSubmitted
                                ? 'border-gray-100 bg-gray-50/60'
                                : isPastDeadline
                                ? 'border-orange-200 focus-within:border-orange-400 focus-within:bg-white'
                                : 'border-gray-200 focus-within:border-[#1A6B3C] focus-within:bg-white'
                        }`}>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formatRupiah(rawAnswer)}
                                disabled={hasSubmitted || isSubmitting}
                                onChange={handleInputChange}
                                placeholder="Rp 0"
                                className="w-full bg-transparent text-base font-bold text-gray-800 outline-none placeholder-gray-400"
                            />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                            *Masukkan angka nominal hasil akhir perhitungan Anda.
                        </span>
                    </div>

                    {hasSubmitted && (
                        <div className={`rounded-2xl p-4 mb-5 ${
                            isGoodScore
                                ? 'bg-[#F0F9F4] border border-[#C8E8D6]'
                                : 'bg-red-50 border border-red-200'
                        }`}>
                            <div className="text-center">
                                <p className="text-2xl mb-1">{isGoodScore ? '🎉' : '😔'}</p>
                                <p className={`font-bold ${isGoodScore ? 'text-[#1A6B3C]' : 'text-red-500'}`}>
                                    {isGoodScore ? 'Jawaban Sangat Baik!' : 'Jawaban Kurang Tepat'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tingkat akurasi: <span className={`font-bold ${isGoodScore ? 'text-[#1A6B3C]' : 'text-red-500'}`}>
                                        {quizResult.aiScore}%
                                    </span>
                                </p>
                                <p className={`text-xs font-bold mt-1.5 ${isGoodScore ? 'text-[#1A6B3C]' : 'text-red-700'}`}>
                                    +{quizResult.xpEarned} XP diperoleh
                                    {quizResult.isPastDeadline && ' (sudah dipotong 50%)'}
                                </p>
                            </div>

                            {quizResult.isPastDeadline && (
                                <div className="mt-3 pt-3 border-t border-orange-100">
                                    <p className="text-[11px] font-extrabold text-orange-600 text-center mb-1.5">
                                        ⚠️ Penalti Keterlambatan Diterapkan
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <span className="text-[11px] bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded-lg">
                                            XP ×50%
                                        </span>
                                        <span className="text-[11px] bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-lg">
                                            -{quizResult.pointPenalty} Poin
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2">
                        {!hasSubmitted ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!rawAnswer || isSubmitting}
                                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                                    rawAnswer && !isSubmitting
                                        ? isPastDeadline
                                            ? 'bg-orange-600 text-white shadow-lg active:scale-95'
                                            : 'bg-[#1A6B3C] text-white shadow-lg active:scale-95'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting
                                    ? 'Memeriksa...'
                                    : isPastDeadline
                                    ? 'Kumpulkan (Terlambat)'
                                    : 'Kirim Jawaban'
                                }
                            </button>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-[#1A6B3C] text-white shadow-lg active:scale-95 transition-all"
                            >
                                Selesai &amp; Tutup
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
