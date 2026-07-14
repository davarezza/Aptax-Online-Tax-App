import { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';

const COLORS = {
    green: '#1A6B3C',
    greenLight: '#3F9464',
    orange: '#FAA042',
    orangeLight: '#FCC488',
};

const PTKP_RATES = {
    'TK/0': 54_000_000,
    'TK/1': 58_500_000,
    'TK/2': 63_000_000,
    'TK/3': 67_500_000,
    'K/0': 58_500_000,
    'K/1': 63_000_000,
    'K/2': 67_500_000,
    'K/3': 72_000_000,
};

const TAX_BRACKETS = [
    { limit: 60_000_000, rate: 0.05 },
    { limit: 250_000_000, rate: 0.15 },
    { limit: 500_000_000, rate: 0.25 },
    { limit: 5_000_000_000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 },
];

function hitungPkp(penghasilanNeto, ptkp) {
    const pkp = Math.max(0, (Number(penghasilanNeto) || 0) - ptkp);
    return Math.floor(pkp / 1000) * 1000;
}

function hitungPphTerutang(pkp) {
    let sisa = pkp;
    let batasBawah = 0;
    let total = 0;

    for (const bracket of TAX_BRACKETS) {
        if (sisa <= 0) break;
        const lebar = bracket.limit - batasBawah;
        const kena = Math.min(sisa, lebar);
        total += kena * bracket.rate;
        sisa -= kena;
        batasBawah = bracket.limit;
    }

    return Math.round(total);
}

function formatRupiah(value) {
    const n = Number(value) || 0;
    return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function emptyHarta() {
    return { nama: '', tahun_perolehan: '', harga_perolehan: '', keterangan: '' };
}

function emptyUtang() {
    return { nama_pemberi: '', tahun_pinjaman: '', jumlah: '' };
}

export default function SptMaker({ classes = [] }) {
    const [harta, setHarta] = useState([emptyHarta()]);
    const [utang, setUtang] = useState([emptyUtang()]);

    const { data, setData, post, processing, errors } = useForm({
        class_id: '',
        title: '',
        xp_reward: 100,
        deadline: '',
        is_released: false,
        nama_wp: '',
        tahun_pajak: new Date().getFullYear(),
        penghasilan_neto: '',
        status_ptkp: 'TK/0',
        kredit_pajak: '',
    });

    const preview = useMemo(() => {
        const ptkpAmount = PTKP_RATES[data.status_ptkp] ?? PTKP_RATES['TK/0'];
        const pkp = hitungPkp(data.penghasilan_neto, ptkpAmount);
        const pphTerutang = hitungPphTerutang(pkp);
        const kreditPajak = Number(data.kredit_pajak) || 0;
        const selisih = Math.round(pphTerutang - kreditPajak);

        let status = 'Nihil';
        if (selisih > 0) status = 'Kurang Bayar';
        else if (selisih < 0) status = 'Lebih Bayar';

        return { ptkpAmount, pkp, pphTerutang, kreditPajak, selisih, status };
    }, [data.penghasilan_neto, data.status_ptkp, data.kredit_pajak]);

    const statusStyle = {
        'Nihil': { bg: 'bg-green-50', text: 'text-[#1A6B3C]', badge: 'bg-[#1A6B3C]' },
        'Kurang Bayar': { bg: 'bg-orange-50', text: 'text-[#B9660A]', badge: 'bg-[#FAA042]' },
        'Lebih Bayar': { bg: 'bg-green-50', text: 'text-[#1A6B3C]', badge: 'bg-[#3F9464]' },
    }[preview.status];

    function updateRow(rows, setRows, index, field, value) {
        const next = [...rows];
        next[index] = { ...next[index], [field]: value };
        setRows(next);
    }

    function submit(e) {
        e.preventDefault();
        setData((prev) => ({ ...prev, harta, utang }));
        setTimeout(() => {
            post(route('teacher.spt-maker.store'));
        }, 0);
    }

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto bg-[#F4F6F9] pb-24">
                <TeacherHeader />
                <form onSubmit={submit} className="px-4 py-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">SPT Maker</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Buat simulasi SPT Orang Pribadi tanpa mengisi form A-K manual.</p>
                        </div>
                        <span className="bg-[#1A6B3C] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shrink-0">
                            1770 S/SS · Terkunci
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* ============ KOLOM FORM ============ */}
                        <div className="lg:col-span-2 space-y-3">
                            {/* Info Soal */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <p className="text-xs font-bold text-gray-800 mb-3">Info Soal</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="text-[10px] font-semibold text-gray-500">Judul Soal</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Contoh: Simulasi SPT Tahunan - Karyawan Swasta"
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        />
                                        {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Kelas</label>
                                        <select
                                            value={data.class_id}
                                            onChange={(e) => setData('class_id', e.target.value)}
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        >
                                            <option value="">Pilih kelas</option>
                                            {classes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        {errors.class_id && <p className="text-[10px] text-red-500 mt-1">{errors.class_id}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Deadline</label>
                                        <input
                                            type="datetime-local"
                                            value={data.deadline}
                                            onChange={(e) => setData('deadline', e.target.value)}
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        />
                                        {errors.deadline && <p className="text-[10px] text-red-500 mt-1">{errors.deadline}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">XP Reward</label>
                                        <input
                                            type="number"
                                            value={data.xp_reward}
                                            onChange={(e) => setData('xp_reward', e.target.value)}
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 mt-1">
                                        <input
                                            type="checkbox"
                                            checked={data.is_released}
                                            onChange={(e) => setData('is_released', e.target.checked)}
                                            className="w-4 h-4 accent-[#1A6B3C]"
                                        />
                                        <span className="text-xs text-gray-600">Rilis langsung ke siswa</span>
                                    </label>
                                </div>
                            </div>

                            {/* Data Wajib Pajak */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <p className="text-xs font-bold text-gray-800 mb-3">Identitas Wajib Pajak</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Nama Wajib Pajak</label>
                                        <input
                                            type="text"
                                            value={data.nama_wp}
                                            onChange={(e) => setData('nama_wp', e.target.value)}
                                            placeholder="Contoh: Budi Santoso"
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        />
                                        {errors.nama_wp && <p className="text-[10px] text-red-500 mt-1">{errors.nama_wp}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Tahun Pajak</label>
                                        <input
                                            type="number"
                                            value={data.tahun_pajak}
                                            onChange={(e) => setData('tahun_pajak', e.target.value)}
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Data Utama */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <p className="text-xs font-bold text-gray-800 mb-3">Data Utama</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Penghasilan Neto Setahun</label>
                                        <input
                                            type="number"
                                            value={data.penghasilan_neto}
                                            onChange={(e) => setData('penghasilan_neto', e.target.value)}
                                            placeholder="0"
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        />
                                        {errors.penghasilan_neto && <p className="text-[10px] text-red-500 mt-1">{errors.penghasilan_neto}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Status PTKP</label>
                                        <select
                                            value={data.status_ptkp}
                                            onChange={(e) => setData('status_ptkp', e.target.value)}
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        >
                                            {Object.keys(PTKP_RATES).map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-[10px] font-semibold text-gray-500">Kredit Pajak (dipotong pihak lain)</label>
                                        <input
                                            type="number"
                                            value={data.kredit_pajak}
                                            onChange={(e) => setData('kredit_pajak', e.target.value)}
                                            placeholder="0"
                                            className="w-full mt-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F9464]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Harta Bergerak */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-800">Harta Bergerak</p>
                                    <button
                                        type="button"
                                        onClick={() => setHarta([...harta, emptyHarta()])}
                                        className="text-[10px] font-bold text-[#1A6B3C] bg-green-50 px-2.5 py-1 rounded-full"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {harta.map((row, i) => (
                                        <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-gray-100 rounded-xl p-2.5">
                                            <input
                                                type="text"
                                                placeholder="Nama harta"
                                                value={row.nama}
                                                onChange={(e) => updateRow(harta, setHarta, i, 'nama', e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 col-span-2 sm:col-span-1"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Tahun"
                                                value={row.tahun_perolehan}
                                                onChange={(e) => updateRow(harta, setHarta, i, 'tahun_perolehan', e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Harga perolehan"
                                                value={row.harga_perolehan}
                                                onChange={(e) => updateRow(harta, setHarta, i, 'harga_perolehan', e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                                            />
                                            <div className="flex gap-1">
                                                <input
                                                    type="text"
                                                    placeholder="Keterangan"
                                                    value={row.keterangan}
                                                    onChange={(e) => updateRow(harta, setHarta, i, 'keterangan', e.target.value)}
                                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 flex-1 min-w-0"
                                                />
                                                {harta.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setHarta(harta.filter((_, idx) => idx !== i))}
                                                        className="text-red-400 text-xs px-1.5"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Utang */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-800">Utang</p>
                                    <button
                                        type="button"
                                        onClick={() => setUtang([...utang, emptyUtang()])}
                                        className="text-[10px] font-bold text-[#B9660A] bg-orange-50 px-2.5 py-1 rounded-full"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {utang.map((row, i) => (
                                        <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-100 rounded-xl p-2.5">
                                            <input
                                                type="text"
                                                placeholder="Nama pemberi pinjaman"
                                                value={row.nama_pemberi}
                                                onChange={(e) => updateRow(utang, setUtang, i, 'nama_pemberi', e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Tahun pinjam"
                                                value={row.tahun_pinjaman}
                                                onChange={(e) => updateRow(utang, setUtang, i, 'tahun_pinjaman', e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                                            />
                                            <div className="flex gap-1">
                                                <input
                                                    type="number"
                                                    placeholder="Jumlah"
                                                    value={row.jumlah}
                                                    onChange={(e) => updateRow(utang, setUtang, i, 'jumlah', e.target.value)}
                                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 flex-1 min-w-0"
                                                />
                                                {utang.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setUtang(utang.filter((_, idx) => idx !== i))}
                                                        className="text-red-400 text-xs px-1.5"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#1A6B3C] text-white text-xs font-bold rounded-xl py-3 shadow-sm disabled:opacity-60"
                            >
                                {processing ? 'Menyimpan...' : 'Rilis Soal'}
                            </button>
                        </div>

                        {/* ============ LIVE PREVIEW CARD ============ */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm lg:sticky lg:top-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-bold text-gray-800">Live Preview</p>
                                    <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">1770 S/SS</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mb-3">Ringkasan simulasi sebelum dirilis</p>

                                <div className="space-y-2">
                                    <Row label="Penghasilan Neto" value={formatRupiah(data.penghasilan_neto)} />
                                    <Row label={`PTKP (${data.status_ptkp})`} value={formatRupiah(preview.ptkpAmount)} />
                                    <Row label="Penghasilan Kena Pajak" value={formatRupiah(preview.pkp)} bold />
                                    <Row label="PPh Terutang" value={formatRupiah(preview.pphTerutang)} bold />
                                    <Row label="Kredit Pajak" value={formatRupiah(preview.kreditPajak)} />
                                </div>

                                <div className={`mt-3 rounded-xl p-3 ${statusStyle.bg}`}>
                                    <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1">Status Akhir</p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-black ${statusStyle.text}`}>{preview.status}</span>
                                        <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.badge}`} />
                                    </div>
                                    <p className={`text-xs font-semibold mt-0.5 ${statusStyle.text}`}>
                                        {formatRupiah(Math.abs(preview.selisih))}
                                    </p>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                                        Harta ({harta.filter(h => h.nama).length}) · Utang ({utang.filter(u => u.nama_pemberi).length})
                                    </p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Detail harta dan utang ikut tersimpan ke case_json (bagian I &amp; J) dan akan tampil di halaman pengerjaan siswa.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <TeacherBottomNav active="spt-maker" />
        </AppLayout>
    );
}

function Row({ label, value, bold = false }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">{label}</span>
            <span className={`text-xs ${bold ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{value}</span>
        </div>
    );
}
