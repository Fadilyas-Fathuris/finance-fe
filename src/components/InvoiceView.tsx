import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Printer, Save, User, MapPin, Calendar, CreditCard, Landmark, Info, Eye } from 'lucide-react';
import type { Invoice, InvoiceItem } from '../Types';
import { FormGroup } from './Common';
import { useAuth } from '../context/AuthContext';
import { generateDocNumber } from '../utils/docNumbering';

interface InvoiceViewProps {
  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id'>) => void;
  formatCurrency: (amount: number) => string;
}

const businessLineLabels: Record<string, string> = {
  global: 'Seluruh Lini Bisnis',
  niskala: 'Niskala Dev',
  aksalab: 'Aksalab SaaS',
  snapcala: 'Snapcala Photobooth',
};

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoices, addInvoice, formatCurrency }) => {
  const { user, activeWorkspace } = useAuth();
  const isCLevel = user?.role === 'CEO' || user?.role === 'CFO';
  const canAutoAttachCeoSignature = user?.role === 'CEO';
  const historyColSpan = (activeWorkspace === 'global' ? 6 : 5) + (isCLevel ? 1 : 0);
  const [formData, setFormData] = useState<Omit<Invoice, 'id'>>({
    num: generateDocNumber('INV', invoices.length + 1),
    client: '', 
    clientAddr: '', 
    date: new Date().toISOString().split('T')[0],
    due: '', 
    items: [{ desc: '', qty: 1, price: 0 }], 
    notes: '',
    bankName: 'BANK MANDIRI',
    bankAccount: '1370024220468',
    bankHolder: 'FARIS DWI RAMADHAN',
    businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    }));
  }, [activeWorkspace]);

  const handleAddItem = () => setFormData({ ...formData, items: [...formData.items, { desc: '', qty: 1, price: 0 }] });
  
  const removeItem = (index: number) => {
    const newItems = [...formData.items]; 
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items]; 
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const total = formData.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const businessLineLabel = businessLineLabels[formData.businessLine || activeWorkspace] || formData.businessLine || activeWorkspace;

  const handleSubmit = () => {
    if (!formData.client || formData.items.length === 0) return;
    addInvoice(formData);
    setFormData({
      num: generateDocNumber('INV', invoices.length + 2),
      client: '', 
      clientAddr: '', 
      date: new Date().toISOString().split('T')[0],
      due: '', 
      items: [{ desc: '', qty: 1, price: 0 }], 
      notes: '',
      bankName: formData.bankName || 'BANK MANDIRI',
      bankAccount: formData.bankAccount || '1370024220468',
      bankHolder: formData.bankHolder || 'FARIS DWI RAMADHAN',
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    });
  };

  const handlePrint = () => {
    const pr = document.getElementById('invoice-print-area');
    if (pr) {
      const originalContents = document.body.innerHTML;
      const printContents = pr.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); 
    }
  };

  const handleLoadInvoice = (inv: Invoice, autoPrint = false) => {
    setFormData({
      num: inv.num,
      client: inv.client,
      clientAddr: inv.clientAddr || '',
      date: inv.date ? (inv.date.includes('T') ? inv.date.split('T')[0] : inv.date) : '',
      due: inv.due ? (inv.due.includes('T') ? inv.due.split('T')[0] : inv.due) : '',
      items: inv.items && inv.items.length > 0 ? inv.items.map(it => ({ desc: it.desc, qty: it.qty, price: it.price })) : [{ desc: '', qty: 1, price: 0 }],
      notes: inv.notes || '',
      bankName: inv.bankName || 'BANK MANDIRI',
      bankAccount: inv.bankAccount || '1370024220468',
      bankHolder: inv.bankHolder || 'FARIS DWI RAMADHAN',
      businessLine: inv.businessLine || activeWorkspace,
    });

    if (autoPrint) {
      setTimeout(() => {
        handlePrint();
      }, 150);
    } else {
      const element = document.getElementById('invoice-print-area');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      {/* Top Banner */}
      <div className="bg-[#4682B4] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-[#4682B4]">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 text-sky-100 border border-white/10">
              <FileText size={12} /> Commercial Ledger System
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Invoice Generator</h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
              Penerbitan faktur tagihan profesional untuk klien internal & eksternal PT. NISKALA ID TECH.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-sky-200 uppercase tracking-wider">Unit Bisnis</div>
                <div className="text-xs font-black text-white">{businessLineLabel}</div>
             </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Form Container */}
        <div className="xl:col-span-12 app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Detail Invoice</h2>
                <p className="text-xs text-slate-400 mt-0.5">Lengkapi formulir untuk menyusun draf invoice</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Meta Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormGroup label="Nomor Invoice">
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={formData.num} onChange={e => setFormData({...formData, num: e.target.value})} className="neo-input font-mono font-bold pl-10" placeholder="001/INV/NISKALA/IX/2026" />
                </div>
              </FormGroup>
              <FormGroup label="Tanggal Terbit">
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="neo-input pl-10" />
                </div>
              </FormGroup>
              <FormGroup label="Jatuh Tempo">
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="date" value={formData.due} onChange={e => setFormData({...formData, due: e.target.value})} className="neo-input pl-10" />
                </div>
              </FormGroup>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormGroup label="Nama Klien / Perusahaan">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="neo-input pl-10" placeholder="PT. Maju Mundur" />
                </div>
              </FormGroup>
              {activeWorkspace === 'global' && (
                <FormGroup label="Lini Bisnis">
                  <select
                    value={formData.businessLine}
                    onChange={e => setFormData({ ...formData, businessLine: e.target.value })}
                    className="neo-input cursor-pointer uppercase font-semibold text-xs"
                  >
                    <option value="niskala">Niskala (Dev)</option>
                    <option value="aksalab">Aksalab (SaaS)</option>
                    <option value="snapcala">Snapcala (Photobooth)</option>
                  </select>
                </FormGroup>
              )}
              <FormGroup label="Catatan Tambahan (Internal)">
                <div className="relative">
                  <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="neo-input pl-10" placeholder="Catatan internal..." />
                </div>
              </FormGroup>
            </div>

            <FormGroup label="Alamat Klien">
              <div className="relative">
                <MapPin className="absolute left-3.5 top-4 text-slate-400" size={16} />
                <textarea value={formData.clientAddr} onChange={e => setFormData({...formData, clientAddr: e.target.value})} className="neo-input h-20 pl-10 pt-3" placeholder="Jl. Sudirman No. 123, Jakarta" />
              </div>
            </FormGroup>

            {/* Rekening Tujuan Pembayaran (Manual Input) */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:p-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <Landmark size={16} className="text-[#4682B4]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Rekening Tujuan Pembayaran</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <FormGroup label="Nama Bank">
                  <div className="relative">
                    <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={formData.bankName} 
                      onChange={e => setFormData({...formData, bankName: e.target.value})} 
                      className="neo-input pl-10 uppercase font-semibold" 
                      placeholder="BANK MANDIRI" 
                    />
                  </div>
                </FormGroup>
                <FormGroup label="Nomor Rekening">
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={formData.bankAccount} 
                      onChange={e => setFormData({...formData, bankAccount: e.target.value})} 
                      className="neo-input pl-10 font-mono font-bold" 
                      placeholder="1370024220468" 
                    />
                  </div>
                </FormGroup>
                <FormGroup label="Atas Nama (A.N)">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={formData.bankHolder} 
                      onChange={e => setFormData({...formData, bankHolder: e.target.value})} 
                      className="neo-input pl-10 uppercase font-semibold" 
                      placeholder="FARIS DWI RAMADHAN" 
                    />
                  </div>
                </FormGroup>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-200 dark:border-slate-700 gap-2 mb-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Layanan / Produk</h3>
                <button onClick={handleAddItem} className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                  <Plus size={14} strokeWidth={2.5} /> Tambah Baris
                </button>
              </div>
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start border-b border-slate-200/60 dark:border-slate-700/60 pb-4 last:border-0">
                    <div className="col-span-12 sm:col-span-6">
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Deskripsi Item</label>
                      <input type="text" value={item.desc} onChange={e => updateItem(index, 'desc', e.target.value)} className="neo-input py-2 text-xs" placeholder="Deskripsi item..." />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                       <label className="text-[10px] font-medium text-slate-400 mb-1 block">Qty</label>
                      <input type="number" value={item.qty} onChange={e => updateItem(index, 'qty', Number(e.target.value))} className="neo-input py-2 text-xs text-center font-mono" placeholder="Qty" />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                       <label className="text-[10px] font-medium text-slate-400 mb-1 block">Harga Satuan</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">RP</span>
                        <input type="number" value={item.price || ''} onChange={e => updateItem(index, 'price', Number(e.target.value))} className="neo-input py-2 pl-8 text-xs font-mono" placeholder="Harga" />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-center pt-6">
                      <button onClick={() => removeItem(index)} className="hover:text-rose-500 text-slate-400 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 lg:p-6 -mx-6 lg:-mx-8 -mb-6 lg:-mb-8 rounded-b-2xl gap-4 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Grand Total (Estimasi)</div>
                <div className="text-xl lg:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{formatCurrency(total)}</div>
              </div>
              <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
                <Save size={16} strokeWidth={2.5} /> SIMPAN INVOICE
              </button>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="xl:col-span-12 app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm min-h-[500px]">
          <div className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
             <span className="text-xs font-semibold flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Document Preview
              </span>
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-xs hover:bg-slate-800 cursor-pointer">
                <Printer size={14} /> Cetak Invoice
              </button>
           </div>
           
            <div className="overflow-x-auto p-4 bg-slate-100 dark:bg-slate-950 flex justify-center">
              {/* THE ACTUAL PRINTABLE AREA */}
              <div 
                id="invoice-print-area" 
                className="bg-white text-black text-xs font-sans p-10 print:p-0 w-[210mm] shadow-xl relative"
                style={{ fontFamily: 'Inter, Arial, sans-serif', minHeight: '297mm' }}
              >
                <style>{`
                  @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: white !important; color: black !important; }
                    * { box-sizing: border-box; }
                    table { border-collapse: collapse !important; width: 100% !important; }
                    .no-break { page-break-inside: avoid; }
                  }
                `}</style>

                {/* Header Document */}
                <div className="flex justify-between items-start pb-5 border-b border-slate-900 mb-7">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                       <img 
                         src="/logo.png" 
                         alt="Niskala Logo" 
                         className="h-10 w-auto object-contain" 
                         onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                       />
                       <div>
                         <span className="font-bold text-base uppercase text-slate-950 block">PT. NISKALA ID TECH</span>
                         <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{businessLineLabel}</p>
                       </div>
                    </div>
                    <div className="text-[9px] text-slate-600 max-w-md leading-relaxed">
                      <div><strong>Alamat:</strong> Bandung, Jawa Barat</div>
                      <div><strong>Email:</strong> niskalaidtech@gmail.com</div>
                      <div><strong>Website:</strong> niskalatech.id | aksalab.niskalatech.id</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-2xl font-bold tracking-wide text-slate-950">INVOICE</h1>
                    <table className="text-[10px] mt-3 font-mono ml-auto">
                      <tbody>
                        <tr>
                          <td className="text-slate-500 pr-3 py-0.5 font-semibold uppercase">No. Invoice</td>
                          <td className="font-bold text-slate-950">{formData.num}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500 pr-3 py-0.5 font-semibold uppercase">Tanggal</td>
                          <td className="font-bold">{formatDateLabel(formData.date)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500 pr-3 py-0.5 font-semibold uppercase">Jatuh Tempo</td>
                          <td className="font-bold text-slate-950">{formatDateLabel(formData.due)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bill To & Issuer */}
                <div className="grid grid-cols-2 gap-10 mb-8">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tagihan Kepada</p>
                    <p className="text-sm font-bold uppercase text-slate-950">{formData.client || '(Nama Klien / Perusahaan)'}</p>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                      {formData.clientAddr || '(Alamat Lengkap Perusahaan / Klien)'}
                    </p>
                  </div>
                  <div className="border-l border-slate-300 pl-5 flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Diterbitkan Oleh</span>
                    <span className="font-bold text-xs uppercase text-slate-950">PT. NISKALA ID TECH</span>
                    <span className="text-[10px] text-slate-600 font-medium">{businessLineLabel} | Bandung, Jawa Barat</span>
                    <span className="text-[9px] text-slate-500 mt-1">Harap melakukan pembayaran sebelum tanggal jatuh tempo.</span>
                  </div>
                </div>

                {/* Table Items */}
                <table className="w-full mb-8 border-y border-slate-900">
                  <thead>
                    <tr className="text-slate-950 text-[9px] font-bold tracking-wider uppercase border-b border-slate-900">
                      <th className="py-2.5 px-2 text-center w-10">No</th>
                      <th className="py-2.5 px-3 text-left">Deskripsi Layanan / Produk</th>
                      <th className="py-2.5 px-3 text-center w-16">Qty</th>
                      <th className="py-2.5 px-3 text-right w-28">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {formData.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-2 text-center font-mono text-[10px] text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3 font-semibold text-slate-950">{it.desc || '-'}</td>
                        <td className="py-3 px-3 text-center font-mono font-semibold">{it.qty}</td>
                        <td className="py-3 px-3 text-right font-mono">{formatCurrency(it.price)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">{formatCurrency(it.qty * it.price)}</td>
                      </tr>
                    ))}
                    {formData.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">Belum ada item tagihan yang ditambahkan</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Bottom Section */}
                <div className="grid grid-cols-12 gap-8 mb-12">
                  <div className="col-span-7 space-y-4">
                    <div className="">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-2">
                        Metode Pembayaran
                      </p>
                      <div className="text-[10px] space-y-1 font-mono">
                        <div><span className="text-slate-500">BANK:</span> <strong>{formData.bankName || 'BANK MANDIRI'}</strong></div>
                        <div><span className="text-slate-500">NO. REK:</span> <strong className="text-sm">{formData.bankAccount || '1370024220468'}</strong></div>
                        <div><span className="text-slate-500">A.N:</span> <strong>{formData.bankHolder || 'FARIS DWI RAMADHAN'}</strong></div>
                      </div>
                    </div>
                    {formData.notes && (
                      <div className="text-[9px] text-slate-500 border-l border-slate-300 pl-3 py-1">
                        <strong>Catatan:</strong> {formData.notes}
                      </div>
                    )}
                  </div>

                  <div className="col-span-5 space-y-2 text-right">
                    <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Subtotal:</span>
                      <span className="font-mono font-bold">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Pajak (0%):</span>
                      <span className="font-mono font-bold">Rp 0</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-3 border-y border-slate-900 mt-2 font-bold">
                      <span className="uppercase text-[10px] tracking-wider">Total Tagihan:</span>
                      <span className="font-mono text-base text-slate-950">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-end text-center no-break">
                  <div className="w-64">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Disetujui oleh,</p>
                    <div className="h-14 flex items-end justify-center">
                      {canAutoAttachCeoSignature && (
                        <img
                          src="/ceo-signature.png"
                          alt="Tanda tangan CEO"
                          className="max-h-14 max-w-[190px] object-contain opacity-95"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <p className="font-bold text-xs uppercase border-t border-slate-800 pt-2">FARIS DWI RAMADHAN</p>
                    <p className="text-[9px] text-slate-500 font-semibold">CEO PT. NISKALA ID TECH</p>
                  </div>
                  <div className="hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-12">PENERIMA / KLIEN,</p>
                    <p className="font-black text-xs uppercase underline decoration-2">{formData.client || '( ...................................... )'}</p>
                    <p className="text-[9px] text-gray-500 font-bold">TANDA TANGAN & STEMPEL</p>
                  </div>
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center text-[7px] font-semibold text-slate-300 uppercase tracking-[0.18em]">
                  PT. NISKALA ID TECH | Finance Document
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Riwayat Invoice</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daftar seluruh faktur tagihan yang pernah diterbitkan</p>
            </div>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Nomor INV</th>
                <th>Klien</th>
                {activeWorkspace === 'global' && <th className="text-center">Lini Bisnis</th>}
                <th>Tanggal</th>
                {isCLevel && <th className="text-center">Audit</th>}
                <th className="text-right">Total</th>
                <th className="text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                [...invoices].reverse().map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono font-bold text-xs whitespace-nowrap">{inv.num}</td>
                    <td className="font-bold text-xs text-slate-900 dark:text-slate-100">{inv.client}</td>
                    {activeWorkspace === 'global' && (
                      <td className="text-center">
                        <span className="neo-badge bg-[#4682B4]/10 text-[#4682B4] px-2 py-0.5 text-[10px] font-bold uppercase rounded-md">
                          {inv.businessLine || 'niskala'}
                        </span>
                      </td>
                    )}
                    <td className="font-medium text-xs text-slate-500 whitespace-nowrap">{inv.date}</td>
                    {isCLevel && (
                      <td className="text-center">
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {inv.createdBy?.name || 'Sistem lama'}
                        </div>
                        {inv.updatedBy && (
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            Ubah: {inv.updatedBy.name}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="text-right font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                      {formatCurrency(inv.items.reduce((a, b) => a + (b.qty * b.price), 0))}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleLoadInvoice(inv, false)}
                          title="Tampilkan data invoice ini di Live Preview / Form"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">Lihat</span>
                        </button>
                        <button
                          onClick={() => handleLoadInvoice(inv, true)}
                          title="Cetak Ulang Dokumen Invoice Ini"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4682B4] hover:bg-[#386b94] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>Cetak</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={historyColSpan} className="text-center py-16 lg:py-20">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={40} className="text-slate-300 dark:text-slate-600" />
                      <div className="font-bold text-sm text-slate-400">Belum Ada Riwayat Invoice</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
