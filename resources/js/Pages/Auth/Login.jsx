import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconUser = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);
const IconMail = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);
const IconKey = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
    </svg>
);
const IconShield = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
);
const IconRole = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
);
const IconChevronDown = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

// ── Reusable Input Components ───────────────────────────────────────────────────
function InputField({ icon, placeholder, type = 'text', value, onChange, error }) {
    return (
        <div className="space-y-1">
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="
                        w-full pl-9 pr-4 py-3 rounded-xl
                        bg-slate-50 border border-slate-200/80
                        text-slate-800 text-sm placeholder-slate-400/80
                        outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400
                        transition-all duration-200
                    "
                />
            </div>
            {error && <p className="text-red-500 text-xs px-1">{error}</p>}
        </div>
    );
}

function SelectField({ icon, value, onChange, children, error }) {
    return (
        <div className="space-y-1">
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
                <select
                    value={value}
                    onChange={onChange}
                    className="
                        w-full pl-9 pr-8 py-3 rounded-xl appearance-none
                        bg-slate-50 border border-slate-200/80
                        text-slate-700 text-sm
                        outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400
                        transition-all duration-200
                    "
                >
                    {children}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconChevronDown />
                </span>
            </div>
            {error && <p className="text-red-500 text-xs px-1">{error}</p>}
        </div>
    );
}

