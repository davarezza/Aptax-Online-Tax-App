import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import TaxCalculator from '@/Components/Student/TaxCalculator';

export default function QuizModal({ task, onClose }) {
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [calcOpen, setCalcOpen] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const submittedAnswerRef = useRef(''); // ← simpan answer asli saat submit
    const hasSubmitted = !!quizResult;

    const handleInputChange = (val) => {
        const cleanNum = val.replace(/\D/g, '');
        setAnswer(cleanNum ? parseInt(cleanNum).toLocaleString('id-ID') : '');
    };

    const handleSubmit = () => {
        if (!answer || isSubmitting) return;
        setIsSubmitting(true);
        submittedAnswerRef.current = answer; // ← catat answer sebelum di-reset

        router.post(route('student.task.submit'), {
            task_id: task.id,
            submitted_answer: answer
        }, {
            onSuccess: (page) => {
                // Baca langsung dari page yang baru datang, bukan dari shared props
                const flash = page.props.flash;
                if (flash) {
                    setQuizResult({
                        isCorrect: flash.isCorrect,
                        xpChange: flash.xpChange,
                        correctAnswer: flash.correctAnswer,
                        submittedAnswer: submittedAnswerRef.current, // ← pakai ref, bukan state
                    });
                }
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleClose = () => {
        setAnswer('');
        setQuizResult(null);
        submittedAnswerRef.current = '';
        onClose();
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
                            <span className="text-[10px] font-bold tracking-widest text-[#1A6B3C] uppercase block">
                                📋 Kuis Isian {task.tax_topic}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {task.title} · <span className="capitalize">Difficulty: {task.difficulty}</span>
                            </p>
                        </div>
                        <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                            ✕
                        </button>
                    </div>

                    <div className="bg-[#F0F9F4] border border-[#C8E8D6] rounded-2xl p-4 mb-4">
                        <p className="text-[11px] font-semibold text-[#1A6B3C] mb-1.5">📌 Skenario Kasus</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                    </div>

                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wide">
                            Input Jawaban Anda (Rupiah)
                        </label>
                        <div className="relative flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 focus-within:border-[#1A6B3C] focus-within:bg-white transition-all px-3.5 py-3">
                            <span className="text-sm font-bold text-gray-400 mr-1 shrink-0">Rp</span>
                            <input
                                type="text"
                                value={answer}
                                disabled={hasSubmitted || isSubmitting}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Masukkan nominal angka saja..."
                                className="w-full bg-transparent text-sm font-bold text-gray-800 outline-none placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {hasSubmitted && (
                        <div className={`rounded-2xl p-4 mb-5 text-center ${quizResult.isCorrect ? 'bg-[#F0F9F4] border border-[#C8E8D6]' : 'bg-red-50 border border-red-200'}`}>
                            {quizResult.isCorrect ? (
                                <>
                                    <p className="text-2xl mb-1">🎉</p>
                                    <p className="font-bold text-[#1A6B3C]">Jawaban Tepat!</p>
                                    <p className="text-xs text-gray-500 mt-1">Jawaban Anda sinkron dengan perhitungan sistem perpajakan.</p>
                                    <p className="text-xs font-bold text-[#1A6B3C] mt-2">+{quizResult.xpChange} XP berhasil ditambahkan! 🏆</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl mb-1">😔</p>
                                    <p className="font-bold text-red-500">Jawaban Kurang Tepat</p>
                                    {/* Pakai submittedAnswer dari quizResult, bukan dari state answer */}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Jawaban Anda: Rp {parseInt(quizResult.submittedAnswer.replace(/\D/g, '') || 0).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-red-700 font-bold mt-2">{quizResult.xpChange} XP (Penalti 20%) diterapkan 📉</p>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCalcOpen(true)}
                            className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-lg shadow-sm hover:bg-amber-100 active:scale-95 transition-all shrink-0"
                            title="Buka kalkulator pajak"
                        >
                            🧮
                        </button>

                        {!hasSubmitted ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!answer || isSubmitting}
                                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all ${answer && !isSubmitting ? 'bg-[#1A6B3C] text-white shadow-lg active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                {isSubmitting ? 'Memeriksa...' : 'Kirim Jawaban'}
                            </button>
                        ) : (
                            <button onClick={handleClose} className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-[#1A6B3C] text-white shadow-lg active:scale-95">
                                Selesai & Tutup
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <TaxCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
        </div>
    );
}
