import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';

export default function ModuleDetail() {
    const { module, isCompleted, nextModuleId, auth = {} } = usePage().props;

    const handleComplete = () => {
        router.post(route('student.modules.complete', { id: module.id }), {}, {
            preserveScroll: false,
            onSuccess: () => {
                if (nextModuleId) {
                    router.visit(route('student.modules.show', { id: nextModuleId }));
                } else {
                    router.visit(route('student.modules'));
                }
            },
        });
    };

    const handleBack = () => {
        router.visit(route('student.modules'));
    };

    const handleDownloadPdf = () => {
        if (module.pdf_url) {
            window.open(module.pdf_url, '_blank');
        }
    };

    return (
        <AppLayout>
            <StudentHeader />
                <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <button
                        onClick={handleBack}
                        className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all"
                    >
                        ←
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#1A6B3C] uppercase tracking-wider">Modul Pembelajaran</p>
                        <h1 className="text-sm font-black text-gray-800 truncate">{module.title}</h1>
                    </div>

                    {module.pdf_url && (
                        <button
                            onClick={handleDownloadPdf}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-xs font-bold flex items-center gap-1"
                            title="Lihat PDF"
                        >
                            📥 <span className="hidden sm:inline">Lihat PDF</span>
                        </button>
                    )}

                    {isCompleted && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                            🎉 Selesai
                        </span>
                    )}
                </div>

            <div className="flex-1 px-4 pt-4 pb-28 overflow-y-auto flex flex-col justify-between">

                <div
                    className="prose prose-sm max-w-none text-gray-700 mb-6
                        prose-headings:text-gray-800 prose-headings:font-black
                        prose-p:leading-relaxed prose-p:text-gray-600
                        prose-strong:text-gray-800
                        prose-ul:text-gray-600 prose-ol:text-gray-600
                        prose-li:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: module.content }}
                />

                <div className="pt-4 border-t border-gray-100 bg-white w-full">
                    {isCompleted ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-bold transition-all active:scale-95 hover:bg-gray-50"
                            >
                                ← Kembali ke Daftar
                            </button>
                            {nextModuleId && (
                                <button
                                    onClick={() => router.visit(route('student.modules.show', { id: nextModuleId }))}
                                    className="flex-1 py-3 rounded-2xl bg-[#1A6B3C] text-white text-sm font-bold shadow-md shadow-green-900/10 transition-all active:scale-95 hover:bg-[#155430]"
                                >
                                    Modul Berikutnya →
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleComplete}
                            className="w-full py-3.5 rounded-2xl bg-[#1A6B3C] text-white text-sm font-black shadow-md shadow-green-900/10 transition-all active:scale-95 hover:bg-[#155430]"
                        >
                            ✔️ Tandai Selesai Baca
                        </button>
                    )}
                </div>
            </div>

            <StudentBottomNav active="modules" />
        </AppLayout>
    );
}
