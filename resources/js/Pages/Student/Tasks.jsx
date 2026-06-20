import { useState } from 'react';
import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';
// Import komponen modal yang baru saja dipisahkan
import EvaluationModal from '@/Components/Student/EvaluationModal';

export default function StudentTasks() {
    const [activeTab, setActiveTab] = useState('active');
    const [selectedTask, setSelectedTask] = useState(null);

    // Mock Data
    const activeTasks = [
        {
            id: 1,
            title: "Introduction to PPh 21",
            due: "Due: Tomorrow, 11:59 PM",
            description: "Understand the basics of Income Tax Article 21, including subjects, objects, and how to...",
            xp: "+50 XP",
            duration: "15 mins",
            status: "Active"
        },
        {
            id: 2,
            title: "VAT (PPN) Fundamentals",
            due: "Due: Friday",
            description: "A quick quiz on Value Added Tax principles and recognizing taxable goods versus non-taxable",
            xp: "+75 XP",
            duration: "20 mins",
            status: "Active"
        },
        {
            id: 3,
            title: "Filing Deadlines Challenge",
            due: "Was due: Yesterday",
            description: "Match the tax types to their correct monthly and annual reporting deadlines. Penalty for...",
            xp: "50 XP",
            oldXp: "100 XP",
            status: "Late"
        }
    ];

    const completedTasks = [
        {
            id: 4,
            title: "Setup Your Profile",
            description: "Initial onboarding and avatar selection.",
            score: "Score: 100%",
            xp: "+20 XP",
            status: "Reviewed",
            aiFeedback: "Profil kamu sudah lengkap dan informatif. Pemilihan avatar mencerminkan semangat belajar yang baik. Pastikan data kontak selalu diperbarui agar guru bisa menghubungimu dengan mudah."
        },
        {
            id: 5,
            title: "Kuis Dasar Hukum Pajak & UU KUP",
            description: "Menguji pemahaman dasar tata cara perpajakan, nomor pokok wajib pajak, dan hak keberatan.",
            score: "Score: 85%",
            xp: "+50 XP",
            status: "Reviewed",
            aiFeedback: "Skor sangat baik pada komponen asas pemungutan hukum materiil. Sedikit kekeliruan terdeteksi pada penghitungan sanksi administrasi bunga Pasal 9 Ayat 2a UU KUP. Pelajari kembali skema penyesuaian bunga berjalannya."
        }
    ];

    return (
        <AppLayout>
            <StudentHeader notifCount={1} streakDays={3} userName="A" />

            <div className="flex-1 flex flex-col bg-[#F8FAFC]">
                {/* Title Section */}
                <div className="px-5 pt-4 pb-2 shrink-0">
                    <h2 className="text-xl font-black text-[#0F172A]">My Tasks</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Complete these assignments to earn points and level up your tax knowledge!</p>
                </div>

                {/* Tab Filter */}
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
                            Evaluasi & Feedback ({completedTasks.length})
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-3">

                    {/* ── TAB TUGAS AKTIF ── */}
                    {activeTab === 'active' && activeTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                                task.status === 'Late' ? 'bg-red-50/80 border-red-100' : 'bg-white border-gray-100'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                                        task.status === 'Late' ? 'bg-red-600 text-white' : 'bg-[#4ADE80] text-emerald-900'
                                    }`}>
                                        {task.status}
                                    </span>
                                    <span className={`text-[11px] font-semibold ${task.status === 'Late' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                        {task.due}
                                    </span>
                                </div>
                                <h3 className="text-[15px] font-black text-gray-800 leading-tight">{task.title}</h3>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="font-extrabold text-amber-500 flex items-center gap-1">
                                        {task.status === 'Late' && <span className="line-through text-gray-300 font-normal mr-1">{task.oldXp}</span>}
                                        {task.xp}
                                    </span>
                                    {task.duration && <span className="text-gray-400 font-medium">⏱️ {task.duration}</span>}
                                </div>
                                <button className={`text-xs font-bold px-7 py-2.5 rounded-xl text-white shadow-md ${
                                    task.status === 'Late' ? 'bg-red-800' : 'bg-[#1A6B3C]'
                                }`}>
                                    Mulai
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* ── TAB EVALUASI & FEEDBACK ── */}
                    {activeTab === 'evaluation' && completedTasks.map((task) => (
                        <div key={task.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                        {task.status}
                                    </span>
                                    <span className="text-xs font-black text-[#1A6B3C] bg-green-50 px-2 py-0.5 rounded-lg">
                                        {task.score}
                                    </span>
                                </div>
                                <h3 className="text-[15px] font-black text-gray-800 leading-tight">{task.title}</h3>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-xs">
                                    <span className="text-[10px] text-gray-400 block font-medium">Hadiah Diperoleh</span>
                                    <span className="font-extrabold text-amber-500">{task.xp}</span>
                                </div>
                                <button
                                    onClick={() => setSelectedTask(task)}
                                    className="text-xs font-bold px-5 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                                >
                                    Lihat Evaluasi
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Section Label: Completed Recently */}
                    {activeTab === 'active' && (
                        <>
                            <div className="flex items-center my-4 shrink-0">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="px-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">COMPLETED RECENTLY</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 opacity-70 select-none">
                                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-600 text-xs font-bold">
                                    <span>✓</span> Done
                                </div>
                                <h3 className="text-[15px] font-black text-gray-400 line-through">Setup Your Profile</h3>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-400">Initial onboarding and avatar selection.</p>
                                    <span className="text-xs font-bold text-emerald-600 whitespace-nowrap ml-2">Score: 100%</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <StudentBottomNav active="tasks" />

            {/* Render Modal Evaluasi secara kondisional jika data terpilih */}
            {selectedTask && (
                <EvaluationModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </AppLayout>
    );
}
