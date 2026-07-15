import { useMemo, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';

/** PTKP tahunan (harus persis sinkron dengan SptCaseGeneratorService.php). */
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

/** Lapisan tarif Pasal 17 UU HPP (harus persis sinkron dengan backend). */
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

const STEPS = [
    { key: 'soal', label: 'Info Soal' },
    { key: 'wp', label: 'Wajib Pajak' },
    { key: 'data', label: 'Data Utama' },
    { key: 'aset', label: 'Harta & Utang' },
    { key: 'preview', label: 'Preview & Rilis' },
];

const inputClass =
    'w-full mt-1.5 text-sm border border-gray-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#3F9464] focus:border-transparent';
const labelClass = 'text-xs font-semibold text-gray-500';

export default function SptMakerWizard({ kelasAktif = null }) {
    const [stepIndex, setStepIndex] = useState(0);
    const [harta, setHarta] = useState([emptyHarta()]);
    const [utang, setUtang] = useState([emptyUtang()]);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        xp_reward: 100,
        deadline: '',
        is_released: false,
        nama_wp: '',
        pemberi_kerja: '',
        tahun_pajak: new Date().getFullYear(),
        penghasilan_neto: '',
        status_ptkp: 'TK/0',
        kredit_pajak: '',
        punya_penghasilan_final: false,
        sumber_penghasilan_final: '',
        penghasilan_final_bruto: '',
        penghasilan_final_pph: '',
    });

    // --- Live preview (dihitung di client, dicek ulang oleh backend saat submit) ---
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

    // Validasi ringan sebelum lanjut ke step berikutnya (validasi penuh tetap di backend).
    const canProceed = useMemo(() => {
        switch (STEPS[stepIndex].key) {
            case 'soal':
                return Boolean(data.title && data.deadline);
            case 'wp':
                return Boolean(data.nama_wp && data.tahun_pajak);
            case 'data':
                return data.penghasilan_neto !== '' && Number(data.penghasilan_neto) >= 0;
            default:
                return true;
        }
    }, [stepIndex, data]);

    function goNext() {
        if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
    }

    function goBack() {
        if (stepIndex > 0) setStepIndex(stepIndex - 1);
    }

    function submit() {
        setData((prev) => ({ ...prev, harta, utang }));
        setTimeout(() => {
            post(route('teacher.spt-maker.store'));
        }, 0);
    }

    const isLastStep = stepIndex === STEPS.length - 1;

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto bg-[#F4F6F9] pb-28">
                <TeacherHeader />

                {/* Header halaman + progress stepper */}
                <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href={route('teacher.spt-maker.index')}
                            className="text-gray-400 text-lg leading-none px-1 -ml-1"
                        >
                            ←
                        </Link>
                        <h2 className="text-base font-bold text-gray-800 flex-1">Buat Soal SPT</h2>
                        <span className="bg-[#1A6B3C] text-white text-[9px] font-bold px-2 py-1 rounded-full shrink-0">
                            1770 S/SS
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-3 ml-7">
                        {kelasAktif ? `Soal untuk kelas ${kelasAktif.class_name}` : 'Belum ada kelas yang diampu'}
                    </p>

                    <div className="flex items-center gap-1.5 mb-1.5">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.key}
                                className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? 'bg-[#1A6B3C]' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">
                        Langkah {stepIndex + 1}/{STEPS.length} · {STEPS[stepIndex].label}
                    </p>
                </div>

                <div className="px-4 pb-4">
                    {/* ============ STEP 1: INFO SOAL ============ */}
                    {STEPS[stepIndex].key === 'soal' && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                            {kelasAktif ? (
                                <div className="flex items-center gap-2.5 bg-green-50 rounded-xl p-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#1A6B3C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                        {kelasAktif.class_name?.charAt(0) ?? 'K'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-[#1A6B3C] font-bold uppercase tracking-wide">Kelas Anda</p>
                                        <p className="text-xs font-semibold text-gray-800 truncate">{kelasAktif.class_name}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-orange-50 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-[#B9660A]">Anda belum terdaftar sebagai wali kelas manapun.</p>
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Judul Soal</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Simulasi SPT Tahunan - Karyawan Swasta"
                                    className={inputClass}
                                />
                                {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Deadline</label>
                                <input
                                    type="datetime-local"
                                    value={data.deadline}
                                    onChange={(e) => setData('deadline', e.target.value)}
                                    className={inputClass}
                                />
                                {errors.deadline && <p className="text-[10px] text-red-500 mt-1">{errors.deadline}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>XP Reward</label>
                                <input
                                    type="number"
                                    value={data.xp_reward}
                                    onChange={(e) => setData('xp_reward', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <label className="flex items-center gap-2.5 pt-1">
                                <input
                                    type="checkbox"
                                    checked={data.is_released}
                                    onChange={(e) => setData('is_released', e.target.checked)}
                                    className="w-4.5 h-4.5 accent-[#1A6B3C]"
                                />
                                <span className="text-xs text-gray-600">Rilis langsung ke siswa setelah disimpan</span>
                            </label>
                        </div>
                    )}

                    {/* ============ STEP 2: WAJIB PAJAK ============ */}
                    {STEPS[stepIndex].key === 'wp' && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                            <div>
                                <label className={labelClass}>Nama Wajib Pajak</label>
                                <input
                                    type="text"
                                    value={data.nama_wp}
                                    onChange={(e) => setData('nama_wp', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className={inputClass}
                                />
                                {errors.nama_wp && <p className="text-[10px] text-red-500 mt-1">{errors.nama_wp}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Tahun Pajak</label>
                                <input
                                    type="number"
                                    value={data.tahun_pajak}
                                    onChange={(e) => setData('tahun_pajak', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Nama Pemberi Kerja</label>
                                <input
                                    type="text"
                                    value={data.pemberi_kerja}
                                    onChange={(e) => setData('pemberi_kerja', e.target.value)}
                                    placeholder="Contoh: PT Maju Jaya"
                                    className={inputClass}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Dipakai untuk narasi studi kasus (Bukti Potong 1721-A1). Boleh dikosongkan.</p>
                            </div>
                        </div>
                    )}

                    {/* ============ STEP 3: DATA UTAMA ============ */}
                    {STEPS[stepIndex].key === 'data' && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                            <div>
                                <label className={labelClass}>Penghasilan Neto Setahun</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={data.penghasilan_neto}
                                    onChange={(e) => setData('penghasilan_neto', e.target.value)}
                                    placeholder="0"
                                    className={inputClass}
                                />
                                {errors.penghasilan_neto && <p className="text-[10px] text-red-500 mt-1">{errors.penghasilan_neto}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Status PTKP</label>
                                <select
                                    value={data.status_ptkp}
                                    onChange={(e) => setData('status_ptkp', e.target.value)}
                                    className={inputClass}
                                >
                                    {Object.keys(PTKP_RATES).map((s) => (
                                        <option key={s} value={s}>{s} — {formatRupiah(PTKP_RATES[s])}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Kredit Pajak (dipotong pihak lain)</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={data.kredit_pajak}
                                    onChange={(e) => setData('kredit_pajak', e.target.value)}
                                    placeholder="0"
                                    className={inputClass}
                                />
                            </div>

                            <div className="pt-1 border-t border-gray-100">
                                <label className="flex items-center gap-2.5 pt-3">
                                    <input
                                        type="checkbox"
                                        checked={data.punya_penghasilan_final}
                                        onChange={(e) => setData('punya_penghasilan_final', e.target.checked)}
                                        className="w-4.5 h-4.5 accent-[#1A6B3C]"
                                    />
                                    <span className="text-xs text-gray-600">WP punya penghasilan final (bunga tabungan, dividen, dll.)</span>
                                </label>

                                {data.punya_penghasilan_final && (
                                    <div className="mt-3 space-y-3 bg-gray-50 rounded-xl p-3">
                                        <div>
                                            <label className={labelClass}>Sumber Penghasilan Final</label>
                                            <input
                                                type="text"
                                                value={data.sumber_penghasilan_final}
                                                onChange={(e) => setData('sumber_penghasilan_final', e.target.value)}
                                                placeholder="Contoh: bunga tabungan bank"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className={labelClass}>Jumlah Bruto</label>
                                                <input
                                                    type="number"
                                                    value={data.penghasilan_final_bruto}
                                                    onChange={(e) => setData('penghasilan_final_bruto', e.target.value)}
                                                    placeholder="0"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>PPh Final Dipotong</label>
                                                <input
                                                    type="number"
                                                    value={data.penghasilan_final_pph}
                                                    onChange={(e) => setData('penghasilan_final_pph', e.target.value)}
                                                    placeholder="0"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ============ STEP 4: HARTA & UTANG ============ */}
                    {STEPS[stepIndex].key === 'aset' && (
                        <div className="space-y-3">
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-800">Harta Bergerak</p>
                                    <button
                                        type="button"
                                        onClick={() => setHarta([...harta, emptyHarta()])}
                                        className="text-[10px] font-bold text-[#1A6B3C] bg-green-50 px-2.5 py-1.5 rounded-full"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                                <div className="space-y-2.5">
                                    {harta.map((row, i) => (
                                        <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Harta #{i + 1}</span>
                                                {harta.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setHarta(harta.filter((_, idx) => idx !== i))}
                                                        className="text-red-400 text-[10px] font-semibold"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Nama harta (mis. Mobil, Tabungan)"
                                                value={row.nama}
                                                onChange={(e) => updateRow(harta, setHarta, i, 'nama', e.target.value)}
                                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Tahun perolehan"
                                                    value={row.tahun_perolehan}
                                                    onChange={(e) => updateRow(harta, setHarta, i, 'tahun_perolehan', e.target.value)}
                                                    className="text-sm border border-gray-200 rounded-lg px-3 py-2.5"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Harga perolehan"
                                                    value={row.harga_perolehan}
                                                    onChange={(e) => updateRow(harta, setHarta, i, 'harga_perolehan', e.target.value)}
                                                    className="text-sm border border-gray-200 rounded-lg px-3 py-2.5"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Keterangan (opsional)"
                                                value={row.keterangan}
                                                onChange={(e) => updateRow(harta, setHarta, i, 'keterangan', e.target.value)}
                                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-800">Utang</p>
                                    <button
                                        type="button"
                                        onClick={() => setUtang([...utang, emptyUtang()])}
                                        className="text-[10px] font-bold text-[#B9660A] bg-orange-50 px-2.5 py-1.5 rounded-full"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                                <div className="space-y-2.5">
                                    {utang.map((row, i) => (
                                        <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Utang #{i + 1}</span>
                                                {utang.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setUtang(utang.filter((_, idx) => idx !== i))}
                                                        className="text-red-400 text-[10px] font-semibold"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Nama pemberi pinjaman"
                                                value={row.nama_pemberi}
                                                onChange={(e) => updateRow(utang, setUtang, i, 'nama_pemberi', e.target.value)}
                                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Tahun pinjam"
                                                    value={row.tahun_pinjaman}
                                                    onChange={(e) => updateRow(utang, setUtang, i, 'tahun_pinjaman', e.target.value)}
                                                    className="text-sm border border-gray-200 rounded-lg px-3 py-2.5"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Jumlah"
                                                    value={row.jumlah}
                                                    onChange={(e) => updateRow(utang, setUtang, i, 'jumlah', e.target.value)}
                                                    className="text-sm border border-gray-200 rounded-lg px-3 py-2.5"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ STEP 5: PREVIEW & RILIS ============ */}
                    {STEPS[stepIndex].key === 'preview' && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-gray-800">Live Preview</p>
                                <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">1770 S/SS</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mb-3">Cek ringkasan sebelum merilis soal ini</p>

                            <div className="space-y-2.5">
                                <Row label="Nama WP" value={data.nama_wp || '-'} />
                                <Row label="Tahun Pajak" value={data.tahun_pajak} />
                                <Row label="Penghasilan Neto" value={formatRupiah(data.penghasilan_neto)} />
                                <Row label={`PTKP (${data.status_ptkp})`} value={formatRupiah(preview.ptkpAmount)} />
                                <Row label="Penghasilan Kena Pajak" value={formatRupiah(preview.pkp)} bold />
                                <Row label="PPh Terutang" value={formatRupiah(preview.pphTerutang)} bold />
                                <Row label="Kredit Pajak" value={formatRupiah(preview.kreditPajak)} />
                                {data.pemberi_kerja && <Row label="Pemberi Kerja" value={data.pemberi_kerja} />}
                                {data.punya_penghasilan_final && (
                                    <Row
                                        label={`Penghasilan Final (${data.sumber_penghasilan_final || '-'})`}
                                        value={formatRupiah(data.penghasilan_final_bruto)}
                                    />
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                                Penghasilan final dikenakan pajak tersendiri dan tidak memengaruhi perhitungan PPh Terutang di atas.
                            </p>

                            <div className={`mt-3 rounded-xl p-3.5 ${statusStyle.bg}`}>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1">Status Akhir</p>
                                <div className="flex items-center justify-between">
                                    <span className={`text-base font-black ${statusStyle.text}`}>{preview.status}</span>
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
                    )}
                </div>

                <div className="bottom-20 z-10 px-4">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-2.5 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={stepIndex === 0}
                            className="flex-1 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl py-3 disabled:opacity-40"
                        >
                            Kembali
                        </button>
                        {isLastStep ? (
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing || !kelasAktif}
                                className="flex-[2] text-xs font-bold text-white bg-[#1A6B3C] rounded-xl py-3 shadow-sm disabled:opacity-60"
                            >
                                {processing ? 'Menyimpan...' : 'Rilis Soal'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={!canProceed}
                                className="flex-[2] text-xs font-bold text-white bg-[#1A6B3C] rounded-xl py-3 shadow-sm disabled:opacity-40"
                            >
                                Lanjut
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <TeacherBottomNav active="spt-maker" />
        </AppLayout>
    );
}

function Row({ label, value, bold = false }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-gray-500 shrink-0">{label}</span>
            <span className={`text-xs text-right truncate ${bold ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{value}</span>
        </div>
    );
}
