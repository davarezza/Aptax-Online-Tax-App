import { useState } from 'react';

export default function ManualForm({ taxTopics, onSave, onBack }) {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [desc, setDesc] = useState('');
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!title.trim() || !topic || !desc.trim()) {
            setError('Judul, materi, dan deskripsi wajib diisi.');
            return;
        }
        setError('');
        onSave({
            title: title.trim(),
            topic: topic,
            desc: desc.trim(),
            answer
        });
    };

    return (
        <div className="mx-4 mb-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-5 h-5 text-[#1A6B3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h2 className="text-lg font-extrabold text-[#1A6B3C]">Buat Soal Custom</h2>
                <div className="ml-auto w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm">👤</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Studi Kasus</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Masukkan judul kasus..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1A6B3C] transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pilih Materi Pajak</label>
                    <div className="relative">
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#1A6B3C] transition"
                        >
                            <option value="">Pilih kategori pajak...</option>
                            {taxTopics.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Soal / Studi Kasus</label>
                    <textarea
                        rows={5}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Tuliskan skenario kasus secara detail di sini..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1A6B3C] transition resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kunci Jawaban Angka (Rupiah)</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A6B3C] transition">
                        <span className="px-3 py-3 text-sm font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">Rp</span>
                        <input
                            type="number"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="0"
                            className="flex-1 px-4 py-3 text-sm text-gray-800 focus:outline-none bg-white"
                        />
                    </div>
                </div>

                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            <button
                onClick={handleSave}
                className="w-full mt-5 py-4 bg-[#0D5C73] hover:bg-[#0a4d61] text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
            >
                💾 Simpan ke Question Bank
            </button>
        </div>
    );
}
