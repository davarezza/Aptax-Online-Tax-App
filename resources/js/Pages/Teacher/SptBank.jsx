import { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';
import SptDetailModal from '@/Components/Teacher/SptBank/SptDetailModal';

function formatRupiah(value) {
    const n = Number(value) || 0;
    return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

const statusStyle = {
    'Nihil': { bg: 'bg-green-50', text: 'text-[#1A6B3C]' },
    'Kurang Bayar': { bg: 'bg-orange-50', text: 'text-[#B9660A]' },
    'Lebih Bayar': { bg: 'bg-green-50', text: 'text-[#1A6B3C]' },
};

const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'rilis', label: 'Rilis' },
    { key: 'draft', label: 'Draft' },
];

export default function SptBank({ kelasAktif = null, assignments = [] }) {
    const [filter, setFilter] = useState('semua');
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        if (filter === 'rilis') return assignments.filter((a) => a.is_released);
        if (filter === 'draft') return assignments.filter((a) => !a.is_released);
        return assignments;
    }, [filter, assignments]);

    function toggleRelease(a, e) {
        e.stopPropagation();
        router.patch(route('teacher.spt-maker.toggle-release', a.id), {}, { preserveScroll: true });
    }

    function handleDelete(a, e) {
        e.stopPropagation();
        if (!confirm(`Hapus soal "${a.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        router.delete(route('teacher.spt-maker.destroy', a.id), { preserveScroll: true });
    }

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto bg-[#F4F6F9] pb-24">
                <TeacherHeader />

                <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-base font-bold text-gray-800">Bank Soal SPT</h2>
                        <Link
                            href={route('teacher.spt-maker.create')}
                            className="bg-[#1A6B3C] text-white text-xs font-bold px-3.5 py-2 rounded-full shrink-0"
                        >
                            + Tambah
                        </Link>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-3">
                        {kelasAktif ? `Soal untuk kelas ${kelasAktif.class_name}` : 'Belum ada kelas yang diampu'}
                    </p>

                    <div className="flex gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0 ${
                                    filter === f.key ? 'bg-[#1A6B3C] text-white' : 'bg-white border border-gray-200 text-gray-500'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4 py-3 space-y-2.5">
                    {filtered.length === 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
                            <p className="text-2xl mb-2">📄</p>
                            <p className="text-xs font-semibold text-gray-700">Belum ada soal SPT</p>
                            <p className="text-[10px] text-gray-400 mt-1">Tekan tombol "+ Tambah" untuk membuat soal pertama.</p>
                        </div>
                    )}

                    {filtered.map((a) => {
                        const style = statusStyle[a.ringkasan?.status_akhir] ?? statusStyle['Nihil'];
                        return (
                            <div
                                key={a.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelected(a)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setSelected(a); }}
                                className="w-full text-left bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm active:bg-gray-50 cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">1770 S/SS</span>
                                        <span className={`${style.bg} ${style.text} text-[9px] font-bold px-2 py-0.5 rounded-full`}>
                                            {a.ringkasan?.status_akhir ?? '-'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => toggleRelease(a, e)}
                                        className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full ${
                                            a.is_released
                                                ? 'bg-[#1A6B3C] text-white'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {a.is_released ? '✓ Ditayangkan' : 'Rilis'}
                                    </button>
                                </div>

                                <p className="text-sm font-bold text-gray-800 truncate">{a.title}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {a.ringkasan?.nama_wp} · {a.ringkasan?.tahun_pajak} · Dibuat {a.created_at_human}
                                </p>

                                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-gray-500">
                                            <span className="font-bold text-gray-700">{a.xp_reward}</span> XP
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            {a.submissions_count} siswa mengerjakan
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold text-[#1A6B3C]">Lihat Detail</span>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(a, e)}
                                            className="text-[10px] font-semibold text-red-400"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <SptDetailModal assignment={selected} onClose={() => setSelected(null)} />
            <TeacherBottomNav active="spt-maker" />
        </AppLayout>
    );
}
