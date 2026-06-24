import { useState } from 'react';

export default function TaxCalculator({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [bruto, setBruto] = useState('');
    const [biaya, setBiaya] = useState('');
    const [hasil, setHasil] = useState(null);

    const hitung = () => {
        const numBruto = parseInt(bruto.replace(/\D/g, '')) || 0;
        const numBiaya = parseInt(biaya.replace(/\D/g, '')) || 0;
        setHasil(numBruto - numBiaya);
    };

    const formatInput = (val, setter) => {
        const num = val.replace(/\D/g, '');
        setter(num ? parseInt(num).toLocaleString('id-ID') : '');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-2xl p-5 shadow-2xl border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">🧮 Kalkulator Mini</h4>
                    <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-bold">✕</button>
                </div>

                <div className="space-y-2">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Penghasilan Bruto</label>
                        <input type="text" value={bruto} onChange={e => formatInput(e.target.value, setBruto)} placeholder="Rp 0" className="w-full text-xs p-2.5 mt-1 border border-gray-200 rounded-xl outline-none focus:border-[#1A6B3C]" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Biaya Operasional</label>
                        <input type="text" value={biaya} onChange={e => formatInput(e.target.value, setBiaya)} placeholder="Rp 0" className="w-full text-xs p-2.5 mt-1 border border-gray-200 rounded-xl outline-none focus:border-[#1A6B3C]" />
                    </div>
                </div>

                <button onClick={hitung} className="w-full mt-3 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl shadow-md">
                    Hitung Selisih (PKP)
                </button>

                {hasil !== null && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                        <p className="text-[9px] text-indigo-500 font-bold uppercase leading-none">Hasil PKP</p>
                        <p className="text-sm font-black text-indigo-700 mt-1">Rp {hasil.toLocaleString('id-ID')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
