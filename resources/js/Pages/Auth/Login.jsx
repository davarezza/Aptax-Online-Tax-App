import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Components/AppLayout';

// ─── Ikon SVG kecil biar tidak perlu install library ikon dulu ───────────────
const IconUser   = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);
const IconKey    = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
    </svg>
);
const IconMail   = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);
const IconCode   = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

// Konfigurasi tema warna berdasarkan role
const THEME = {
    siswa: {
        accent:        'text-orange-500',
        accentBg:      'bg-orange-500',
        accentHover:   'hover:bg-orange-600',
        accentBorder:  'border-orange-400',
        accentLight:   'bg-orange-50',
        accentRing:    'focus:ring-orange-300',
        tabActive:     'bg-orange-500 text-white shadow',
        tabInactive:   'text-gray-500 hover:text-orange-500',
        subtitle:      'Welcome to Tax City',
        logoDecor:     'text-orange-200',
    },
    guru: {
        accent:        'text-green-600',
        accentBg:      'bg-green-600',
        accentHover:   'hover:bg-green-700',
        accentBorder:  'border-green-400',
        accentLight:   'bg-green-50',
        accentRing:    'focus:ring-green-300',
        tabActive:     'bg-green-600 text-white shadow',
        tabInactive:   'text-gray-500 hover:text-green-600',
        subtitle:      'Dashboard Pengajar',
        logoDecor:     'text-green-200',
    },
};

// ─── Input Field dengan ikon kiri ────────────────────────────────────────────
function InputField({ icon, placeholder, type = 'text', value, onChange, accentRing }) {
    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
            </span>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`
                    w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                    bg-white text-gray-800 text-sm placeholder-gray-400
                    outline-none focus:ring-2 ${accentRing} focus:border-transparent
                    transition-all duration-200
                `}
            />
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Login() {
    // 'siswa' | 'guru'
    const [role, setRole] = useState('siswa');
    // 'masuk' | 'daftar'
    const [mode, setMode] = useState('masuk');

    const theme = THEME[role];

    // useForm Inertia — nanti tinggal hubungkan ke endpoint controller
    const { data, setData, post, processing, errors } = useForm({
        role,
        name:       '',
        email:      '',
        password:   '',
        class_code: '',      // untuk siswa: kode kelas unik dari guru
        teacher_code: '',    // untuk guru: kode akses khusus guru
    });

    // Sync role ke useForm saat toggle berubah
    const handleRoleSwitch = (newRole) => {
        setRole(newRole);
        setData('role', newRole);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = mode === 'masuk' ? '/login' : '/register';
        // post(endpoint);  // ← aktifkan ini saat backend sudah siap
        console.log('Submit:', { mode, ...data });
    };

    return (
        <AppLayout className="bg-[#F0F4FF]">
            {/* ── Dekorasi latar belakang ── */}
            <div className="absolute top-6 left-6 opacity-20">
                <svg className={`w-14 h-14 ${theme.logoDecor}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
            </div>
            <div className="absolute bottom-12 right-6 opacity-10">
                <svg className={`w-24 h-24 ${theme.logoDecor}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
            </div>

            {/* ── Konten utama ── */}
            <div className="flex flex-col flex-1 justify-center px-6 py-10">

                {/* Logo + judul */}
                <div className="text-center mb-8">
                    <h1 className={`text-4xl font-extrabold tracking-widest ${theme.accent} mb-1`}>
                        APTAX
                    </h1>
                    <p className="text-gray-500 text-sm font-medium transition-all duration-300">
                        {theme.subtitle}
                    </p>
                </div>

                {/* Toggle Role */}
                <div className="flex bg-gray-200 rounded-2xl p-1 mb-6">
                    {['siswa', 'guru'].map((r) => (
                        <button
                            key={r}
                            onClick={() => handleRoleSwitch(r)}
                            className={`
                                flex-1 py-2 rounded-xl text-sm font-semibold capitalize
                                transition-all duration-300
                                ${role === r ? theme.tabActive : theme.tabInactive}
                            `}
                        >
                            {r === 'siswa' ? '🎓 Siswa' : '📋 Guru'}
                        </button>
                    ))}
                </div>

                {/* Card Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

                    {/* Toggle Mode (Masuk / Daftar) */}
                    <div className="flex gap-4 mb-6">
                        {['masuk', 'daftar'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`
                                    text-sm font-semibold pb-1 border-b-2 transition-all duration-200 capitalize
                                    ${mode === m
                                        ? `${theme.accent} ${theme.accentBorder}`
                                        : 'text-gray-400 border-transparent'
                                    }
                                `}
                            >
                                {m === 'masuk' ? 'Masuk' : 'Daftar Baru'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">

                        {/* Field: Nama (hanya saat daftar) */}
                        {mode === 'daftar' && (
                            <InputField
                                icon={<IconUser />}
                                placeholder="Nama lengkap"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                accentRing={theme.accentRing}
                            />
                        )}

                        {/* Field: Email */}
                        <InputField
                            icon={<IconMail />}
                            type="email"
                            placeholder="Alamat email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            accentRing={theme.accentRing}
                        />

                        {/* Field: Password */}
                        <InputField
                            icon={<IconKey />}
                            type="password"
                            placeholder="Kata sandi"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            accentRing={theme.accentRing}
                        />

                        {/* Field khusus Siswa: Kode Kelas */}
                        {role === 'siswa' && (
                            <InputField
                                icon={<IconCode />}
                                placeholder="Kode kelas unik (dari guru)"
                                value={data.class_code}
                                onChange={e => setData('class_code', e.target.value)}
                                accentRing={theme.accentRing}
                            />
                        )}

                        {/* Field khusus Guru saat daftar: Kode Akses */}
                        {role === 'guru' && mode === 'daftar' && (
                            <InputField
                                icon={<IconKey />}
                                placeholder="Kode akses guru (dari admin)"
                                value={data.teacher_code}
                                onChange={e => setData('teacher_code', e.target.value)}
                                accentRing={theme.accentRing}
                            />
                        )}

                        {/* Tampilkan error dari Inertia jika ada */}
                        {Object.keys(errors).length > 0 && (
                            <div className="text-red-500 text-xs px-1">
                                {Object.values(errors)[0]}
                            </div>
                        )}

                        {/* Tombol submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`
                                w-full mt-2 py-3.5 rounded-2xl
                                ${theme.accentBg} ${theme.accentHover}
                                text-white font-bold text-sm tracking-wide
                                transition-all duration-200 active:scale-95
                                flex items-center justify-center gap-2
                                disabled:opacity-60 disabled:cursor-not-allowed
                            `}
                        >
                            {processing ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'masuk'
                                        ? `Masuk ke ${role === 'siswa' ? 'Tax City' : 'Dashboard'}`
                                        : 'Buat Akun'
                                    }
                                    <span>→</span>
                                </>
                            )}
                        </button>

                    </form>
                </div>

                {/* Footer kecil */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    APTAX — Laboratorium Perpajakan Digital
                </p>

            </div>
        </AppLayout>
    );
}
