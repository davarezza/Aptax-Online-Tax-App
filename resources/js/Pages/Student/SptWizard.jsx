import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';

function formatRupiah(value) {
    const n = Number(value) || 0;
    return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function fillTemplate(text) {
    // Teks step sudah di-render lengkap di backend (nominal dsb sudah terisi),
    // jadi di sini cuma memastikan line-break tampil rapi lewat whitespace-pre-line.
    return text;
}

function formatAnswerDisplay(step, value) {
    if (step.type === 'confirm') return value === 'ya' ? 'Ya' : 'Tidak';
    if (step.type === 'number') return formatRupiah(value);
    return String(value ?? '');
}

function buildInitialState(steps, formData, detected) {
    const chatLog = [];
    let idx = 0;

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        chatLog.push({ from: 'system', text: fillTemplate(step.system) });

        if (step.id === 'welcome') {
            chatLog.push({ from: 'system-card', data: detected });
        }

        const ans = formData.answers?.[step.id];
        const isGraded = ['confirm', 'choice', 'number', 'verify_token'].includes(step.type);

        if (step.id === 'verifikasi' && formData.verification_token && !(ans && ans.correct)) {
            chatLog.push({ from: 'system', text: `Kode verifikasi kamu: ${formData.verification_token}` });
        }

        if (ans && ans.correct) {
            if (isGraded) chatLog.push({ from: 'student', text: formatAnswerDisplay(step, ans.value) });
            idx = i + 1;
        } else {
            break;
        }
    }

    return { chatLog, currentIndex: Math.min(idx, steps.length - 1) };
}