function Spinner() {
    return <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />;
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function Login({ status }) {
    const [tab, setTab] = useState('masuk'); // 'masuk' | 'daftar'

    // ── Form Login ──
    const loginForm = useForm({ email: '', password: '' });

    const handleLogin = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), { preserveScroll: true });
    };

    // ── Form Register ──
    const registerForm = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        role:                  'siswa',
        class_code:            '',
        access_token:          '',
    });

    const handleRegister = (e) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            preserveScroll: true,
            onSuccess: () => registerForm.reset(),
        });
    };

    return (
        <div className="bg-slate-50 min-h-screen relative flex flex-col justify-center px-5 py-10 overflow-hidden font-sans">
            <Head title="Welcome to APTAX" />

            {/* ── Background Decors ── */}
            <div className="absolute top-8 left-6 opacity-[0.06] text-orange-500 pointer-events-none">
                <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.113M12 7.5h.75a2.25 2.25 0 0 1 0 4.5H12m0 0h-.75a2.25 2.25 0 0 0 0 4.5h.75m0-9a2.25 2.25 0 0 0 0 4.5m0 4.5c.98 0 1.832-.628 2.148-1.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
                </svg>
            </div>
            <div className="absolute bottom-6 right-6 opacity-[0.08] text-emerald-600 pointer-events-none">
                <svg className="w-28 h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-16.5 3h15M3 21h18M4.5 12V9h15v3H4.5Z" />
                </svg>
            </div>

            {/* ── Header Brand ── */}
            <div className="text-center mb-6">
                <h1 className="text-4xl font-black tracking-wider text-orange-400 drop-shadow-sm">APTAX</h1>
                <p className="text-slate-500 text-sm font-medium mt-1 tracking-wide">Welcome to Tax City</p>
            </div>

            {status && (
                <div className="max-w-md mx-auto w-full mb-4 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-sm text-center font-medium">
                    {status}
                </div>
            )}

            <div className="w-full max-w-md mx-auto">
                {/* Tab Switcher */}
                <div className="flex bg-slate-200/60 border border-slate-200 rounded-2xl p-1 mb-4 shadow-sm">
                    {[
                        { key: 'masuk',  label: '🔑 Masuk' },
                        { key: 'daftar', label: '✨ Daftar' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={`
                                flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300
                                ${tab === key
                                    ? 'bg-orange-400 text-white shadow-md shadow-orange-400/20'
                                    : 'text-slate-500 hover:text-slate-700'
                                }
                            `}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-xl shadow-slate-100/70">

                    {/* ── FORM LOGIN ── */}
                    {tab === 'masuk' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 px-0.5">Alamat Email</label>
                                <InputField
                                    icon={<IconMail />}
                                    type="email"
                                    placeholder="Masukkan email Anda"
                                    value={loginForm.data.email}
                                    onChange={e => loginForm.setData('email', e.target.value)}
                                    error={loginForm.errors.email}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 px-0.5">Kata Sandi</label>
                                <InputField
                                    icon={<IconKey />}
                                    type="password"
                                    placeholder="Masukkan kata sandi"
                                    value={loginForm.data.password}
                                    onChange={e => loginForm.setData('password', e.target.value)}
                                    error={loginForm.errors.password}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loginForm.processing}
                                className="
                                    w-full mt-2 py-3 rounded-xl
                                    bg-orange-400 hover:bg-orange-500 active:bg-orange-600
                                    text-white font-bold text-sm tracking-wide shadow-md shadow-orange-400/20
                                    transition-all duration-150 active:scale-[0.98]
                                    flex items-center justify-center gap-2
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                "
                            >
                                {loginForm.processing ? <Spinner /> : <>Masuk ke Tax City <span>→</span></>}
                            </button>
                        </form>
                    )}

                    {/* ── FORM REGISTER KONDISIONAL ── */}
                    {tab === 'daftar' && (
                        <form onSubmit={handleRegister} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 px-0.5">Nama Lengkap</label>
                                <InputField
                                    icon={<IconUser />}
                                    placeholder="Masukkan nama Anda"
                                    value={registerForm.data.name}
                                    onChange={e => registerForm.setData('name', e.target.value)}
                                    error={registerForm.errors.name}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 px-0.5">Alamat Email</label>
                                <InputField
                                    icon={<IconMail />}
                                    type="email"
                                    placeholder="Masukkan email aktif"
                                    value={registerForm.data.email}
                                    onChange={e => registerForm.setData('email', e.target.value)}
                                    error={registerForm.errors.email}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 px-0.5">Kata Sandi</label>
                                <InputField
                                    icon={<IconKey />}
                                    type="password"
                                    placeholder="Minimal 8 karakter"
                                    value={registerForm.data.password}
                                    onChange={e => registerForm.setData('password', e.target.value)}
                                    error={registerForm.errors.password}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 px-0.5">Konfirmasi Kata Sandi</label>
                                <InputField
                                    icon={<IconKey />}
                                    type="password"
                                    placeholder="Ulangi kata sandi"
                                    value={registerForm.data.password_confirmation}
                                    onChange={e => registerForm.setData('password_confirmation', e.target.value)}
                                    error={registerForm.errors.password_confirmation}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 px-0.5">Daftar Sebagai</label>
                                <SelectField
                                    icon={<IconRole />}
                                    value={registerForm.data.role}
                                    onChange={e => registerForm.setData('role', e.target.value)}
                                    error={registerForm.errors.role}
                                >
                                    <option value="siswa">🎓 Siswa SMK</option>
                                    <option value="guru">📋 Guru Pembimbing</option>
                                </SelectField>
                            </div>

                            {/* DINAMIS: Jika Siswa, wajib menginput Kode Kelas Unik */}
                            {registerForm.data.role === 'siswa' && (
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1 px-0.5">Kode Kelas Unik</label>
                                    <InputField
                                        icon={<IconKey />}
                                        placeholder="Masukkan kode kelas dari guru"
                                        value={registerForm.data.class_code}
                                        onChange={e => registerForm.setData('class_code', e.target.value)}
                                        error={registerForm.errors.class_code}
                                    />
                                </div>
                            )}

                            {/* DINAMIS: Jika Guru, wajib menginput Token Hak Akses Admin */}
                            {registerForm.data.role === 'guru' && (
                                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-1.5">
                                    <p className="text-amber-600 font-medium text-[11px] flex items-center gap-1.5">
                                        <IconShield /> Token Admin diperlukan untuk verifikasi Guru.
                                    </p>
                                    <InputField
                                        icon={<IconShield />}
                                        placeholder="Masukkan kode akses token guru"
                                        value={registerForm.data.access_token}
                                        onChange={e => registerForm.setData('access_token', e.target.value)}
                                        error={registerForm.errors.access_token}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={registerForm.processing}
                                className="
                                    w-full mt-2 py-3 rounded-xl
                                    bg-orange-400 hover:bg-orange-500 active:bg-orange-600
                                    text-white font-bold text-sm tracking-wide shadow-md shadow-orange-400/20
                                    transition-all duration-150 active:scale-[0.98]
                                    flex items-center justify-center gap-2
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                "
                            >
                                {registerForm.processing ? <Spinner /> : <>Buat Akun Baru <span>→</span></>}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-[11px] text-slate-400 font-medium mt-6 tracking-wide">
                    APTAX — Aplikasi Perpajakan Berbasis AI
                </p>
            </div>
        </div>
    );
}
