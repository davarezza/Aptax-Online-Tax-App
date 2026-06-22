import { useState } from 'react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';

function ModuleCard({ id, title, description, progress, isLocked, onClick }) {
    return (
        <div
            className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                isLocked
                ? 'bg-gray-50 border-gray-200 opacity-60 select-none'
                : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5'
            }`}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isLocked ? 'bg-gray-200 text-gray-500' : 'bg-green-50 text-[#1A6B3C]'
                        }`}>
                            Modul {id}
                        </span>
                        {progress === 100 && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                🎉 Selesai
                            </span>
                        )}
                    </div>
                    <h3 className={`text-sm font-bold ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                        {title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                        {description}
                    </p>
                </div>

                <div className="shrink-0">
                    {isLocked ? (
                        <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                            🔒
                        </div>
                    ) : (
                        <button
                            onClick={onClick}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-90 ${
                                progress === 100
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-[#1A6B3C] text-white hover:bg-[#155430] shadow-md shadow-green-900/10'
                            }`}
                            title={progress == 100 ? "Ulangi Modul" : "Pelajari Modul"}
                        >
                            {progress === 100 ? '🔄' : '▶️'}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-medium text-gray-400">Progress Belajar</span>
                    <span className={`text-[11px] font-black ${isLocked ? 'text-gray-400' : 'text-[#1A6B3C]'}`}>
                        {progress}%
                    </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${
                            progress === 100
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                            : 'bg-gradient-to-r from-[#1A6B3C] to-[#34C27A]'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {!isLocked && progress === 0 && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping m-3" />
            )}
        </div>
    );
}

export default function StudentLearn() {
    const [modules, setModules] = useState([
        {
            id: 1,
            title: "Pengantar Hukum Pajak & KUP",
            description: "Belajar dasar perpajakan, asas pemungutan pajak, dan hak-kewajiban wajib pajak di Indonesia.",
            progress: 0,
            isLocked: false
        },
        {
            id: 2,
            title: "Mekanisme PPh Orang Pribadi",
            description: "Simulasi perhitungan PTKP, tarif progresif Pasal 17, dan pelaporan SPT Tahunan OP.",
            progress: 0,
            isLocked: true
        },
        {
            id: 3,
            title: "Pajak Penghasilan (PPh) Badan",
            description: "Analisis laporan keuangan fiskal, penyesuaian/koreksi fiskal, dan tarif PPh Badan.",
            progress: 0,
            isLocked: true
        }
    ]);

    const handleModuleClick = (moduleId) => {
        setModules(prevModules => {
            return prevModules.map((mod, index) => {
                if (mod.id === moduleId) {
                    const newProgress = Math.min(mod.progress + 25, 100);
                    const updatedCurrentModule = { ...mod, progress: newProgress };
                    if (newProgress === 100 && prevModules[index + 1]) {
                        setTimeout(() => {
                            setModules(latestModules =>
                                latestModules.map((m, idx) =>
                                    idx === index + 1 ? { ...m, isLocked: false } : m
                                )
                            );
                        }, 100);
                    }

                    return updatedCurrentModule;
                }
                return mod;
            });
        });
    };

    const resetDemo = () => {
        setModules([
            { id: 1, title: "Pengantar Hukum Pajak & KUP", description: "Belajar dasar perpajakan, asas pemungutan pajak, dan hak-kewajiban wajib pajak di Indonesia.", progress: 0, isLocked: false },
            { id: 2, title: "Mekanisme PPh Orang Pribadi", description: "Simulasi perhitungan PTKP, tarif progresif Pasal 17, dan pelaporan SPT Tahunan OP.", progress: 0, isLocked: true },
            { id: 3, title: "Pajak Penghasilan (PPh) Badan", description: "Analisis laporan keuangan fiskal, penyesuaian/koreksi fiskal, dan tarif PPh Badan.", progress: 0, isLocked: true }
        ]);
    };

    const totalProgress = Math.round(
        modules.reduce((acc, m) => acc + m.progress, 0) / modules.length
    );

    return (
        <AppLayout>
            <StudentHeader notifCount={1} streakDays={3} userName="A" />
            <div className="flex-1 px-4 pt-3 pb-24 overflow-y-auto space-y-4">
                <div className="bg-gradient-to-br from-[#1A6B3C] to-[#268a50] rounded-2xl p-4 text-white shadow-lg shadow-green-950/10 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 text-8xl">
                        📚
                    </div>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-md font-bold tracking-widest uppercase">
                        Kurikulum Pajak 2026
                    </span>
                    <h2 className="text-base font-extrabold mt-1">Sertifikasi Brevet Pajak A</h2>
                    <p className="text-xs text-green-100/80 mt-0.5">Selesaikan seluruh modul untuk membuka ujian sertifikat.</p>

                    <div className="mt-4 flex items-center gap-3 bg-black/10 rounded-xl p-2.5">
                        <div className="flex-1">
                            <div className="flex justify-between text-[10px] mb-1 font-semibold text-green-200">
                                <span>Total Kurikulum Selesai</span>
                                <span>{totalProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${totalProgress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Modul Pembelajaran</h3>
                        <p className="text-[11px] text-gray-400">Ketuk tombol ▶️ untuk simulasi progres +25%</p>
                    </div>
                    <button
                        onClick={resetDemo}
                        className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-all"
                    >
                        🔄 Reset Demo
                    </button>
                </div>

                <div className="space-y-3">
                    {modules.map((mod) => (
                        <ModuleCard
                            key={mod.id}
                            id={mod.id}
                            title={mod.title}
                            description={mod.description}
                            progress={mod.progress}
                            isLocked={mod.isLocked}
                            onClick={() => handleModuleClick(mod.id)}
                        />
                    ))}
                </div>
            </div>

            <StudentBottomNav active="learn" />
        </AppLayout>
    );
}
