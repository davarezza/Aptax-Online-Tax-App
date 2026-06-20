import { useState } from 'react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';
import ManualForm from '@/Components/Teacher/ManualForm';

// ── CONSTANTS DATA POOL ──────────────────────────────────────────────────────
const TAX_TOPICS = [
    'PPh 21 (Income Tax)',
    'PPh 23 (Withholding Tax)',
    'PPh 25 (Corporate Tax)',
    'PPN (Value Added Tax)',
    'PPnBM (Luxury Goods Tax)',
    'Bes Meterai (Stamp Duty)',
];

const TOPIC_TAGS = {
    'PPh 21 (Income Tax)': 'PPh 21',
    'PPh 23 (Withholding Tax)': 'PPh 23',
    'PPh 25 (Corporate Tax)': 'PPh 25',
    'PPN (Value Added Tax)': 'PPN',
    'PPnBM (Luxury Goods Tax)': 'PPnBM',
    'Bes Meterai (Stamp Duty)': 'Meterai',
};

const AI_DRAFTS = {
    'PPh 21 (Income Tax)': { title: "Budi's Freelance Gig", desc: 'Hitung PPh 21 atas penghasilan freelance Budi selama satu bulan.' },
    'PPN (Value Added Tax)': { title: 'Tech Startup VAT Exemption', desc: 'Studi kasus PPN Jasa teknologi startup.' },
    'PPh 23 (Withholding Tax)': { title: 'Coffee Shop Dividend', desc: 'PPh 23 atas dividen pembagian pemegang saham PT Kopi.' }
};

const INITIAL_BANK = [
    { id: 1, title: "Budi's Freelance Gig", tag: 'PPh 21', diff: 2, source: 'AI', released: true, age: '2h ago' },
    { id: 2, title: 'Tech Startup VAT Exemption', tag: 'PPN', diff: 3, source: 'AI', released: false, age: '1d ago' },
    { id: 3, title: 'Coffee Shop Dividend', tag: 'PPh 23', diff: 1, source: 'Manual', released: true }
];

