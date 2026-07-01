import { useForm } from '@inertiajs/react';

export default function ManualForm({ taxTopics, onBack }) {
    // Definisi state form interaktif langsung terikat ke engine Inertia
    const { data, setData, post, errors, processing } = useForm({
        title: '',
        tax_topic: '',
        description: '',
        correct_answer: '',
        difficulty: 'intermediate',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });

    const handleSave = (e) => {
        e.preventDefault();
        post(route('teacher.maker.storeManual'), {
            preserveScroll: true
        });
    };

    return (
        <div className="mx-4 mb-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
                <button
                    type="button"
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

            <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Studi Kasus</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Masukkan judul kasus..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1A6B3C] transition"
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pilih Kategori Pajak</label>
                        <div className="relative">
                            <select
                                value={data.tax_topic}
                                onChange={(e) => setData('tax_topic', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#1A6B3C] transition"
                            >
                                <option value="">Pilih materi...</option>
                                {taxTopics.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                        </div>
                        {errors.tax_topic && <p className="text-xs text-red-500 mt-1">{errors.tax_topic}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tingkat Kesulitan</label>
                        <div className="relative">
                            <select
                                value={data.difficulty}
                                onChange={(e) => setData('difficulty', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#1A6B3C] transition"
                            >
                                <option value="beginner">Beginner (30 XP)</option>
                                <option value="intermediate">Intermediate (60 XP)</option>
                                <option value="advanced">Advanced (90 XP)</option>
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Batas Pengumpulan (Deadline)</label>
                    <input
                        type="datetime-local"
                        value={data.deadline}
                        onChange={(e) => setData('deadline', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1A6B3C] transition"
                    />
                    {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Soal / Studi Kasus</label>
                    <textarea
                        rows={4}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Tuliskan skenario kasus secara detail di sini..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1A6B3C] transition resize-none"
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kunci Jawaban Angka (Rupiah)</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A6B3C] transition">
                        <span className="px-3 py-3 text-sm font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">Rp</span>
                        <input
                            type="number"
                            value={data.correct_answer}
                            onChange={(e) => setData('correct_answer', e.target.value)}
                            placeholder="Contoh: 250000"
                            className="flex-1 px-4 py-3 text-sm text-gray-800 focus:outline-none bg-white"
                        />
                    </div>
                    {errors.correct_answer && <p className="text-xs text-red-500 mt-1">{errors.correct_answer}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-5 py-4 bg-[#0D5C73] hover:bg-[#0a4d61] disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
                >
                    💾 {processing ? 'Menyimpan ke Database...' : 'Simpan ke Question Bank'}
                </button>
            </form>
        </div>
    );
}
