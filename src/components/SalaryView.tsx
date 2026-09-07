import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, DollarSign } from 'lucide-react';
import type { Employee } from '../Types';
import { cn, FormGroup, StatCard } from './Common';
import { useAuth } from '../context/AuthContext';

interface SalaryViewProps {
  employees: Employee[];
  addEmployee: (e: Omit<Employee, 'id' | 'thp'>) => void;
  deleteEmployee: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const SalaryView: React.FC<SalaryViewProps> = ({ employees, addEmployee, deleteEmployee, formatCurrency }) => {
  const { activeWorkspace } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    base: 0,
    transport: 0,
    meal: 0,
    bonus: 0,
    bpjsk: 0,
    bpjstk: 0,
    otherCut: 0,
    businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    }));
  }, [activeWorkspace]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addEmployee(formData);
    setFormData({
      name: '',
      role: '',
      base: 0,
      transport: 0,
      meal: 0,
      bonus: 0,
      bpjsk: 0,
      bpjstk: 0,
      otherCut: 0,
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    });
  };

  const empColors = ['bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-400', 'bg-pink-400'];

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-8 neo-card p-5 lg:p-8">
          <div className="flex items-center gap-3 lg:gap-4 pb-4 mb-6 lg:mb-8" style={{ borderBottom: 'var(--border-size) solid var(--border-color)' }}>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black text-[#A3E635] flex items-center justify-center border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md shrink-0">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg lg:text-2xl font-black uppercase italic tracking-tighter leading-none">Manajemen SDM</h2>
              <p className="text-[9px] lg:text-[10px] font-bold mt-1 uppercase tracking-widest italic leading-none" style={{ color: 'var(--text-faint)' }}>Registrasi & Database Karyawan</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            <div className={cn("grid grid-cols-1 gap-4", activeWorkspace === 'global' ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
              <FormGroup label="Nama Lengkap">
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="neo-input" placeholder="Misal: Budi Santoso" />
              </FormGroup>
              <FormGroup label="Jabatan / Posisi">
                <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="neo-input" placeholder="Misal: Lead Developer" />
              </FormGroup>
              {activeWorkspace === 'global' && (
                <FormGroup label="Lini Bisnis">
                  <select value={formData.businessLine} onChange={e => setFormData({...formData, businessLine: e.target.value as any})} className="neo-input cursor-pointer px-2">
                    <option value="niskala">Niskala (Dev)</option>
                    <option value="aksalab">Aksalab (SaaS)</option>
                    <option value="snapcala">Snapcala (Photobooth)</option>
                  </select>
                </FormGroup>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Income */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <div className="w-2 h-4 bg-[#A3E635]" />
                  <h3 className="font-black text-[9px] lg:text-[10px] uppercase italic tracking-wider">Pendapatan (Income)</h3>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  <SalaryInputGroup label="Gaji Pokok" value={formData.base} onChange={v => setFormData({...formData, base: v})} />
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <SalaryInputGroup label="Bonus" value={formData.bonus} onChange={v => setFormData({...formData, bonus: v})} />
                    <SalaryInputGroup label="Transport" value={formData.transport} onChange={v => setFormData({...formData, transport: v})} />
                  </div>
                  <SalaryInputGroup label="Uang Makan" value={formData.meal} onChange={v => setFormData({...formData, meal: v})} />
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <div className="w-2 h-4 bg-red-400" />
                  <h3 className="font-black text-[9px] lg:text-[10px] uppercase italic tracking-wider text-red-500">Potongan (Deductions)</h3>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <SalaryInputGroup label="BPJS Kes" value={formData.bpjsk} onChange={v => setFormData({...formData, bpjsk: v})} />
                    <SalaryInputGroup label="BPJS TK" value={formData.bpjstk} onChange={v => setFormData({...formData, bpjstk: v})} />
                  </div>
                  <SalaryInputGroup label="Potongan Lain" value={formData.otherCut} onChange={v => setFormData({...formData, otherCut: v})} />
                </div>
              </div>
            </div>

            <button type="submit" className="neo-button bg-[#A3E635] text-black w-full text-sm lg:text-lg py-3 lg:py-4 flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2">
              <Plus size={20} strokeWidth={4} /> TAMBAHKAN KE DATABASE
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4 lg:space-y-5">
          <StatCard 
            label="Headcount SDM" 
            value={`${employees.length} PAX`} 
            sub="Karyawan Terdaftar" 
            icon={<Users size={20} />} 
            variant="primary" 
          />
          <StatCard 
            label="Total Budget Gaji (THP)" 
            value={formatCurrency(employees.reduce((acc, e) => acc + e.thp, 0))} 
            sub="Beban Gaji Bulanan Perusahaan" 
            icon={<DollarSign size={20} />} 
            variant="rose" 
          />

          <div className="p-4 lg:p-5 bg-[#FFF33F] border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl relative overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
            <div className="absolute -top-4 -right-4 text-black/10 rotate-12">
              <DollarSign size={50} strokeWidth={4} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest italic text-black">Peringatan Input</span>
              </div>
              <p className="text-[9px] lg:text-[10px] font-bold uppercase italic leading-tight text-black">
                Pastikan nominal yang dimasukkan sudah akurat. Sistem akan otomatis menghitung THP berdasarkan potongan yang berlaku.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="neo-table-container">
        <div className="p-4 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" style={{ borderBottom: 'var(--border-size) solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="bg-black text-[#A3E635] p-2 border-2 border-black rounded-md rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
              <Users size={18} />
            </div>
            <h2 className="text-base lg:text-xl font-black uppercase italic tracking-tighter">Daftar Payroll Karyawan</h2>
          </div>
          <div className="neo-badge bg-[#ff90e8] text-black border-2 border-black italic tracking-widest py-1.5 lg:py-2 px-3 lg:px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[8px] lg:text-[9px] shrink-0">MARET 2025</div>
        </div>
        
        <div className="p-4 lg:p-8" style={{ background: 'var(--bg-elevated)' }}>
          {employees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {employees.map((e, i) => (
                <div key={e.id} className="neo-card flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative border-[3px]">
                  <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div className={cn(
                      "w-10 h-10 lg:w-12 lg:h-12 border-[3px] border-black flex items-center justify-center font-black text-lg lg:text-xl text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg shrink-0",
                      empColors[i % empColors.length]
                    )}>
                      {e.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm lg:text-lg font-black uppercase italic leading-none tracking-tighter truncate">{e.name}</div>
                      <div className="text-[8px] lg:text-[9px] font-bold uppercase mt-1 italic tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
                        <span>{e.role}</span>
                        {activeWorkspace === 'global' && (
                          <>
                            <span>•</span>
                            <span className="text-[#A3E635] bg-black px-1 rounded-sm font-black">{e.businessLine || 'niskala'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 lg:space-y-2 mb-4 lg:mb-6 flex-1">
                    <SalaryRow label="Gaji Pokok" value={formatCurrency(e.base)} />
                    {(e.transport > 0 || e.meal > 0) && (
                      <SalaryRow label="Tunjangan" value={`+ ${formatCurrency(e.transport + e.meal)}`} color="text-green-600" />
                    )}
                    {e.bonus > 0 && <SalaryRow label="Bonus" value={`+ ${formatCurrency(e.bonus)}`} color="text-green-600" />}
                    {e.bpjsk + e.bpjstk + e.otherCut > 0 && (
                      <SalaryRow label="Potongan" value={`- ${formatCurrency(e.bpjsk + e.bpjstk + e.otherCut)}`} color="text-red-500" />
                    )}
                  </div>

                  <div className="pt-3 lg:pt-4 -mx-5 lg:-mx-6 -mb-5 lg:-mb-6 p-4 lg:p-6 rounded-b-[5px]" style={{ borderTop: 'var(--border-size) solid var(--border-color)', background: 'var(--bg-elevated)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase italic tracking-widest" style={{ color: 'var(--text-faint)' }}>NET EARNINGS</span>
                      <span className="text-base lg:text-xl font-black italic tabular-nums tracking-tighter">{formatCurrency(e.thp)}</span>
                    </div>
                    <button 
                      onClick={() => deleteEmployee(e.id)}
                      className="mt-3 lg:mt-4 w-full py-2 bg-red-50 text-red-500 border-2 border-dashed border-red-200 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-[8px] lg:text-[9px] uppercase italic tracking-widest flex items-center justify-center gap-2 rounded-lg"
                    >
                      <Trash2 size={11} /> Hapus Data
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 lg:py-20 text-center group">
              <div className="w-16 h-16 lg:w-20 lg:h-20 border-4 border-dashed mx-auto flex items-center justify-center mb-4 rotate-3 group-hover:rotate-12 transition-transform" style={{ borderColor: 'var(--divider)' }}>
                <Users size={28} style={{ color: 'var(--text-faint)' }} />
              </div>
              <h3 className="text-base lg:text-xl font-black uppercase italic tracking-tighter mb-1" style={{ color: 'var(--text-faint)' }}>Database Masih Kosong</h3>
              <p className="text-[9px] font-bold uppercase italic tracking-[0.3em]" style={{ color: 'var(--divider)' }}>Belum ada data karyawan terdaftar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== SUB COMPONENTS =====
const SalaryInputGroup = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="group">
    <label className="block text-[8px] font-black uppercase mb-1 ml-1 italic group-focus-within:text-black transition-colors" style={{ color: 'var(--text-faint)' }}>{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black italic" style={{ color: 'var(--text-faint)' }}>RP</div>
      <input type="number" value={value || ''} onChange={e => onChange(Number(e.target.value))} className="neo-input py-2 lg:py-2.5 pl-9 pr-2 italic font-black text-xs" placeholder="0" />
    </div>
  </div>
);

const SalaryRow = ({ label, value, color = "" }: { label: string; value: string; color?: string }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="uppercase font-black text-[8px] italic tracking-tight" style={{ color: 'var(--text-faint)' }}>{label}</span>
    <span className={cn("font-black tabular-nums italic tracking-tighter text-[11px] lg:text-xs", color)} style={!color ? { color: 'var(--text-primary)' } : {}}>{value}</span>
  </div>
);

export default SalaryView;
