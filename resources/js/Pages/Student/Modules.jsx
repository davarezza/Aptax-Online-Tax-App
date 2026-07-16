import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';

function ModuleCard({ id, title, description, progress, isLocked, pdfUrl, onClick }) {
    const handleDownload = (e) => {
        e.stopPropagation();
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        }
    };
    return (
        <div
            onClick={!isLocked ? onClick : undefined}
            className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                isLocked
                ? 'bg-gray-50 border-gray-200 opacity-60 select-none pointer-events-none'
                : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
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
                        {!isLocked && pdfUrl && (
                            <button
                                onClick={handleDownload}
                                className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-all flex items-center gap-1 integration-download-btn"
                            >
                                📥 Lihat PDF
                            </button>
                        )}
                    </div>
                    <h3 className={`text-sm font-bold ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                        {title}
                    </h3>

                    <div
                        className="text-xs text-gray-500 mt-2 line-clamp-3 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </div>

                <div className="shrink-0">
                    {isLocked ? (
                        <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                            🔒
                        </div>
                    ) : (
                        <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                                progress === 100
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-[#1A6B3C] text-white shadow-md shadow-green-900/10'
                            }`}
                        >
                            {progress === 100 ? '🔄' : '▶️'}
                        </div>
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

export default function StudentModules() {
    const { modules = [], completedModuleIds = [], auth = {} } = usePage().props;
    const safeCompleted = Array.isArray(completedModuleIds)
        ? completedModuleIds.map(Number)
        : [];

    const processedModules = modules.map((mod, index) => {
        const isCompleted = safeCompleted.includes(Number(mod.id));

        let isLocked = false;
        if (index > 0) {
            const previousModule = modules[index - 1];
            isLocked = !safeCompleted.includes(Number(previousModule.id));
        }

        return {
            ...mod,
            progress: isCompleted ? 100 : 0,
            isLocked,
        };
    });

    const handleModuleClick = (moduleId) => {
        router.visit(route('student.modules.show', { id: moduleId }));
    };

    return (
        <AppLayout>
            <StudentHeader />

            <div className="flex-1 px-4 pt-3 pb-24 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Modul Pembelajaran</h3>
                        <p className="text-[11px] text-gray-400">Ketuk pada modul untuk mulai membaca materi pembelajaran.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {processedModules.map((mod, index) => (
                        <ModuleCard
                            key={mod.id}
                            id={index + 1}
                            title={mod.title}
                            description={mod.content}
                            progress={mod.progress}
                            isLocked={mod.isLocked}
                            pdfUrl={mod.pdf_url}
                            onClick={() => handleModuleClick(mod.id)}
                        />
                    ))}

                    {modules.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-8">Belum ada modul yang tersedia.</p>
                    )}
                </div>
            </div>

            <StudentBottomNav active="modules" />
        </AppLayout>
    );
}
