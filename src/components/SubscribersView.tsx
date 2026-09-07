import React, { useState, useEffect } from 'react';
import { Package, Trash2, DollarSign, BarChart3, Plus } from 'lucide-react';
import type { Subscriber } from '../Types';
import { useAuth } from '../context/AuthContext';

import { StatCard } from './Common';

interface SubscribersViewProps {
  subscribers: Subscriber[];
  addSubscriber: (s: Omit<Subscriber, 'id'>) => void;
  deleteSubscriber: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const SubscribersView: React.FC<SubscribersViewProps> = ({ subscribers, addSubscriber, deleteSubscriber, formatCurrency }) => {
  const { activeWorkspace } = useAuth();
  const [name, setName] = useState('');
  const [productName, setProductName] = useState('');
  const [type, setType] = useState<'subscription'|'quota'>('subscription');
  const [units, setUnits] = useState<number>(1);
  const [monthly, setMonthly] = useState<number>(750000);
  const [startDate, setStartDate] = useState('');
  const [quotaAmount, setQuotaAmount] = useState<number>(5000);
  const [businessLine, setBusinessLine] = useState('niskala');

  useEffect(() => {
    setBusinessLine(activeWorkspace === 'global' ? 'niskala' : activeWorkspace);
  }, [activeWorkspace]);

  const submitForm = () => {
    if(!name || !productName || !startDate || units <= 0) return;
    
    // Default next billing is 1 month after start date, even for quota it might be an open due date,
    // but we use 1 month as standard reminder for followup
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + 1);
    const dueDate = d.toISOString().split('T')[0];

    const subscriberData: Omit<Subscriber, 'id'> = { 
      name, productName, type, units, monthly, 
      startDate, dueDate, status: 'active', city: '',
      businessLine,
    };

    if (type === 'quota') {
      subscriberData.quotaAmount = quotaAmount;
    }

    addSubscriber(subscriberData);
    
    setName(''); setProductName(''); setUnits(1);
    setMonthly(type === 'quota' ? 100000 : 750000); setStartDate('');
  };

  const totalMonthlyRunRate = subscribers.filter(s => s.type === 'subscription').reduce((acc, s) => acc + (s.monthly * s.units), 0);
  const totalUnits = subscribers.filter(s => s.type === 'subscription').reduce((acc, s) => acc + s.units, 0);
  
  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
       <div className="neo-card p-5 lg:p-8 space-y-8 lg:space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 gap-4" style={{ borderBottom: 'var(--border-size) solid var(--border-color)' }}>
             <div>
                <h2 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter leading-none">Produk Bisnis</h2>
                <p className="text-[9px] lg:text-[10px] font-black mt-1 uppercase tracking-[0.3em] italic" style={{ color: 'var(--text-faint)' }}>Subscription & Quota Management</p>
             </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
             <StatCard 
               label="Total Unit Subscription" 
               value={`${totalUnits} UNITS`} 
               sub="Perangkat / Lisensi Aktif" 
               icon={<Package size={20} />} 
               variant="emerald" 
             />
             <StatCard 
               label="MRR (Monthly Run Rate)" 
               value={formatCurrency(totalMonthlyRunRate)} 
               sub="Pendapatan Berulang Bulanan" 
               icon={<DollarSign size={20} />} 
               variant="purple" 
             />
             <StatCard 
               label="Annual Forecast ARR" 
               value={formatCurrency(totalMonthlyRunRate * 12)} 
               sub="Proyeksi Pendapatan Tahunan" 
               icon={<BarChart3 size={20} />} 
               variant="primary" 
             />
          </div>

          {/* Form */}
          <div className="bg-[#1a1a2e] p-5 lg:p-6 border-[3px] shadow-[6px_6px_0px_0px_rgba(163,230,53,1)] rounded-xl flex flex-col lg:flex-row gap-4 lg:items-end w-full flex-wrap" style={{ borderColor: 'var(--border-color)', color: 'white' }}>
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <label className="text-[10px] font-black uppercase italic tracking-[0.2em]">{type === 'quota' ? 'Nama Klien / User' : 'Nama Pemesan / Klien'}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="neo-input w-full" placeholder="Cth: PT ABCD" />
            </div>
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <label className="text-[10px] font-black uppercase italic tracking-[0.2em]">Nama Produk</label>
              <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="neo-input w-full" placeholder="Cth: Software Photobooth" />
            </div>
            <div className="w-full lg:w-32 space-y-1.5">
              <label className="text-[10px] font-black uppercase italic tracking-[0.2em]">Sistem</label>
              <select value={type} onChange={e => {
                const newType = e.target.value as 'subscription'|'quota';
                setType(newType);
                setMonthly(newType === 'quota' ? 100000 : 750000);
              }} className="neo-input w-full uppercase text-[10px] italic font-bold">
                <option value="subscription">Subscription</option>
                <option value="quota">Sistem Kuota</option>
              </select>
            </div>
            
            {type === 'quota' && (
              <div className="w-full lg:w-32 space-y-1.5">
                <label className="text-[10px] font-black uppercase italic tracking-[0.2em] text-[#A3E635]">Jumlah Kuota</label>
                <input type="number" value={quotaAmount} onChange={e => setQuotaAmount(Number(e.target.value))} className="neo-input w-full" placeholder="Cth: 5000" min="1" />
              </div>
            )}
            
