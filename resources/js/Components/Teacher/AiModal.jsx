export function AiModal({ onClose }) {
    const struggles = [
        { pct: 65, text: 'Siswa kesulitan pada perhitungan PTKP untuk status K/I/3 dalam skenario PPh 21 masa.' },
        { pct: 54, text: 'Kesalahan berulang pada penentuan DPP (Dasar Pengenaan Pajak) untuk transaksi PPN lintas sektor.' },
        { pct: 41, text: 'Soal rekonsiliasi fiskal memiliki tingkat skip tertinggi — indikasi materi belum dipahami.' },
        { pct: 38, text: 'Deadline pelaporan SPT Masa PPh 23 masih sering tertukar dengan batas penyetoran.' },
    ];

    const actions = [
        { icon: '📋', text: 'Selenggarakan 1 sesi ulasan khusus materi PTKP & tarif progresif PPh 21 sebelum kuis akhir dirilis.' },
        { icon: '🎯', text: 'Rilis soal latihan bertarget tentang DPP PPN — fokus pada transaksi jasa lintas sektor.' },
        { icon: '💡', text: 'Tambahkan modul mini "Rekonsiliasi Fiskal untuk Pemula" sebagai materi remedial opsional.' },
        { icon: '⏰', text: 'Buat tabel visual deadline pelaporan pajak sebagai referensi cepat yang bisa diakses siswa kapan saja.' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">AI Overview</p>
                                <h2 className="text-base font-extrabold text-gray-900 leading-tight">Laporan Analitik Kelas</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">📊 Executive Summary</p>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Secara keseluruhan pemahaman konsep dasar PPN mengalami peningkatan signifikan (+12%) dibanding minggu lalu. Namun terjadi penurunan akurasi pada perhitungan PPh 21 masa, terutama pada komponen PTKP dan tarif progresif. Tingkat penyelesaian tugas mingguan mencapai 78%, sedikit di bawah target 85%.
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">🔍 Student Struggle Points</p>
                        <div className="space-y-2.5">
                            {struggles.map((s, i) => (
                                <div key={i} className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 flex items-start gap-3">
                                    <span className="shrink-0 mt-0.5 w-10 text-center text-xs font-extrabold text-rose-600 bg-rose-100 rounded-xl py-1">{s.pct}%</span>
                                    <p className="text-sm text-gray-700 leading-relaxed">{s.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">🎯 Personalized Action Plan</p>
                        <div className="space-y-2.5">
                            {actions.map((a, i) => (
                                <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-3">
                                    <span className="text-base shrink-0">{a.icon}</span>
                                    <p className="text-sm text-gray-700 leading-relaxed">{a.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-2" />
                </div>

                <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                    <button onClick={onClose} className="w-full py-3 rounded-2xl bg-[#1A6B3C] text-white font-bold text-sm hover:opacity-90 transition-opacity">
                        Tutup Laporan
                    </button>
                </div>
            </div>
        </div>
    );
}
