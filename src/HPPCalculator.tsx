import React, { useState, useCallback } from 'react';
import { Calculator, Save, Info, TrendingUp, TrendingDown, AlertCircle, Package, Users as UsersIcon, Wrench, Receipt } from 'lucide-react';
import { cn } from './components/Common';

// ===== TYPES =====
interface HPPInputs {
  name: string;
  price: number;
  bahanBaku: number;
  bahanPenolong: number;
  ops: number;
  opsFee: number;
  food: number;
  overtime: number;
  transport: number;
  parking: number;
  paper: number;
  ink: number;
  props: number;
  venue: number;
  sewaAlat: number;
  depresiasi: number;
  buffer: number;
  misc: number;
}

interface HPPResult {
  id: string;
  name: string;
  price: number;
  hpp: number;
  grossProfit: number;
  margin: number;
  date: string;
}

const defaultInputs: HPPInputs = {
  name: '',
  price: 0,
  bahanBaku: 0,
  bahanPenolong: 0,
  ops: 1,
  opsFee: 0,
  food: 0,
  overtime: 0,
  transport: 0,
  parking: 0,
  paper: 0,
  ink: 0,
  props: 0,
  venue: 0,
  sewaAlat: 0,
  depresiasi: 0,
  buffer: 0,
  misc: 0,
};