            <div className="w-full lg:w-24 space-y-1.5">
              <label className="text-[10px] font-black uppercase italic tracking-[0.2em]">{type === 'quota' ? 'Jml Paket' : 'Jml Unit'}</label>
              <input type="number" value={units} onChange={e => setUnits(Number(e.target.value))} className="neo-input w-full" min="1" />
            </div>
            
            <div className="w-full lg:w-40 space-y-1.5">
              <label className="text-[10px] font-black uppercase italic tracking-[0.2em]">{type === 'quota' ? 'Harga / Paket' : 'Biaya / Bulan/Unit'}</label>
              <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="neo-input w-full" min="0" step="10000" />
            </div>
            
            <div className="w-full lg:w-32 space-y-1.5">
              <label className="text-[10px] font-black uppercase italic tracking-[0.2em]">Tanggal Mulai</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="neo-input w-full text-xs" />
            </div>
            
            {activeWorkspace === 'global' && (
              <div className="w-full lg:w-32 space-y-1.5 text-white">
                <label className="text-[10px] font-black uppercase italic tracking-[0.2em]">Lini Bisnis</label>
                <select value={businessLine} onChange={e => setBusinessLine(e.target.value as any)} className="neo-input w-full text-[10px] italic font-bold" style={{ color: 'var(--text-primary)' }}>
                  <option value="niskala">Niskala (Dev)</option>
                  <option value="aksalab">Aksalab (SaaS)</option>
                  <option value="snapcala">Snapcala (Photobooth)</option>
                </select>
              </div>
            )}
            
            <button onClick={submitForm} className="neo-button bg-[#A3E635] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] py-3 px-6 shrink-0 flex items-center justify-center gap-2 mt-4 lg:mt-0 w-full lg:w-auto">
              <Plus size={18} strokeWidth={4} />
              <span>{type === 'quota' ? 'TAMBAH' : 'DAFTARKAN'}</span>
            </button>
          </div>

          {/* Table */}
          <div className="neo-table-container">
             <div className="table-responsive">
                <table className="neo-table">
                   <thead>
                     <tr>
                       <th>Produk & Klien</th>
                       {activeWorkspace === 'global' && <th className="text-center">Lini Bisnis</th>}
                       <th className="text-center">Sistem</th>
                       <th className="text-center">Volume</th>
                       <th className="text-right">Biaya Total</th>
                       <th className="text-center">Tgl Mulai</th>
                       <th className="text-center">Status / Next Billing</th>
                       <th className="text-center">Aksi</th>
                     </tr>
                   </thead>
                   <tbody>
                      {subscribers.length > 0 ? subscribers.map((s, idx) => (
                        <tr key={s.id || idx}>
                           <td>
                              <div className="font-black uppercase italic text-[10px] lg:text-xs tracking-tight">{s.productName}</div>
                              <div className="text-[8px] lg:text-[9px] font-bold mt-1" style={{ color: 'var(--text-faint)' }}>{s.name}</div>
                           </td>
                           {activeWorkspace === 'global' && (
                             <td className="text-center">
                               <span className="neo-badge bg-[#A3E635]/20 text-[#8ec32d] px-2 py-1 text-[8px] uppercase" style={{ borderColor: 'var(--border-color)' }}>
                                 {s.businessLine || 'niskala'}
                               </span>
                             </td>
                           )}
                           <td className="text-center">
                             <span className={`neo-badge px-2 py-1 text-[8px] uppercase ${s.type === 'quota' ? 'bg-[#ff90e8]/20 text-pink-500' : 'bg-[#A3E635]/20 text-[#8ec32d]'}`} style={{ borderColor: 'var(--border-color)' }}>
                               {s.type}
                             </span>
                           </td>
                           <td className="text-center">
                             {s.type === 'quota' ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="neo-badge bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 text-[10px]" style={{ borderColor: 'var(--border-color)' }}>{s.quotaAmount} FOTO</span>
                                  <span className="text-[8px] font-black italic opacity-70">{s.units} Paket</span>
                                </div>
                             ) : (
                                <span className="neo-badge bg-[#2563EB]/10 text-[#2563EB] px-2 lg:px-3 py-1 text-[10px]" style={{ borderColor: 'var(--border-color)' }}>{s.units} Mesin</span>
                             )}
                           </td>
                           <td className="font-mono font-black italic text-right text-sm lg:text-base tracking-tighter whitespace-nowrap">{formatCurrency(s.monthly * s.units)}</td>
                           
                           <td className="text-center font-black italic tracking-tighter text-[9px] lg:text-[10px] whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>{s.startDate}</td>
                           <td className="text-center font-black italic tracking-tighter text-[9px] lg:text-[10px] whitespace-nowrap">
                              {s.type === 'quota' ? (
                                <span className="text-[#A3E635]">AKTIF / PRA-BAYAR</span>
                              ) : (
                                <span className="text-[#FF5A5F]">{s.dueDate}</span>
                              )}
                           </td>
                           <td className="text-center py-3 lg:py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button className="hover:text-red-500 hover:rotate-12 transition-all p-1 lg:p-2" style={{ color: 'var(--text-faint)' }} onClick={() => deleteSubscriber(s.id)}>
                                  <Trash2 size={14}/>
                                </button>
                              </div>
                           </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={activeWorkspace === 'global' ? 8 : 7} className="py-16 lg:py-20 text-center italic font-black text-base lg:text-lg tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>Belum ada produk terdaftar</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};

export default SubscribersView;

