import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';

export default function TeacherDashboard() {
    const stats = [
        { label: 'Siswa Aktif', value: '142', icon: '👥', color: 'bg-blue-50 border-blue-100 text-blue-700' },
        { label: 'Rata-rata Selesai', value: '78%', icon: '✅', color: 'bg-green-50 border-green-100 text-green-700' },
        { label: 'Kelas Terbaik', value: '12-B', icon: '⭐', color: 'bg-amber-50 border-amber-100 text-amber-700' },
        { label: 'Butuh Bantuan', value: '6', icon: '🆘', color: 'bg-red-50 border-red-100 text-red-700' },
    ];

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto bg-[#F4F6F9] pb-20">
                <TeacherHeader teacherName="Mr. Davis" teacherRole="Guru Perpajakan" initials="D" isOnline />

                <div className="px-4 py-4 space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Selamat pagi, Mr. Davis! 👋</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Ini ringkasan kelas Anda hari ini.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        {stats.map((s) => (
                            <div key={s.label} className={`border rounded-2xl p-3.5 ${s.color}`}>
                                <div className="text-xl mb-1">{s.icon}</div>
                                <p className="text-xl font-black leading-none">{s.value}</p>
                                <p className="text-[10px] font-medium mt-1 opacity-70">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-red-100 rounded-2xl p-3.5 flex gap-3 shadow-sm">
                        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0 text-base">📢</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Pengumuman Penting</span>
                                <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Action Required</span>
                            </div>
                            <p className="text-xs font-semibold text-gray-800">Reminder: Deadline Pengumpulan SPT</p>
                            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                Kelas 10-A harus kumpulkan SPT simulasi sebelum Jumat 17:00. <strong>12 siswa</strong> masih pending.
                            </p>
                        </div>
                        <button className="shrink-0 self-start bg-[#1A6B3C] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap hover:bg-[#155C34] transition-colors">
                            Review →
                        </button>
                    </div>
                </div>
            </div>

            <TeacherBottomNav active="dashboard" />
        </AppLayout>
    );
}
