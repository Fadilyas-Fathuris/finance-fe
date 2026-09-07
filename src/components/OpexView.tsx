import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Calendar, Target, DollarSign } from 'lucide-react';
import type { Opex } from '../Types';
import { FormGroup, StatCard } from './Common';
import { ReceiptUploader } from './ReceiptUploader';
import { useAuth } from '../context/AuthContext';

interface OpexViewProps {
  opex: Opex[];
  addOpex: (o: Omit<Opex, 'id'>) => void;
  deleteOpex: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const OpexView: React.FC<OpexViewProps> = ({ opex, addOpex, deleteOpex, formatCurrency }) => {
  const { user, activeWorkspace } = useAuth();
  const isCLevel = user?.role === 'CEO' || user?.role === 'CFO';

  const [formData, setFormData] = useState<Omit<Opex, 'id'>>({
    name: '',
    cat: 'Operasional Kantor',
    amount: 0,
    freq: 'monthly',
    receiptImage: '',
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
    addOpex(formData);
    setFormData({
      name: '',
      cat: 'Operasional Kantor',
      amount: 0,
      freq: 'monthly',
      receiptImage: '',
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    });
  };

  const totalMonthly = opex.reduce((acc, o) => acc + (o.freq === 'monthly' ? o.amount : o.amount / 12), 0);

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Form */}
        <div className="xl:col-span-7 neo-card p-5 lg:p-8">
          <div className="flex items-center gap-3 lg:gap-4 pb-4 mb-6 lg:mb-8" style={{ borderBottom: 'var(--border-size) solid var(--border-color)' }}>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black text-[#A3E635] flex items-center justify-center border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg lg:text-2xl font-black uppercase italic tracking-tighter leading-none">Fixed Operating Expenses</h2>
              <p className="text-[9px] lg:text-[10px] font-bold mt-1 uppercase tracking-widest italic leading-none" style={{ color: 'var(--text-faint)' }}>Tambah Biaya Tetap (OPEX)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <FormGroup label="Nama Biaya">
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="neo-input" placeholder="Sewa Kantor / ISP" />
              </FormGroup>
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <FormGroup label="Kategori">
                  <select value={formData.cat} onChange={e => setFormData({...formData, cat: e.target.value})} className="neo-input font-bold italic py-[11px] text-xs">
                    <option>Operasional Kantor</option>
                    <option>Infrastruktur IT</option>
                    <option>Marketing & Sales</option>
                    <option>Lain-lain</option>
                  </select>
                </FormGroup>
                <FormGroup label="Frekuensi">
                  <select value={formData.freq} onChange={e => setFormData({...formData, freq: e.target.value as 'monthly' | 'yearly'})} className="neo-input font-bold italic py-[11px] text-xs">
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </FormGroup>
              </div>
            </div>

            {activeWorkspace === 'global' && (
              <FormGroup label="Lini Bisnis">
                <select value={formData.businessLine} onChange={e => setFormData({...formData, businessLine: e.target.value as any})} className="neo-input font-bold italic py-[11px] text-xs">
                  <option value="niskala">Niskala (Dev)</option>
                  <option value="aksalab">Aksalab (SaaS)</option>
                  <option value="snapcala">Snapcala (Photobooth)</option>
                </select>
              </FormGroup>
            )}

            <FormGroup label="Jumlah Biaya">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black italic border-r-2 pr-2 text-blue-500 text-sm" style={{ borderColor: 'var(--border-color)' }}>RP</span>
                <input type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="neo-input pl-14 font-black italic tabular-nums text-lg lg:text-xl py-3" placeholder="0" />
              </div>
            </FormGroup>

            <FormGroup label="Bukti Pembayaran (Opsional)">
              <ReceiptUploader
                value={formData.receiptImage}
                onUploadSuccess={(url) => setFormData(prev => ({ ...prev, receiptImage: url }))}
                onClear={() => setFormData(prev => ({ ...prev, receiptImage: '' }))}
              />
            </FormGroup>

            <button type="submit" className="neo-button bg-[#A3E635] text-black w-full text-sm lg:text-lg py-3 lg:py-4 flex items-center justify-center gap-3 cursor-pointer">
              <Plus size={20} strokeWidth={4} /> TAMBAHKAN OPEX
            </button>
          </form>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-5 space-y-4 lg:space-y-6">
          <StatCard 
            label="Monthly Burn Rate OPEX" 
            value={formatCurrency(totalMonthly)} 
            sub="Total Pengeluaran Tetap Operasional Per Bulan" 
            icon={<Target size={20} />} 
            variant="rose" 
          />

           <div className="neo-card p-5 lg:p-6 border-[3px]">
              <h3 className="text-[10px] font-black uppercase italic mb-4 lg:mb-6 pb-2 flex items-center gap-2" style={{ borderBottom: '2px solid var(--border-color)' }}>
                <Calendar size={14} /> Daftar Biaya Terdaftar
              </h3>
              <div className="space-y-3 lg:space-y-4 max-h-[400px] overflow-y-auto px-1 pr-2">
                {opex.length > 0 ? (
                  opex.map(o => (
                    <div key={o.id} className="flex justify-between items-center group p-3 rounded-lg border-2 border-dashed transition-all" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--divider)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 border-2 flex items-center justify-center text-blue-500 rounded-md shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
                          <DollarSign size={12} strokeWidth={3} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-black uppercase italic text-[10px] lg:text-xs leading-none tracking-tight truncate">{o.name}</div>
                          <div className="text-[8px] font-bold mt-1 uppercase tracking-widest leading-none flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
                            <span>{o.cat} • {o.freq}{activeWorkspace === 'global' && ` • Lini: ${o.businessLine || 'global'}`}</span>
                            {o.receiptImage && (
                              <>
                                <span>•</span>
                                <a
                                  href={o.receiptImage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 dark:text-purple-400 hover:underline font-mono uppercase text-[8px] font-black"
                                >
                                  Bukti
                                </a>
                              </>
                            )}
                          </div>
                          {isCLevel && (
                            <div className="text-[8px] font-black mt-1 uppercase italic tracking-widest" style={{ color: 'var(--text-faint)' }}>
                              Dicatat: {o.createdBy?.name || 'Sistem lama'}{o.updatedBy ? ` • Diubah: ${o.updatedBy.name}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                        <span className="font-black italic text-red-500 text-[10px] lg:text-xs tabular-nums whitespace-nowrap">-{formatCurrency(o.amount)}</span>
                        {isCLevel && (
                          <button onClick={() => deleteOpex(o.id)} className="p-1 lg:p-1.5 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer" style={{ color: 'var(--text-faint)' }}><Trash2 size={13} /></button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 lg:py-12 text-center">
                    <Building2 size={28} className="mx-auto mb-2" style={{ color: 'var(--divider)' }} />
                    <div className="text-[10px] font-black uppercase italic" style={{ color: 'var(--text-faint)' }}>Belum ada rincian biaya tetap</div>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OpexView;
