import { useState } from 'react';

export default function EvaluationModal({ task, onClose }) {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'teacher', text: `Analisis perhitungan ${task.title} kamu secara umum sudah bagus, namun silakan lengkapi lagi dasar hukum Pasal terkait agar argumen fiskalmu lebih kuat.`, time: '09:30' },
        { id: 2, sender: 'student', text: 'Baik Pak, terima kasih masukannya. Apakah pada bagian kompensasi kerugian juga perlu saya jabarkan detilnya?', time: '10:15' },
        { id: 3, sender: 'teacher', text: 'Ya betul, jabarkan ringkas saja dalam 1 paragraf pada lampiran berikutnya ya.', time: '10:20' },
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            sender: 'student',
            text: inputMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInputMessage('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-t-3xl w-full max-w-md h-[85vh] flex flex-col shadow-2xl animate-slide-up">

                {/* ── HEADER MODAL ── */}
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
                    <h3 className="text-lg font-black text-slate-800 pr-8">{task.title}</h3>

                    {/* Inline Badges Row */}
                    <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-700">
                            {task.status}
                        </span>
                        <span className="text-[11px] font-black text-emerald-600">
                            {task.score}
                        </span>
                        <span className="text-[11px] font-extrabold text-amber-600">
                            {task.xp}
                        </span>
                    </div>
                </div>

                {/* ── CONTENT AREA ── */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">

                    {/* AI Feedback Section */}
                    <div className="bg-[#F0F6FF] border border-[#E2EEFF] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px]">
                                🖎
                            </div>
                            <h4 className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                                AI FEEDBACK
                            </h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {task.aiFeedback || "Profil kamu sudah lengkap dan informatif. Pemilihan avatar mencerminkan semangat belajar yang baik. Pastikan data kontak selalu diperbarui agar guru bisa menghubungimu dengan mudah."}
                        </p>
                    </div>

                    {/* Thread Subtitle */}
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">
                        THREAD PRIVAT — SISWA & GURU
                    </p>

                    {/* Chat Bubble List */}
                    <div className="space-y-3 pt-1">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                                    msg.sender === 'student'
                                    ? 'bg-[#1A6B3C] text-white rounded-tr-none'
                                    : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                                }`}>
                                    <p>{msg.text}</p>
                                </div>
                                <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CHAT INPUT FOOTER ── */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Balas catatan dosen privat..."
                        className="flex-1 bg-gray-50 border border-gray-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A6B3C] text-gray-800"
                    />
                    <button
                        type="submit"
                        className="bg-[#1A6B3C] text-white font-bold text-xs px-4 py-3 rounded-xl hover:bg-[#155430] active:scale-95 transition-all shadow-md"
                    >
                        Kirim
                    </button>
                </form>
            </div>
        </div>
    );
}