export default function TeacherMaker() {
    const [mode, setMode] = useState('main'); // 'main' atau 'manual'
    const [topic, setTopic] = useState(TAX_TOPICS[0]);
    const [difficulty, setDiff] = useState('Intermediate');
    const [bank, setBank] = useState(INITIAL_BANK);
    const [generating, setGenerating] = useState(false);

    // Dropdown Custom Filter State
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterSource, setFilterSource] = useState('All');

    const handleToggleRelease = (id) => {
        setBank(prev => prev.map(q => q.id === id ? { ...q, released: !q.released } : q));
    };

    // Handler Pemicu Loading + Generate AI Dinamis
    const handleGenerateAI = () => {
        setGenerating(true);
        setTimeout(() => {
            const template = AI_DRAFTS[topic] || AI_DRAFTS['PPh 21 (Income Tax)'];
            const starMap = { Beginner: 1, Intermediate: 2, Advanced: 3 };

            const newAiQuestion = {
                id: Date.now(),
                title: `${template.title} (${difficulty})`,
                tag: TOPIC_TAGS[topic] || 'PPh 21',
                diff: starMap[difficulty] || 2,
                source: 'AI',
                released: false,
                age: 'just now'
            };
            setBank([newAiQuestion, ...bank]);
            setGenerating(false);
        }, 1000); // Penambahan loading 1 detik sebelum data masuk
    };

    const handleSaveManualEntry = (formData) => {
        const newManualQuestion = {
            id: Date.now(),
            title: formData.title,
            tag: TOPIC_TAGS[formData.topic] || 'PPh 21',
            diff: 2,
            source: 'Manual',
            released: false
        };
        setBank([newManualQuestion, ...bank]);
        setMode('main');
    };

    const filteredBank = filterSource === 'All' ? bank : bank.filter(i => i.source === filterSource);

    const tagColors = {
        'PPh 21': 'bg-blue-100 text-blue-700',
        'PPh 23': 'bg-purple-100 text-purple-700',
        'PPh 25': 'bg-indigo-100 text-indigo-700',
        'PPN': 'bg-emerald-100 text-emerald-700',
        'PPnBM': 'bg-rose-100 text-rose-700'
    };

    return (
        <AppLayout>
            <TeacherHeader teacherName="Mr. Davis" teacherRole="Guru Perpajakan" initials="D" isOnline />

            <div className="pb-28 pt-3 flex-1 overflow-y-auto">
                {mode === 'manual' ? (
                    <ManualForm
                        taxTopics={TAX_TOPICS}
                        onSave={handleSaveManualEntry}
                        onBack={() => setMode('main')}
                    />
                ) : (
                    <>
                        {/* ── SEKSI GENERATOR CARD AI ── */}
                        <div className="mx-4 mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-sm">🤖</div>
                                <div>
                                    <h2 className="text-base font-extrabold text-gray-900 leading-tight">Generative AI Case Maker</h2>
                                    <p className="text-xs text-gray-400">Instantly craft realistic tax scenarios for your class.</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-50" />

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Tax Topic</label>
                                <div className="relative">
                                    <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-white text-gray-800 appearance-none focus:outline-none">
                                        {TAX_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none">▼</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Difficulty Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                                        <button key={d} onClick={() => setDiff(d)} className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${difficulty === d ? 'bg-[#1A6B3C] text-white border-[#1A6B3C] shadow-sm' : 'bg-white text-gray-500 border-gray-200'}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Green Call to Action Banner Box */}
                            <div className="bg-[#1A6B3C] rounded-2xl p-4 relative overflow-hidden">
                                <p className="text-white font-extrabold text-base mb-0.5">Ready to generate?</p>
                                <p className="text-white/70 text-xs mb-4 leading-relaxed">Our AI will create a unique, gamified scenario complete with calculations and multiple-choice answers.</p>

                                <div className="space-y-2">
                                    <button
                                        onClick={handleGenerateAI}
                                        disabled={generating}
                                        className="w-full py-3 bg-[#4ADE80] text-[#14532d] font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow disabled:opacity-75 active:scale-[0.99] transition-all"
                                    >
                                        {generating ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-[#14532d] border-t-transparent rounded-full animate-spin" />
                                                <span>Generating Case via AI...</span>
                                            </div>
                                        ) : (
                                            <>🧠 Generate Quiz via AI</>
                                        )}
                                    </button>
                                    <button onClick={() => setMode('manual')} className="w-full py-3 border-2 border-white/40 text-white font-bold text-sm rounded-xl hover:bg-white/5 transition-colors">
                                        + Buat Soal Custom Sendiri (Manual Entry)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── SEKSI DAFTAR BANK SOAL (DENGAN UI FILTER UTAL ASLI) ── */}
                        <div className="mx-4 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-extrabold text-gray-900">Question Bank</h2>

                                {/* UI Filter Dropdown Popover Asli */}
                                <div className="relative">
                                    <button
                                        onClick={() => setFilterOpen(!filterOpen)}
                                        className="flex items-center gap-1.5 bg-cyan-100 text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-cyan-200 transition-colors"
                                    >
                                        Filter
                                    </button>
                                    {filterOpen && (
                                        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden">
                                            {['All', 'AI', 'Manual'].map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => { setFilterSource(f); setFilterOpen(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${filterSource === f ? 'bg-[#1A6B3C] text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {f === 'All' ? 'Semua' : f === 'AI' ? 'Generated AI' : 'Manual Entry'}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Daftar Grid List Row */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                    <span>Scenario Title</span>
                                    <span className="w-14 text-center">Topic</span>
                                    <span className="w-12 text-center">Diff.</span>
                                    <span className="w-12 text-center">Release</span>
                                </div>

                                {filteredBank.map(item => (
                                    <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3.5">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>
                                            <p className={`text-[9px] font-bold mt-0.5 ${item.source === 'AI' ? 'text-blue-400' : 'text-amber-500'}`}>
                                                {item.source === 'AI' ? `Generated ${item.age || ''} by AI` : 'Manual Entry'}
                                            </p>
                                        </div>

                                        <div className="w-14 flex justify-center">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${tagColors[item.tag] || 'bg-gray-100'}`}>
                                                {item.tag}
                                            </span>
                                        </div>

                                        <div className="w-12 flex justify-center text-amber-400 text-xs">
                                            {['★', '★★', '★★★'][item.diff - 1] || '★'}
                                        </div>

                                        <div className="w-12 flex justify-center">
                                            <button
                                                onClick={() => handleToggleRelease(item.id)}
                                                className={`relative w-10 h-5.5 rounded-full p-0.5 flex transition-colors ${item.released ? 'bg-[#1A6B3C] justify-end' : 'bg-gray-200 justify-start'}`}
                                            >
                                                <div className="w-4 h-4 rounded-full bg-white shadow-xs flex items-center justify-center text-[7px] text-emerald-700 font-bold">{item.released && "✓"}</div>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <TeacherBottomNav active="maker" />
        </AppLayout>
    );
}
