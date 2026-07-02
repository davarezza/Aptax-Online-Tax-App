import { useState, useMemo } from 'react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';
import AnswerModal from '@/Components/Student/AnswerModal';
import EvaluationModal from '@/Components/Student/EvaluationModal';

export default function StudentTasks({ activeTasks = [], evaluationTasks = [], currentUser }) {
    const [activeTab, setActiveTab]               = useState('active');
    const [selectedEvalTaskId, setSelectedEvalTaskId] = useState(null);
    const [selectedActiveTask, setSelectedActiveTask] = useState(null);

    const selectedEvalTask = useMemo(
        () => evaluationTasks.find((t) => t.submission_id === selectedEvalTaskId) ?? null,
        [evaluationTasks, selectedEvalTaskId]
    );

    return (
        <AppLayout>
            <StudentHeader />

            <div className="flex-1 flex flex-col bg-[#F8FAFC]">
                <div className="px-5 pt-4 pb-2 shrink-0">
                    <h2 className="text-xl font-black text-[#0F172A]">My Tasks</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Complete these assignments to earn points and level up your tax knowledge!
                    </p>
                </div>

                <div className="px-4 py-2 shrink-0">
                    <div className="bg-gray-200/70 p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 text-center font-bold text-xs py-2 rounded-lg transition-all ${
                                activeTab === 'active' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                            }`}
                        >
                            Tugas Aktif ({activeTasks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('evaluation')}
                            className={`flex-1 text-center font-bold text-xs py-2 rounded-lg transition-all ${
                                activeTab === 'evaluation' ? 'bg-[#1A6B3C] text-white shadow-sm' : 'text-gray-500'
                            }`}
                        >
                            Evaluasi &amp; Feedback ({evaluationTasks.length})
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-3">
                    {activeTab === 'active' && (
                        <>
                            {activeTasks.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <span className="text-4xl mb-3">🎉</span>
                                    <p className="text-sm font-bold text-gray-500">Semua tugas sudah dikerjakan!</p>
                                    <p className="text-xs text-gray-400 mt-1">Cek tab Evaluasi untuk melihat hasil kamu.</p>
                                </div>
                            )}

                            {activeTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                                        task.is_late ? 'bg-orange-50/80 border-orange-100' : 'bg-white border-gray-100'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                                                task.is_late ? 'bg-orange-600 text-white' : 'bg-[#4ADE80] text-emerald-900'
                                            }`}>
                                                {task.status}
                                            </span>
                                            <span className={`text-[11px] font-semibold ${
                                                task.is_late ? 'text-orange-600 font-bold' : 'text-gray-500'
                                            }`}>
                                                {task.due_label}
                                            </span>
                                        </div>

                                        <h3 className="text-[15px] font-black text-gray-800 leading-tight">{task.title}</h3>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{task.description}</p>

                                        {/* Banner penalti inline jika terlambat */}
                                        {task.is_late && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1">
                                                <span>⚠️</span>
                                                <span>Pengumpulan terlambat: XP 50% · Penalti -20 Poin</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs flex-wrap">
                                            {task.is_late ? (
                                                <>
                                                    {/* XP setelah penalti */}
                                                    <span className="font-extrabold text-orange-500">
                                                        +{task.xp_reward_late} XP
                                                    </span>
                                                    <span className="line-through text-gray-300 text-[10px]">
                                                        {task.xp_reward} XP
                                                    </span>
                                                    <span className="font-bold text-red-500 text-[10px]">
                                                        -20 Poin
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="font-extrabold text-amber-500">
                                                    +{task.xp_reward} XP
                                                </span>
                                            )}
                                            <span className="text-[10px] font-semibold text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-md">
                                                {task.difficulty}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedActiveTask(task)}
                                            className={`text-xs font-bold px-7 py-2.5 rounded-xl text-white shadow-md active:scale-95 transition-all ${
                                                task.is_late ? 'bg-orange-600' : 'bg-[#1A6B3C]'
                                            }`}
                                        >
                                            {task.is_late ? 'Kerjakan' : 'Mulai'}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {evaluationTasks.length > 0 && (
                                <>
                                    <div className="flex items-center my-4 shrink-0">
                                        <div className="flex-1 h-px bg-gray-200" />
                                        <span className="px-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                            COMPLETED RECENTLY
                                        </span>
                                        <div className="flex-1 h-px bg-gray-200" />
                                    </div>
                                    {evaluationTasks.slice(0, 2).map((task) => (
                                        <div key={task.submission_id} className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 opacity-70 select-none">
                                            <div className="flex items-center gap-1.5 mb-1.5 text-emerald-600 text-xs font-bold">
                                                <span>✓</span> Done
                                            </div>
                                            <h3 className="text-[15px] font-black text-gray-400 line-through">{task.title}</h3>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
                                                <span className="text-xs font-bold text-emerald-600 whitespace-nowrap ml-2">
                                                    Score: {task.ai_score}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'evaluation' && (
                        <>
                            {evaluationTasks.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <span className="text-4xl mb-3">📋</span>
                                    <p className="text-sm font-bold text-gray-500">Belum ada tugas yang dikerjakan.</p>
                                    <p className="text-xs text-gray-400 mt-1">Selesaikan tugas aktif untuk melihat evaluasi di sini.</p>
                                </div>
                            )}

                            {evaluationTasks.map((task) => {
                                const scoreColor =
                                    task.ai_score >= 80 ? 'text-emerald-600 bg-green-50'
                                    : task.ai_score >= 50 ? 'text-amber-600 bg-amber-50'
                                    : 'text-red-600 bg-red-50';

                                return (
                                    <div key={task.submission_id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                                    {task.status}
                                                </span>
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${scoreColor}`}>
                                                    Score: {task.ai_score}%
                                                </span>
                                            </div>
                                            <h3 className="text-[15px] font-black text-gray-800 leading-tight">{task.title}</h3>
                                            <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                            <div className="text-xs">
                                                <span className="text-[10px] text-gray-400 block font-medium">Hadiah Diperoleh</span>
                                                <span className="font-extrabold text-amber-500">+{task.xp_earned} XP</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {task.feedbacks.length > 0 && (
                                                    <span className="text-[10px] text-indigo-500 font-bold">
                                                        💬 {task.feedbacks.length}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => setSelectedEvalTaskId(task.submission_id)}
                                                    className="text-xs font-bold px-5 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                                                >
                                                    Lihat Evaluasi
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            <StudentBottomNav active="tasks" />
            {selectedActiveTask && (
                <AnswerModal
                    task={selectedActiveTask}
                    routeName="student.tasks.submit"
                    routeParams={selectedActiveTask.id}
                    payloadBuilder={(answer) => ({ student_answer: answer })}
                    onClose={() => setSelectedActiveTask(null)}
                    onSubmitSuccess={() => setSelectedActiveTask(null)}
                />
            )}

            {selectedEvalTask && (
                <EvaluationModal
                    task={selectedEvalTask}
                    currentUser={currentUser}
                    onClose={() => setSelectedEvalTaskId(null)}
                />
            )}
        </AppLayout>
    );
}
