import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';
import SptStudentDetailModal from '@/Components/Student/SptSimulation/SptStudentDetailModal';

function relativeDeadline(iso, isLate) {
    const d = new Date(iso);
    const label = d.toLocaleDateString('id-ID', { weekday: 'long' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return isLate ? `Was due ${label}` : `Due ${label}`;
}

function shortDescription(text, max = 130) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max).trim() + '…' : text;
}

export default function SptSimulation({ aktif = [], selesai = [] }) {
    const [selected, setSelected] = useState(null);

    return (
        <AppLayout>
            <StudentHeader />
            <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto pb-24">
                <div className="px-4 pt-4 pb-2">
                    <h2 className="text-base font-bold text-gray-800">Tugas Aktif ({aktif.length})</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">Simulasi pengisian SPT Tahunan Orang Pribadi</p>
                </div>

                <div className="px-4 py-2 space-y-3">
                    {aktif.length === 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
                            <p className="text-2xl mb-2">🎉</p>
                            <p className="text-xs font-semibold text-gray-700">Tidak ada tugas aktif</p>
                            <p className="text-[10px] text-gray-400 mt-1">Semua simulasi SPT sudah kamu kerjakan.</p>
                        </div>
                    )}

                    {aktif.map((a) => (
                        <button
                            key={a.id}
                            onClick={() => setSelected(a)}
                            className={`w-full text-left rounded-2xl p-4 shadow-sm border active:opacity-80 ${
                                a.is_late ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                        a.is_late ? 'bg-orange-500 text-white' : 'bg-[#1A6B3C] text-white'
                                    }`}
                                >
                                    {a.is_late ? 'Late' : 'Active'}
                                </span>
                                <span className={`text-[10px] font-semibold ${a.is_late ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {relativeDeadline(a.deadline, a.is_late)}
                                </span>
                            </div>

                            <h3 className="text-sm font-bold text-gray-800 leading-snug">{a.title}</h3>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{shortDescription(a.description)}</p>

                            {a.is_late && (
                                <div className="mt-3 bg-white/70 border border-orange-200 rounded-xl px-3 py-2">
                                    <p className="text-[10px] font-semibold text-orange-600">
                                        ⚠️ Pengumpulan terlambat: XP 50% · Penalti −20 Poin
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    {a.is_late ? (
                                        <>
                                            <span className="text-xs font-bold text-orange-500">+{Math.floor(a.xp_reward * 0.5)} XP</span>
                                            <span className="text-[10px] text-gray-300 line-through">{a.xp_reward} XP</span>
                                        </>
                                    ) : (
                                        <span className="text-xs font-bold text-[#1A6B3C]">+{a.xp_reward} XP</span>
                                    )}
                                    <span className="bg-gray-100 text-gray-500 text-[9px] font-semibold px-2 py-1 rounded-full">1770 S/SS</span>
                                    {a.has_started && (
                                        <span className="bg-blue-50 text-blue-600 text-[9px] font-semibold px-2 py-1 rounded-full">Sedang Dikerjakan</span>
                                    )}
                                </div>
                                <span className={`text-xs font-bold ${a.is_late ? 'text-orange-500' : 'text-[#1A6B3C]'}`}>
                                    Lihat Detail →
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {selesai.length > 0 && (
                    <>
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-[10px] font-bold text-gray-400 tracking-wide">SELESAI BARU-BARU INI</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <div className="px-4 pb-4 space-y-2.5">
                            {selesai.map((a) => (
                                <Link
                                    key={a.id}
                                    href={route('student.spt-simulation.wizard', a.id)}
                                    className="block bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">Selesai</span>
                                        <span className="text-[10px] font-semibold text-[#1A6B3C]">Skor {a.final_score}</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">{a.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Nomor BPE: {a.bpe_number}</p>
                                    <p className="text-[10px] font-semibold text-[#1A6B3C] mt-2">Lihat Hasil &amp; Unduh BPE →</p>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <SptStudentDetailModal assignment={selected} onClose={() => setSelected(null)} />
            <StudentBottomNav active="spt-simulation" />
        </AppLayout>
    );
}