export default function SptWizard({ assignment, detected_data, steps_meta, form_data, is_completed, result: initialResult }) {
    const [chatLog, setChatLog] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [awaitingToken, setAwaitingToken] = useState(false);
    const [done, setDone] = useState(is_completed);
    const [result, setResult] = useState(initialResult);
    const bottomRef = useRef(null);

    const steps = steps_meta;
    const currentStep = steps[currentIndex];

    useEffect(() => {
        if (is_completed) return;
        const { chatLog: initialLog, currentIndex: initialIdx } = buildInitialState(steps, form_data, detected_data);
        setChatLog(initialLog);
        setCurrentIndex(initialIdx);

        const step = steps[initialIdx];
        if (step?.id === 'verifikasi' && !form_data.verification_token) {
            requestToken();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog, loading]);

    async function submitAnswer(stepId, value) {
        setLoading(true);
        try {
            const { data } = await axios.post(route('student.spt-simulation.answer', assignment.id), {
                step_id: stepId,
                value,
            });
            return data;
        } finally {
            setLoading(false);
        }
    }

    async function requestToken() {
        setAwaitingToken(true);
        const data = await submitAnswer('verifikasi', null);
        if (data.token) {
            setChatLog((log) => [...log, { from: 'system', text: `Kode verifikasi kamu: ${data.token}` }]);
        }
    }

    function pushNextStepMessage(nextIndex) {
        const next = steps[nextIndex];
        if (!next) return;
        setChatLog((log) => [...log, { from: 'system', text: fillTemplate(next.system) }]);
        if (next.id === 'verifikasi') {
            requestToken();
        }
    }

    async function handleAnswer(value, displayValue) {
        const data = await submitAnswer(currentStep.id, value);

        if (data.correct) {
            setChatLog((log) => [
                ...log,
                ...(displayValue !== null ? [{ from: 'student', text: displayValue }] : []),
                ...(data.poin_message ? [{ from: 'system-correct', text: data.poin_message }] : []),
            ]);

            if (data.done) {
                setDone(true);
                setResult(data.result);
                return;
            }

            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setInputValue('');
            pushNextStepMessage(nextIndex);
        } else {
            const wrongText = [data.poin_message, data.expected].filter(Boolean).join(' ');
            setChatLog((log) => [
                ...log,
                ...(displayValue !== null ? [{ from: 'student', text: displayValue }] : []),
                { from: 'system-wrong', text: wrongText },
            ]);
        }
    }

    if (done) {
        return <BpeResult assignment={assignment} result={result} />;
    }

    return (
        <AppLayout>
            <StudentHeader />
            <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
                <div className="px-4 py-3 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Link href={route('student.spt-simulation')} className="text-gray-400 text-lg leading-none -ml-1">←</Link>
                        <h2 className="text-sm font-bold text-gray-800 flex-1 truncate">{assignment.title}</h2>
                        <span className="bg-[#1A6B3C] text-white text-[9px] font-bold px-2 py-1 rounded-full shrink-0">
                            Langkah {currentStep?.langkah ?? 7}/7
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                            <div key={n} className={`h-1 flex-1 rounded-full ${n <= (currentStep?.langkah ?? 7) ? 'bg-[#1A6B3C]' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {chatLog.map((msg, i) => (
                        <ChatBubble key={i} msg={msg} />
                    ))}
                    {loading && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs pl-1">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="px-4 py-3 bg-white border-t border-gray-100">
                    <StepInput
                        step={currentStep}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        loading={loading}
                        onAnswer={handleAnswer}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

function ChatBubble({ msg }) {
    if (msg.from === 'system-card') {
        const d = msg.data;
        return (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-3.5 max-w-[85%]">
                <p className="text-[9px] font-bold text-[#1A6B3C] uppercase tracking-wide mb-2">📄 Data Terdeteksi Otomatis</p>
                <div className="space-y-1.5 text-xs">
                    <Row label="Nama WP" value={d.nama_wp} />
                    <Row label="NPWP (Simulasi)" value={d.npwp_simulasi} />
                    <Row label="Tahun Pajak" value={d.tahun_pajak} />
                    <Row label="Pemberi Kerja" value={d.pemberi_kerja} />
                    <Row label="Penghasilan Neto" value={formatRupiah(d.penghasilan_neto)} />
                </div>
            </div>
        );
    }

    if (msg.from === 'student') {
        return (
            <div className="flex justify-end">
                <div className="bg-[#1A6B3C] text-white text-xs font-semibold rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[75%]">
                    {msg.text}
                </div>
            </div>
        );
    }

    if (msg.from === 'system-correct') {
        return (
            <div className="flex justify-start">
                <div className="text-xs rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] bg-green-50 text-[#1A6B3C] border border-green-100 font-semibold">
                    ✅ {msg.text}
                </div>
            </div>
        );
    }

    const isWrong = msg.from === 'system-wrong';
    return (
        <div className="flex justify-start">
            <div className={`text-xs rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] whitespace-pre-line ${
                isWrong ? 'bg-orange-50 text-[#B9660A] border border-orange-100' : 'bg-white border border-gray-100 text-gray-700 shadow-sm'
            }`}>
                {isWrong ? `❌ ${msg.text}` : msg.text}
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">{label}</span>
            <span className="font-bold text-gray-800 text-right">{value}</span>
        </div>
    );
}

function StepInput({ step, inputValue, setInputValue, loading, onAnswer }) {
    if (!step) return null;

    if (step.type === 'info' || step.type === 'submit') {
        return (
            <button
                disabled={loading}
                onClick={() => onAnswer(null, null)}
                className="w-full text-xs font-bold text-white bg-[#1A6B3C] rounded-xl py-3 disabled:opacity-60"
            >
                {step.action_label ?? 'Lanjut'}
            </button>
        );
    }

    if (step.type === 'confirm') {
        return (
            <div className="flex gap-2">
                <button
                    disabled={loading}
                    onClick={() => onAnswer('ya', 'Ya')}
                    className="flex-1 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl py-3 disabled:opacity-60"
                >
                    Ya
                </button>
                <button
                    disabled={loading}
                    onClick={() => onAnswer('tidak', 'Tidak')}
                    className="flex-1 text-xs font-bold text-white bg-[#1A6B3C] rounded-xl py-3 disabled:opacity-60"
                >
                    Tidak
                </button>
            </div>
        );
    }

    if (step.type === 'choice') {
        return (
            <div className="flex flex-wrap gap-2">
                {step.options.map((opt) => (
                    <button
                        key={opt}
                        disabled={loading}
                        onClick={() => onAnswer(opt, opt)}
                        className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-[#1A6B3C] hover:text-white rounded-xl px-3.5 py-2.5 disabled:opacity-60"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        );
    }

    if (step.type === 'number') {
        return (
            <div className="flex gap-2">
                <input
                    type="number"
                    inputMode="numeric"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Masukkan angka"
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                />
                <button
                    disabled={loading || inputValue === ''}
                    onClick={() => {
                        onAnswer(inputValue, formatRupiah(inputValue));
                    }}
                    className="text-xs font-bold text-white bg-[#1A6B3C] rounded-xl px-5 disabled:opacity-40"
                >
                    Kirim
                </button>
            </div>
        );
    }

    if (step.type === 'verify_token') {
        return (
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Masukkan kode verifikasi"
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-3.5 py-3 tracking-widest focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                />
                <button
                    disabled={loading || inputValue === ''}
                    onClick={() => onAnswer(inputValue, '••••••')}
                    className="text-xs font-bold text-white bg-[#1A6B3C] rounded-xl px-5 disabled:opacity-40"
                >
                    Verifikasi
                </button>
            </div>
        );
    }

    return null;
}

function BpeResult({ assignment, result }) {
    const statusStyle = {
        'Nihil': 'text-[#1A6B3C]',
        'Kurang Bayar': 'text-[#B9660A]',
        'Lebih Bayar': 'text-[#1A6B3C]',
    }[result.status_akhir] ?? 'text-[#1A6B3C]';

    return (
        <AppLayout>
            <StudentHeader />
            <div className="flex-1 overflow-y-auto bg-[#F8FAFC] pb-24 px-4 py-4">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 text-center">
                    <p className="text-3xl mb-2">🎉</p>
                    <h2 className="text-base font-bold text-gray-800">SPT Berhasil Dikirim!</h2>
                    <p className="text-xs text-gray-500 mt-1">Bukti Penerimaan Elektronik (BPE) kamu sudah terbit.</p>

                    <div className="mt-4 bg-green-50 rounded-xl p-4 text-left space-y-2">
                        <Row label="Nama WP" value={result.nama_wp} />
                        <Row label="NPWP (Simulasi)" value={result.npwp_simulasi} />
                        <Row label="Tahun Pajak" value={result.tahun_pajak} />
                        <Row label="Jenis SPT" value="1770 S/SS" />
                        <Row label="Status SPT" value={<span className={statusStyle}>{result.status_akhir}</span>} />
                    </div>

                    <div className="mt-3 bg-gray-50 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Nomor Tanda Terima</p>
                        <p className="text-sm font-black text-gray-800 mt-1">{result.bpe_number}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-orange-50 rounded-xl p-3">
                            <p className="text-[9px] font-bold text-[#B9660A] uppercase tracking-wide">XP Diperoleh</p>
                            <p className="text-lg font-black text-[#B9660A] mt-1">+{result.xp_awarded}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Skor Akhir</p>
                            <p className="text-lg font-black text-gray-800 mt-1">{result.score}</p>
                        </div>
                    </div>

                    {result.is_late && (
                        <p className="text-[10px] text-orange-500 font-semibold mt-2">
                            ⚠️ Dikirim setelah deadline — XP dipotong 50% & skor dipotong 20 poin.
                        </p>
                    )}

                    <a
                        href={route('student.spt-simulation.bpe-pdf', assignment.id)}
                        className="block mt-4 text-xs font-bold text-white bg-[#1A6B3C] rounded-xl py-3"
                    >
                        Unduh BPE (PDF)
                    </a>
                    <Link
                        href={route('student.spt-simulation')}
                        className="block mt-2 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl py-3"
                    >
                        Kembali ke Tugas Aktif
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
