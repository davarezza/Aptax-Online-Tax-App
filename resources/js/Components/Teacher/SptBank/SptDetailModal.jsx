import { router } from '@inertiajs/react';

const COLORS = {
    green: '#1A6B3C',
    orange: '#FAA042',
};

function formatRupiah(value) {
    const n = Number(value) || 0;
    return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

const statusStyle = {
    'Nihil': { bg: 'bg-green-50', text: 'text-[#1A6B3C]', dot: 'bg-[#1A6B3C]' },
    'Kurang Bayar': { bg: 'bg-orange-50', text: 'text-[#B9660A]', dot: 'bg-[#FAA042]' },
    'Lebih Bayar': { bg: 'bg-green-50', text: 'text-[#1A6B3C]', dot: 'bg-[#3F9464]' },
};

/**
 * Modal detail soal SPT — read only (tidak ada edit).
 * Props:
 *  - assignment: object soal (dari SptBank.jsx), atau null kalau tertutup
 *  - onClose: fungsi untuk menutup modal
 */
export default function SptDetailModal({ assignment, onClose }) {
    if (!assignment) return null;

    const r = assignment.ringkasan ?? {};
    const style = statusStyle[r.status_akhir] ?? statusStyle['Nihil'];

    function handleToggleRelease() {
        router.patch(route('teacher.spt-maker.toggle-release', assignment.id), {}, { preserveScroll: true });
    }

    function handleDelete() {
        if (!confirm(`Hapus soal "${assignment.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        router.delete(route('teacher.spt-maker.destroy', assignment.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[88vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-gray-100 flex items-start justify-between z-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-1 rounded-full">1770 S/SS</span>
                        <span className={`${style.bg} ${style.text} text-[9px] font-bold px-2 py-1 rounded-full`}>
                            {r.status_akhir ?? '-'}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 text-lg leading-none px-1">✕</button>
                </div>

                <div className="px-4 py-4 space-y-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-800">{assignment.title}</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">Dibuat {assignment.created_at_human}</p>
                    </div>

                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Studi Kasus / Deskripsi Soal</p>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{assignment.description}</p>
                        </div>
                    </div>

                    {r.penghasilan_final && (
                        <div className="flex items-center justify-between text-xs border border-gray-100 rounded-lg px-3 py-2.5">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Penghasilan Final</p>
                                <p className="text-gray-600 mt-0.5">{r.penghasilan_final.sumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-800">{formatRupiah(r.penghasilan_final.bruto)}</p>
                                <p className="text-[10px] text-gray-400">PPh Final {formatRupiah(r.penghasilan_final.pph)}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Rincian Perhitungan</p>
                        <div className="border border-gray-100 rounded-xl p-3 space-y-1.5">
                            <DetailRow label="Wajib Pajak" value={r.nama_wp} />
                            <DetailRow label="Tahun Pajak" value={r.tahun_pajak} />
                            <DetailRow label="Penghasilan Neto" value={formatRupiah(r.penghasilan_neto)} />
                            <DetailRow label={`PTKP (${r.status_ptkp ?? '-'})`} value={formatRupiah(r.ptkp_jumlah)} hidden={!r.status_ptkp} />
                            <DetailRow label="Penghasilan Kena Pajak" value={formatRupiah(r.pkp)} />
                            <DetailRow label="Kredit Pajak" value={formatRupiah(r.kredit_pajak)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-[9px] font-bold text-[#1A6B3C] uppercase tracking-wide mb-1">Kunci Jawaban</p>
                            <p className="text-sm font-black text-[#1A6B3C]">{r.status_akhir}</p>
                            <p className="text-[10px] text-[#1A6B3C] mt-0.5 font-semibold">
                                {r.status_akhir === 'Nihil' ? 'Rp0' : formatRupiah(Math.abs(r.selisih))}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1.5 pt-1.5 border-t border-green-100">
                                PPh Terutang: {formatRupiah(r.pph_terutang)}
                            </p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-3">
                            <p className="text-[9px] font-bold text-[#B9660A] uppercase tracking-wide mb-1">Reward</p>
                            <p className="text-sm font-black text-[#B9660A]">{assignment.xp_reward} XP</p>
                        </div>
                    </div>

                    {(r.harta?.length > 0 || r.utang?.length > 0) && (
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Harta &amp; Utang</p>
                            <div className="space-y-1.5">
                                {r.harta?.map((h, i) => (
                                    <div key={`h-${i}`} className="flex items-center justify-between text-xs border border-gray-100 rounded-lg px-2.5 py-2">
                                        <span className="text-gray-600 truncate">{h.nama_harta}</span>
                                        <span className="font-semibold text-gray-800 shrink-0 ml-2">{formatRupiah(h.harga_perolehan)}</span>
                                    </div>
                                ))}
                                {r.utang?.map((u, i) => (
                                    <div key={`u-${i}`} className="flex items-center justify-between text-xs border border-gray-100 rounded-lg px-2.5 py-2">
                                        <span className="text-gray-600 truncate">{u.nama_pemberi}</span>
                                        <span className="font-semibold text-gray-800 shrink-0 ml-2">{formatRupiah(u.jumlah)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Batas Waktu</p>
                            <p className="text-xs font-semibold text-gray-700 mt-0.5">{assignment.deadline_label}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Status Akses</p>
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-0.5 ${assignment.is_released ? 'text-[#1A6B3C]' : 'text-gray-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${assignment.is_released ? 'bg-[#1A6B3C]' : 'bg-gray-300'}`} />
                                {assignment.is_released ? 'Aktif/Rilis' : 'Draft'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={assignment.submissions_count > 0}
                        title={assignment.submissions_count > 0 ? 'Sudah dikerjakan siswa, tidak bisa dihapus' : 'Hapus soal'}
                        className="text-xs font-bold text-red-500 bg-red-50 rounded-xl px-4 py-3 disabled:opacity-40"
                    >
                        Hapus
                    </button>
                    <button
                        onClick={handleToggleRelease}
                        className={`flex-1 text-xs font-bold rounded-xl py-3 ${assignment.is_released ? 'bg-gray-100 text-gray-600' : 'bg-[#1A6B3C] text-white'}`}
                    >
                        {assignment.is_released ? 'Tarik dari Siswa' : 'Rilis ke Siswa'}
                    </button>
                    <button onClick={onClose} className="text-xs font-bold text-white bg-gray-800 rounded-xl px-4 py-3">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, hidden = false }) {
    if (hidden) return null;
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-gray-500 shrink-0">{label}</span>
            <span className="text-xs font-semibold text-gray-700 text-right truncate">{value ?? '-'}</span>
        </div>
    );
}
