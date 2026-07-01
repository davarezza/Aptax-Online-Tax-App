import React from 'react';

export default function QuestionDetailModal({ isOpen, onClose, task }) {
    if (!isOpen || !task) return null;

    // Helper untuk memformat angka ke Rupiah
    const formatRupiah = (value) => {
        if (!value) return '0';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    // Helper untuk format tanggal deadline
    const formatDeadline = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('id-ID', {
                dateStyle: 'long',
                timeStyle: 'short'
            }) + ' WIB';
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-md mr-2">
                            {task.source}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            task.tag === 'PPh 21' ? 'bg-blue-100 text-blue-700' :
                            task.tag === 'PPN' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                            {task.tag}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold text-sm p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    <div>
                        <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                            {task.title}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1">Dibuat: {task.age}</p>
                    </div>

                    <div className="border-t border-gray-50 pt-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Studi Kasus / Deskripsi Soal</label>
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                            {task.description || "Memuat deskripsi..."}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-[#1A6B3C]/5 border border-[#1A6B3C]/10 rounded-xl p-3">
                            <label className="block text-[10px] font-bold text-[#1A6B3C] uppercase tracking-wide mb-0.5">Kunci Jawaban</label>
                            <p className="text-xs font-black text-gray-800">Rp {formatRupiah(task.correct_answer)}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">Difficulty / Reward</label>
                            <p className="text-xs font-black text-gray-800 flex items-center gap-1">
                                <span className="text-amber-400 text-xs">{'★'.repeat(task.diff)}</span>
                                <span className="text-[10px] text-gray-400 font-normal">({task.diff === 1 ? '30' : task.diff === 2 ? '60' : '90'} XP)</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Batas Waktu (Deadline)</label>
                            <p className="text-xs font-bold text-gray-700 mt-0.5">{formatDeadline(task.deadline)}</p>
                        </div>
                        <div className="text-right">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Status Akses</label>
                            <span className={`text-[10px] font-black inline-block mt-0.5 ${task.released ? 'text-[#1A6B3C]' : 'text-amber-600'}`}>
                                {task.released ? '● AKTIF/RILIS' : '○ DRAFT/TERTUTUP'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 text-white font-extrabold text-xs rounded-xl hover:bg-gray-900 shadow-sm transition-all active:scale-[0.98]"
                    >
                        Tutup Detail
                    </button>
                </div>

            </div>
        </div>
    );
}
