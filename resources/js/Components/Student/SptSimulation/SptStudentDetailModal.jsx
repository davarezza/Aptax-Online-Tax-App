import { router } from '@inertiajs/react';

function formatRupiah(value) {
    const n = Number(value) || 0;
    return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function relativeDeadline(iso, isLate) {
    const d = new Date(iso);
    const label = d.toLocaleDateString('id-ID', { weekday: 'long' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return isLate ? `Sudah lewat sejak ${label}` : `Batas waktu ${label}`;
}

/**
 * Modal detail soal SPT untuk siswa. Sengaja TIDAK menampilkan kunci
 * jawaban (PPh Terutang, status akhir) - siswa harus menghitungnya sendiri
 * lewat wizard. Ini cuma pratinjau kasus + info XP/deadline.
 */
export default function SptStudentDetailModal({ assignment, onClose }) {
    if (!assignment) return null;

    function handleKerjakan() {
        router.post(route('student.spt-simulation.start', assignment.id));
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-gray-100 flex items-start justify-between z-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-1 rounded-full">1770 S/SS</span>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                            assignment.is_late ? 'bg-orange-500 text-white' : 'bg-[#1A6B3C] text-white'
                        }`}>
                            {assignment.is_late ? 'Late' : 'Active'}
                        </span>
                        {assignment.has_started && (
                            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-1 rounded-full">Sedang Dikerjakan</span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 text-lg leading-none px-1">✕</button>
                </div>

                <div className="px-4 py-4 space-y-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-800 leading-snug">{assignment.title}</h3>
                        <p className="text-[10px] text-gray-400 mt-1">{relativeDeadline(assignment.deadline, assignment.is_late)}</p>
                    </div>

                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Studi Kasus</p>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{assignment.description}</p>
                        </div>
                    </div>

                    {assignment.is_late && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                            <p className="text-[10px] font-semibold text-orange-600">
                                ⚠️ Pengumpulan sudah melewati deadline. XP yang didapat berkurang 50% dan ada penalti −20 poin dari skor akhir.
                            </p>
                        </div>
                    )}

                    <div className="bg-green-50 rounded-xl p-3.5">
                        <p className="text-[9px] font-bold text-[#1A6B3C] uppercase tracking-wide mb-2">Cara Kerja Simulasi</p>
                        <ul className="text-[11px] text-gray-600 space-y-1 leading-relaxed list-disc pl-4">
                            <li>Data Bukti Potong akan terdeteksi otomatis — tidak perlu unggah file apa pun.</li>
                            <li>Kamu akan dipandu Tax Wizard langkah demi langkah (Langkah 1 sampai K).</li>
                            <li>Jawaban benar di percobaan pertama = poin penuh. Salah = poin langkah berkurang, tapi kamu tetap bisa coba lagi.</li>
                            <li>Di akhir, kamu dapat XP + Bukti Penerimaan Elektronik (BPE) yang bisa diunduh sebagai PDF.</li>
                        </ul>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Reward</p>
                            <p className="text-sm font-black text-[#1A6B3C] mt-0.5">
                                +{assignment.is_late ? Math.floor(assignment.xp_reward * 0.5) : assignment.xp_reward} XP
                            </p>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
                    <button
                        onClick={handleKerjakan}
                        className={`w-full text-xs font-bold text-white rounded-xl py-3.5 ${
                            assignment.is_late ? 'bg-orange-500' : 'bg-[#1A6B3C]'
                        }`}
                    >
                        {assignment.has_started ? 'Lanjutkan Simulasi' : 'Kerjakan Soal'}
                    </button>
                </div>
            </div>
        </div>
    );
}