// ===== COMPONENT =====
const HPPCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<HPPInputs>(defaultInputs);
  const [savedResults, setSavedResults] = useState<HPPResult[]>(() => {
    try {
      const saved = localStorage.getItem('fin_hpp_results');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const biayaBahanBaku = inputs.bahanBaku + inputs.bahanPenolong;
  const biayaTKL = (inputs.ops * inputs.opsFee) + inputs.food + inputs.overtime;
  const biayaOverhead = inputs.transport + inputs.parking + inputs.paper + inputs.ink + inputs.props + inputs.venue + inputs.sewaAlat + inputs.depresiasi;
  const biayaLainnya = inputs.buffer + inputs.misc;
  
  const totalHPP = biayaBahanBaku + biayaTKL + biayaOverhead + biayaLainnya;
  const grossProfit = inputs.price - totalHPP;
  const margin = inputs.price > 0 ? Math.round((grossProfit / inputs.price) * 100) : 0;

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  }, []);

  const updateInput = useCallback((field: keyof HPPInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!inputs.name || inputs.price <= 0) return;
    const result: HPPResult = {
      id: Math.random().toString(36).substr(2, 9),
      name: inputs.name,
      price: inputs.price,
      hpp: totalHPP,
      grossProfit,
      margin,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [result, ...savedResults];
    setSavedResults(updated);
    localStorage.setItem('fin_hpp_results', JSON.stringify(updated));
    setInputs(defaultInputs);
  }, [inputs, totalHPP, grossProfit, margin, savedResults]);

  const handleDelete = useCallback((id: string) => {
    const updated = savedResults.filter(r => r.id !== id);
    setSavedResults(updated);
    localStorage.setItem('fin_hpp_results', JSON.stringify(updated));
  }, [savedResults]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Info Banner */}
      <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 lg:p-6 rounded-2xl flex flex-col sm:flex-row items-start gap-4 shadow-sm">
        <div className="w-10 h-10 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
          <Info size={20} />
        </div>
        <div>
          <strong className="text-sm lg:text-lg font-bold block text-slate-900 dark:text-slate-100">Apa itu HPP?</strong>
          <p className="font-medium text-xs lg:text-sm mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">
            HPP (Harga Pokok Penjualan / COGS) adalah seluruh biaya langsung yang dikeluarkan untuk menghasilkan pendapatan dari satu event/proyek. 
            Terdiri dari: Biaya Bahan Baku, Tenaga Kerja Langsung, dan Biaya Overhead Produksi. 
            Setelah HPP dikurangi dari pendapatan, hasilnya adalah Laba Kotor (Gross Profit).
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
        {/* LEFT: Input Form */}
        <div className="neo-card space-y-6 lg:space-y-8">
          <div className="pb-4" style={{ borderBottom: '4px solid var(--border-color)' }}>
            <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              🎪 HPP Event <Calculator size={20} />
            </h2>
            <p className="text-[9px] font-black uppercase italic tracking-widest mt-1" style={{ color: 'var(--text-faint)' }}>Standar Akuntansi Indonesia (SAK)</p>
          </div>

          <div className="space-y-6">
            {/* Event Name & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase mb-2 ml-1 italic tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Nama Event / Proyek</label>
                <input type="text" value={inputs.name} onChange={e => updateInput('name', e.target.value)} className="neo-input" placeholder="Wedding Rizky & Dina" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase mb-2 ml-1 italic tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Harga Jual ke Klien</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black italic border-r-2 pr-2 text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>RP</span>
                  <input type="number" value={inputs.price || ''} onChange={e => updateInput('price', Number(e.target.value))} className="neo-input pl-14" placeholder="0" />
                </div>
              </div>
            </div>

            {/* A. Bahan Baku Langsung */}
            <HPPSection 
              title="A. Bahan Baku Langsung" 
              subtitle="Direct Materials"
              color="text-blue-500" 
              icon={<Package size={16} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Bahan Baku Utama" value={inputs.bahanBaku} onChange={v => updateInput('bahanBaku', v)} hint="Kertas, ribbon, tinta, media" />
                <InputGroup label="Bahan Penolong" value={inputs.bahanPenolong} onChange={v => updateInput('bahanPenolong', v)} hint="Props, frame, stiker, dll" />
              </div>
            </HPPSection>

            {/* B. Tenaga Kerja Langsung */}
            <HPPSection 
              title="B. Tenaga Kerja Langsung" 
              subtitle="Direct Labor"
              color="text-pink-500" 
              icon={<UsersIcon size={16} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Jumlah Kru" value={inputs.ops} onChange={v => updateInput('ops', v)} />
                <InputGroup label="Fee per Kru" value={inputs.opsFee} onChange={v => updateInput('opsFee', v)} />
                <InputGroup label="Konsumsi Kru" value={inputs.food} onChange={v => updateInput('food', v)} />
                <InputGroup label="Uang Lembur" value={inputs.overtime} onChange={v => updateInput('overtime', v)} />
              </div>
            </HPPSection>

            {/* C. Biaya Overhead Produksi */}
            <HPPSection 
              title="C. Biaya Overhead Produksi" 
              subtitle="Production Overhead"
              color="text-green-500" 
              icon={<Wrench size={16} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Bensin & Transport" value={inputs.transport} onChange={v => updateInput('transport', v)} />
                <InputGroup label="Parkir & Tol" value={inputs.parking} onChange={v => updateInput('parking', v)} />
                <InputGroup label="Kertas & Ribbon" value={inputs.paper} onChange={v => updateInput('paper', v)} />
                <InputGroup label="Tinta / Media" value={inputs.ink} onChange={v => updateInput('ink', v)} />
                <InputGroup label="Properti / Dekorasi" value={inputs.props} onChange={v => updateInput('props', v)} />
                <InputGroup label="Fee Venue" value={inputs.venue} onChange={v => updateInput('venue', v)} />
                <InputGroup label="Sewa Alat" value={inputs.sewaAlat} onChange={v => updateInput('sewaAlat', v)} />
                <InputGroup label="Depresiasi Alat" value={inputs.depresiasi} onChange={v => updateInput('depresiasi', v)} hint="Penyusutan perlengkapan" />
              </div>
            </HPPSection>

            {/* D. Biaya Lainnya */}
            <HPPSection 
              title="D. Biaya Lainnya" 
              subtitle="Miscellaneous"
              color="text-yellow-500" 
              icon={<AlertCircle size={16} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Biaya Tak Terduga" value={inputs.buffer} onChange={v => updateInput('buffer', v)} hint="Contingency 5-10%" />
                <InputGroup label="Lain-lain" value={inputs.misc} onChange={v => updateInput('misc', v)} />
              </div>
            </HPPSection>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-6 lg:space-y-8">
          {/* Calculation Result */}
          <div className="neo-card bg-[#1a1a2e] text-white h-fit xl:sticky xl:top-10 border-[3px]" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl lg:text-2xl font-black uppercase italic mb-6 lg:mb-8 border-b-2 border-white/30 pb-4 tracking-tighter flex items-center gap-3 text-white">
              📊 Hasil Perhitungan
            </h2>
            
            {/* Breakdown */}
            <div className="space-y-3 mb-6">
              <ResultSection label="Bahan Baku" value={formatCurrency(biayaBahanBaku)} />
              <ResultSection label="Tenaga Kerja" value={formatCurrency(biayaTKL)} />
              <ResultSection label="Overhead" value={formatCurrency(biayaOverhead)} />
              <ResultSection label="Lainnya" value={formatCurrency(biayaLainnya)} />
            </div>

            <div className="h-0.5 bg-white/20 my-4" />

            <div className="space-y-4 font-bold">
              <ResultRow label="Harga Jual" value={formatCurrency(inputs.price)} />
              <ResultRow label="Total HPP (COGS)" value={formatCurrency(totalHPP)} color="text-red-400" />
              <div className="h-0.5 bg-white opacity-20 my-2" />
              <ResultRow label="Laba Kotor (Gross Profit)" value={formatCurrency(grossProfit)} color={grossProfit >= 0 ? "text-[#A3E635]" : "text-red-500"} large />
              <ResultRow label="Gross Margin" value={`${margin}%`} color={margin >= 30 ? "text-[#A3E635]" : "text-yellow-400"} />
            </div>

            {/* Recommendation */}
            <div className="mt-8 lg:mt-10 pt-6 border-t-2 border-dashed border-white/30 opacity-90">
              <div className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
                {margin >= 40 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                REKOMENDASI
              </div>
              {margin < 20 ? (
                <div className="bg-red-500 text-white p-4 border-2 border-white font-black italic uppercase text-[10px] lg:text-xs rounded-lg leading-relaxed">
                  ⚠️ Rugi / Margin Tipis! Kurangi biaya kru atau naikkan harga jual. Minimum margin sehat: 30%.
                </div>
              ) : margin < 40 ? (
                <div className="bg-yellow-500 text-black p-4 border-2 border-white font-black italic uppercase text-[10px] lg:text-xs rounded-lg leading-relaxed">
                  🤏 Margin Standar. Pastikan biaya tak terduga tidak membengkak. Target margin: 40%+.
                </div>
              ) : (
                <div className="bg-[#A3E635] text-black p-4 border-2 border-white font-black italic uppercase text-[10px] lg:text-xs rounded-lg leading-relaxed">
                  ✅ Margin Bagus! Proyek ini sangat menguntungkan. Pertahankan efisiensi biaya.
                </div>
              )}
            </div>

            <button 
              onClick={handleSave}
              className="neo-button bg-white text-black w-full mt-6 lg:mt-8 py-3 flex items-center justify-center gap-3 border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm"
            >
              <Save size={18} className="stroke-[3]" /> SIMPAN HASIL HPP
            </button>
          </div>

          {/* Saved Results */}
          {savedResults.length > 0 && (
            <div className="neo-card border-[3px]">
              <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '2px solid var(--border-color)' }}>
                <Receipt size={16} />
                <h3 className="text-xs font-black uppercase italic tracking-widest">Riwayat Perhitungan HPP</h3>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {savedResults.map(r => (
                  <div key={r.id} className="p-3 border-2 border-dashed rounded-lg transition-all flex flex-col sm:flex-row justify-between gap-2" style={{ borderColor: 'var(--divider)' }}>
                    <div>
                      <div className="text-xs font-black uppercase italic tracking-tight">{r.name}</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-faint)' }}>
                        {r.date} • HPP: {formatCurrency(r.hpp)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-sm font-black italic tabular-nums",
                        r.margin >= 30 ? "text-green-600" : "text-red-500"
                      )}>
                        {r.margin}%
                      </span>
                      <button onClick={() => handleDelete(r.id)} className="hover:text-red-500 transition-colors text-xs" style={{ color: 'var(--text-faint)' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== SUB COMPONENTS =====
const HPPSection = ({ title, subtitle, color, icon, children }: { 
  title: string; subtitle: string; color: string; icon: React.ReactNode; children: React.ReactNode 
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className={cn("p-1 rounded", color)}>{icon}</div>
      <div>
        <h3 className={cn("font-black pb-1 text-xs lg:text-sm uppercase italic tracking-widest", color)} style={{ borderBottom: '2px solid var(--border-color)' }}>{title}</h3>
        <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>{subtitle}</span>
      </div>
    </div>
    {children}
  </div>
);

const InputGroup = ({ label, value, onChange, hint }: { 
  label: string; value: number; onChange: (v: number) => void; hint?: string 
}) => (
  <div>
    <label className="block text-[10px] font-black uppercase mb-1 ml-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
    <input type="number" value={value || ''} onChange={e => onChange(Number(e.target.value))} className="neo-input py-2 text-sm" placeholder="0" />
    {hint && <span className="text-[8px] font-bold ml-1 italic" style={{ color: 'var(--text-faint)' }}>{hint}</span>}
  </div>
);

const ResultSection = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg">
    <span className="text-[9px] uppercase tracking-widest text-white/70">{label}</span>
    <span className="text-xs font-black italic tabular-nums text-white">{value}</span>
  </div>
);

const ResultRow = ({ label, value, color = "text-white", large }: { 
  label: string; value: string; color?: string; large?: boolean 
}) => (
  <div className="flex justify-between items-center gap-4">
    <span className="text-[9px] lg:text-xs uppercase text-white/70 tracking-widest">{label}</span>
    <span className={cn("font-black italic tabular-nums", large ? "text-xl lg:text-2xl" : "text-base lg:text-lg", color)}>{value}</span>
  </div>
);

export default HPPCalculator;
