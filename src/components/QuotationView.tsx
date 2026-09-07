import React, { useState } from 'react';
import { FileText, Plus, Trash2, Printer, Save, User, Calendar, Layers } from 'lucide-react';
import type { Quotation, QuotationItem, QuotationMilestone } from '../Types';
import { FormGroup } from './Common';
import { generateDocNumber } from '../utils/docNumbering';
interface QuotationViewProps {
  quotations: Quotation[];
  addQuotation: (q: Omit<Quotation, 'id'>) => void;
  formatCurrency: (amount: number) => string;
}

const DEFAULT_GARANSI = `- Periode garansi gratis selama satu (1) bulan atau hingga sepuluh (10) jam kerja, mana yang lebih dulu, akan diberikan setelah proyek berhasil diterapkan ke lingkungan produksi.
- Garansi ini ditujukan semata-mata untuk memastikan bahwa semua fitur yang disetujui dan diserahkan berfungsi sesuai kesepakatan.
- Selama periode ini, jika ditemukan bug dan/atau masalah teknis, proses revisi dan perbaikan akan sepenuhnya ditangani dan menjadi tanggung jawab Niskala.
- Jam garansi yang dialokasikan tidak boleh digunakan untuk pengembangan baru, fitur tambahan, atau modifikasi di luar Lingkup Pekerjaan (SOW) yang disepakati; setiap permintaan tersebut akan diperlakukan sebagai Permintaan Perubahan dan akan dikenakan estimasi dan persetujuan terpisah.`;

const DEFAULT_TERMS = `- Penawaran harus ditandatangani oleh Klien sebelum dimulainya pekerjaan apapun.
- Pertemuan kick-off akan dijadwalkan segera, sebaiknya dalam 1 hingga 3 hari kerja setelah penunjukan resmi atau penerimaan Purchase Order.
- Proses pengembangan akan dilakukan secara remote dari lokasi masing-masing developer, karena Niskala telah menerapkan kebijakan Bekerja-dari-Mana-Saja.
- Hari kerja standar adalah Senin sampai Jumat, dari pukul 9:00 pagi hingga 6:00 sore, tidak termasuk hari libur nasional Indonesia.`;

const DEFAULT_CHANGE_REQUEST = `- Selama pelaksanaan dan implementasi proyek, Klien dapat mengajukan perubahan terhadap Lingkup Pekerjaan, Konfigurasi, atau Penyesuaian (Permintaan Perubahan / CR).
- Klien harus mengajukan Permintaan Perubahan secara tertulis kepada Niskala. Setelah menerima, Tim Manajemen Proyek Niskala akan melakukan analisis dampak dari permintaan tersebut terhadap perangkat lunak, modul, anggaran proyek, dan timeline proyek.
- Niskala akan menginformasikan kepada Klien hasil analisis dampak, termasuk penyesuaian terhadap anggaran proyek atau jadwal, dan akan menagih biaya tambahan yang terkait dengan Permintaan Perubahan.
- Permintaan Perubahan akan efektif hanya setelah Klien menyetujui penawaran untuk perubahan yang diminta.
- Niskala tidak akan mengakomodasi Permintaan Perubahan verbal atau tidak terdokumentasi dan tidak akan bertanggung jawab atas keterlambatan, kerugian, atau kerusakan yang diakibatkan dari Permintaan Perubahan yang tidak diajukan secara tertulis.`;

const QuotationView: React.FC<QuotationViewProps> = ({ quotations, addQuotation, formatCurrency }) => {
  const [formData, setFormData] = useState<Omit<Quotation, 'id'>>({
    client: '',
    date: new Date().toISOString().split('T')[0],
    categoryName: '1. Development',
    items: [
      { id: '1', scope: 'UI/UX Design (Figma)', publishRate: 2100000, discount: 30, details: 'Design user interface and user experience', workDays: 3 }
    ],
    milestones: [
      { id: 'm1', scope: 'Project agreement', percentage: 50 },
      { id: 'm2', scope: 'Testing User', percentage: 40 },
      { id: 'm3', scope: 'Deployment', percentage: 10 }
    ],
    barterValue: 0,
    garansiText: DEFAULT_GARANSI,
    termsText: DEFAULT_TERMS,
    changeRequestText: DEFAULT_CHANGE_REQUEST,
    authorizedName: 'ARIEF FARIS',
    clientRepresentative: ''
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Math.random().toString(), scope: '', publishRate: 0, discount: 0, details: '', workDays: 1 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleAddMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { id: Math.random().toString(), scope: '', percentage: 0 }]
    });
  };

  const removeMilestone = (index: number) => {
    const newMs = [...formData.milestones];
    newMs.splice(index, 1);
    setFormData({ ...formData, milestones: newMs });
  };

  const updateMilestone = (index: number, field: keyof QuotationMilestone, value: any) => {
    const newMs = [...formData.milestones];
    newMs[index] = { ...newMs[index], [field]: value };
    setFormData({ ...formData, milestones: newMs });
  };

  // Calculations
  const calculatedItems = formData.items.map((item: QuotationItem) => ({
    ...item,
    afterDiscount: item.publishRate * (1 - item.discount / 100)
  }));

  const totalGross = calculatedItems.reduce((acc: number, item) => acc + item.afterDiscount, 0);
  const grandTotal = totalGross - formData.barterValue;
  const totalWorkDays = formData.items.reduce((acc: number, item: QuotationItem) => acc + item.workDays, 0);

  const calculatedMilestones = formData.milestones.map((ms: QuotationMilestone) => ({
    ...ms,
    total: grandTotal * (ms.percentage / 100)
  }));


  const handleSubmit = () => {
    if (!formData.client || formData.items.length === 0) return;
    addQuotation(formData);
    setFormData({
      ...formData,
      client: '',
      items: [{ id: Math.random().toString(), scope: '', publishRate: 0, discount: 0, details: '', workDays: 1 }]
    });
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Form Container */}
        <div className="xl:col-span-12 app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 lg:gap-4 pb-4 mb-6 lg:mb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Quotation / SOW Builder</h2>
              <p className="text-xs text-slate-400 mt-0.5">Niskala Scope of Work & Proposal Generator</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Header Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Nama Klien / Tujuan">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-faint)' }} />
                  <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="neo-input pl-10" placeholder="SD Budi Mulia Tanggerang" />
                </div>
              </FormGroup>
              <FormGroup label="Tanggal Cetak">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-faint)' }} />
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="neo-input pl-10" />
                </div>
              </FormGroup>
              <FormGroup label="Nama Kategori Pekerjaan">
                 <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-faint)' }} />
                  <input type="text" value={formData.categoryName} onChange={e => setFormData({...formData, categoryName: e.target.value})} className="neo-input pl-10" placeholder="1. Development" />
                 </div>
              </FormGroup>
              <FormGroup label="Barter Value (Potongan / Diskon Tambahan)">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-[var(--text-faint)]">RP</span>
                  <input type="number" value={formData.barterValue || ''} onChange={e => setFormData({...formData, barterValue: Number(e.target.value)})} className="neo-input pl-8" />
                </div>
              </FormGroup>
              <FormGroup label="Authorized Person (Niskala)">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-faint)' }} />
                  <input type="text" value={formData.authorizedName} onChange={e => setFormData({...formData, authorizedName: e.target.value})} className="neo-input pl-10" placeholder="ARIEF FARIS" />
                </div>
              </FormGroup>
              <FormGroup label="Client Representative">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-faint)' }} />
                  <input type="text" value={formData.clientRepresentative} onChange={e => setFormData({...formData, clientRepresentative: e.target.value})} className="neo-input pl-10" placeholder="Nama Perwakilan Klien" />
                </div>
              </FormGroup>
            </div>

            {/* Scope Items */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-slate-200 dark:border-slate-700 gap-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Scope of Work Items</h3>
                <button onClick={handleAddItem} className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-colors">
                  <Plus size={12} /> Tambah Task
                </button>
              </div>
              <div className="space-y-4">
                {formData.items.map((item: QuotationItem, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start border-b border-[var(--divider)] pb-4 last:border-0">
                    <div className="col-span-12 md:col-span-3">
                      <label className="text-[9px] font-bold text-gray-500 mb-1 block">Scope Name</label>
                      <input type="text" value={item.scope} onChange={e => updateItem(index, 'scope', e.target.value)} className="neo-input py-2 text-xs" />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                       <label className="text-[9px] font-bold text-gray-500 mb-1 block">Publish Rate</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-[var(--text-faint)]">RP</span>
                        <input type="number" value={item.publishRate || ''} onChange={e => updateItem(index, 'publishRate', Number(e.target.value))} className="neo-input py-2 pl-7 text-xs" />
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 mb-1 block">Discount %</label>
                      <input type="number" value={item.discount || ''} onChange={e => updateItem(index, 'discount', Number(e.target.value))} className="neo-input py-2 text-xs text-center" />
                    </div>
                     <div className="col-span-6 md:col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 mb-1 block">Work Days</label>
                      <input type="number" value={item.workDays || ''} onChange={e => updateItem(index, 'workDays', Number(e.target.value))} className="neo-input py-2 text-xs text-center" />
                    </div>
                    <div className="col-span-10 md:col-span-4">
                      <label className="text-[9px] font-bold text-gray-500 mb-1 block">Details</label>
                      <input type="text" value={item.details} onChange={e => updateItem(index, 'details', e.target.value)} className="neo-input py-2 text-xs" />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-center pt-6">
                      <button onClick={() => removeItem(index)} className="hover:text-red-500 text-gray-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-slate-200 dark:border-slate-700 gap-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Payment Milestones</h3>
                <button onClick={handleAddMilestone} className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-colors">
                  <Plus size={12} /> Tambah Milestone
                </button>
              </div>
              <div className="space-y-3">
                 {formData.milestones.map((ms: QuotationMilestone, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-7 md:col-span-6">
                      <input type="text" value={ms.scope} onChange={e => updateMilestone(index, 'scope', e.target.value)} className="neo-input py-2 text-xs" placeholder="Misal: Project agreement" />
                    </div>
                     <div className="col-span-3 md:col-span-4">
                       <div className="relative">
                          <input type="number" value={ms.percentage || ''} onChange={e => updateMilestone(index, 'percentage', Number(e.target.value))} className="neo-input py-2 pr-6 text-xs text-right" placeholder="50" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-[var(--text-faint)]">%</span>
                       </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button onClick={() => removeMilestone(index)} className="hover:text-red-500 text-gray-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Contents */}
            <div className="space-y-4">
              <FormGroup label="Teks Garansi">
                <textarea value={formData.garansiText} onChange={e => setFormData({...formData, garansiText: e.target.value})} className="neo-input h-24 text-[10px] leading-tight" />
              </FormGroup>
               <FormGroup label="Syarat & Ketentuan">
                <textarea value={formData.termsText} onChange={e => setFormData({...formData, termsText: e.target.value})} className="neo-input h-24 text-[10px] leading-tight" />
              </FormGroup>
               <FormGroup label="Permintaan Perubahan">
                <textarea value={formData.changeRequestText} onChange={e => setFormData({...formData, changeRequestText: e.target.value})} className="neo-input h-28 text-[10px] leading-tight" />
              </FormGroup>
            </div>

            {/* Footer Form Action */}
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 lg:p-6 -mx-6 lg:-mx-8 -mb-6 lg:-mb-8 rounded-b-2xl gap-4 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Grand Total (Estimasi)</div>
                <div className="text-xl lg:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{formatCurrency(grandTotal)}</div>
              </div>
              <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl text-xs lg:text-sm w-full sm:w-auto font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                <Save size={16} /> SIMPAN SOW
              </button>
            </div>

          </div>
        </div>

        {/* Print Preview Container */}
        <div className="xl:col-span-12 app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm min-h-[500px]">
           <div className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
             <span className="text-xs font-semibold flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Print Preview
              </span>
              <button onClick={() => {
                const pr = document.getElementById('quotation-print-area');
                if(pr) {
                  const originalContents = document.body.innerHTML;
                  const printContents = pr.innerHTML;
                  document.body.innerHTML = printContents;
                  window.print();
                  document.body.innerHTML = originalContents;
                  window.location.reload(); 
                }
              }} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-xs hover:bg-slate-800">
                <Printer size={14} /> Cetak Dokumen
              </button>
           </div>
           
            <div className="overflow-x-auto p-4 bg-gray-50 flex justify-center">
              {/* THE ACTUAL PRINTABLE AREA */}
              <div 
                id="quotation-print-area" 
                className="bg-white text-black text-xs font-sans p-6 print:p-0 w-[210mm] shadow-xl relative"
                style={{ fontFamily: 'Inter, Arial, sans-serif' }}
              >
                <style>{`
                  @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: white !important; color: black !important; }
                    * { color: black !important; box-sizing: border-box; }
                    table { border-collapse: collapse !important; width: 100% !important; border: 2px solid #000000 !important; }
                    thead { display: table-header-group !important; }
                    th, td { border: 2px solid #000000 !important; padding: 4px !important; }
                    .no-break { page-break-inside: avoid; }
                    .bg-[#0284C7] { background-color: #0284C7 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .bg-[#0284C7] * { color: white !important; }
                    .bg-[#E0F2FE] { background-color: #E0F2FE !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .bg-gray-50 { background-color: #F9FAFB !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                `}</style>

                {/* header */}
                <div className="flex flex-col items-center mb-6 border-b-2 border-black pb-4 pt-2">
                  <img src="/logo.png" alt="Niskala Logo" className="h-24 object-contain mb-1" />
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] italic">Statement of Work / Quotation</div>
                  <div className="text-xs font-mono font-bold text-[#0284C7] mt-1">
                    NO. DOKUMEN: {generateDocNumber('QUO', quotations.length + 1, formData.date)}
                  </div>
                </div>

                <div className="flex justify-between items-end mb-3 px-1">
                  <div>
                    <div className="text-[8px] uppercase font-bold text-gray-500 leading-none mb-1">Client Name / Project</div>
                    <div className="font-black text-sm uppercase italic">{formData.client || '[CLIENT NAME]'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] uppercase font-bold text-gray-500 leading-none mb-1">Date Issued</div>
                    <div className="font-bold text-xs">{formatDateLabel(formData.date)}</div>
                  </div>
                </div>

                {/* Table SCOPE */}
                <table className="w-full border-collapse mb-4" style={{ border: '1.5px solid black' }}>
                  <thead>
                    <tr className="bg-[#0284C7] text-white text-[9px] text-center uppercase tracking-wider">
                      <th className="border-2 border-black px-1 py-1.5 font-black w-[4%] bg-[#0284C7] text-white" style={{ border: '2px solid black' }}>NO</th>
                      <th className="border-2 border-black px-2 py-1.5 font-black text-left w-[22%] bg-[#0284C7] text-white" style={{ border: '2px solid black' }}>SCOPE OF WORK</th>
                      <th className="border-2 border-black px-2 py-1.5 font-black w-[13%] bg-[#0284C7] text-white" style={{ border: '2px solid black' }}>RATE</th>
                      <th className="border-2 border-black px-2 py-1.5 font-black w-[8%] bg-[#0284C7] text-white" style={{ border: '2px solid black' }}>DISC</th>
                      <th className="border-2 border-black px-2 py-1.5 font-black w-[15%] bg-[#0284C7] text-white" style={{ border: '2px solid black' }}>TOTAL</th>
                      <th className="border-2 border-black px-2 py-1.5 font-black text-left bg-[#0284C7] text-white" style={{ border: '2px solid black' }}>SPECIFICATIONS / DETAILS</th>
                      <th className="border-2 border-black px-1 py-1.5 font-black w-[7%] leading-tight text-center bg-[#0284C7] text-white" style={{ border: '2px solid black' }}>DAYS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="border-2 border-black px-2 py-1 font-black text-[10px] uppercase italic text-center" style={{ border: '2px solid black' }}>
                        {formData.categoryName}
                      </td>
                    </tr>
                    {calculatedItems.map((item, i: number) => (
                      <tr key={i} className="text-[9px]">
                        <td className="border-2 border-black px-1 py-1 text-center font-bold text-gray-400" style={{ border: '2px solid black' }}>{i + 1}</td>
                        <td className="border-2 border-black px-2 py-1 font-bold uppercase" style={{ border: '2px solid black' }}>{item.scope}</td>
                        <td className="border-2 border-black px-2 py-1 text-right text-gray-600" style={{ border: '2px solid black' }}>{formatCurrency(item.publishRate)}</td>
                        <td className="border-2 border-black px-2 py-1 text-center text-gray-600" style={{ border: '2px solid black' }}>{item.discount}%</td>
                        <td className="border-2 border-black px-2 py-1 text-right font-black" style={{ border: '2px solid black' }}>{formatCurrency(item.afterDiscount)}</td>
                        <td className="border-2 border-black px-2 py-1 leading-tight text-[8px] italic text-gray-700" style={{ border: '2px solid black' }}>{item.details}</td>
                        <td className="border-2 border-black px-1 py-1 text-center font-bold" style={{ border: '2px solid black' }}>{item.workDays}</td>
                      </tr>
                    ))}
                    {/* Summary rows */}
                    <tr className="bg-[#0284C7] text-white font-black text-[10px]">
                       <td colSpan={4} className="border-2 border-black px-3 py-1 text-left uppercase italic tracking-tighter" style={{ border: '2px solid black' }}>Net Scope Value</td>
                      <td className="border-2 border-black px-3 py-1 text-right bg-[#E0F2FE] text-black font-bold" colSpan={2} style={{ border: '2px solid black' }}>{formatCurrency(totalGross)}</td>
                      <td className="border-2 border-black text-center align-middle font-black bg-white text-black" rowSpan={3} style={{ border: '2px solid black' }}>{totalWorkDays}</td>
                    </tr>
                     <tr className="bg-[#0284C7] text-white font-black text-[10px]">
                      <td colSpan={4} className="border-2 border-black px-3 py-1 text-left uppercase italic tracking-tighter" style={{ border: '2px solid black' }}>Adjustment / Barter</td>
                      <td className="border-2 border-black px-3 py-1 text-right bg-[#E0F2FE] text-black font-bold" colSpan={2} style={{ border: '2px solid black' }}>{formatCurrency(formData.barterValue)}</td>
                    </tr>
                     <tr className="bg-[#0284C7] text-white font-black text-[10px]">
                      <td colSpan={4} className="border-2 border-black px-3 py-1 text-left uppercase italic tracking-wider" style={{ border: '2px solid black' }}>Grand Total Investment</td>
                      <td className="border-2 border-black px-3 py-1 text-right bg-[#E0F2FE] text-black font-black text-xs italic" colSpan={2} style={{ border: '2px solid black' }}>{formatCurrency(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Texts area */}
                <div className="bg-[#E0F2FE] p-4 mb-4 text-[8px] leading-tight border-l-4 border-black border-y border-r border-black/10">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="no-break">
                      <div className="font-black uppercase text-[9px] mb-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-black" /> Garansi & Pemeliharaan
                      </div>
                      <div className="whitespace-pre-wrap ml-3.5 border-l border-black/20 pl-2">{formData.garansiText}</div>
                    </div>

                    <div className="no-break">
                      <div className="font-black uppercase text-[9px] mb-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-black" /> Syarat & Ketentuan Pembayaran
                      </div>
                      <div className="whitespace-pre-wrap ml-3.5 border-l border-black/20 pl-2">{formData.termsText}</div>
                    </div>

                    <div className="no-break">
                      <div className="font-black uppercase text-[9px] mb-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-black" /> Prosedur Perubahan (CR)
                      </div>
                      <div className="whitespace-pre-wrap ml-3.5 border-l border-black/20 pl-2">{formData.changeRequestText}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start mb-6">
                    {/* Milestone Table */}
                    <table className="w-[60%] border-collapse border border-black text-[9px] no-break">
                      <thead>
                        <tr className="bg-[#0284C7] text-white text-center uppercase tracking-tighter">
                          <th className="border border-black px-1 py-1 w-[8%] font-black">#</th>
                          <th className="border border-black px-2 py-1 font-black text-left">Payment Milestone</th>
                          <th className="border border-black px-2 py-1 w-[15%] font-black">%</th>
                          <th className="border border-black px-2 py-1 w-[25%] font-black text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculatedMilestones.map((ms, i: number) => (
                          <tr key={i}>
                            <td className="border border-black px-1 py-1 text-center font-bold">{i+1}</td>
                            <td className="border border-black px-2 py-1 uppercase font-bold text-[8px]">{ms.scope}</td>
                            <td className="border border-black px-2 py-1 text-center">{ms.percentage}%</td>
                            <td className="border border-black px-2 py-1 text-right font-black">{formatCurrency(ms.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Footer Info / Reach Us integrated */}
                    <div className="w-[40%] text-[8px] border border-black p-3 bg-white no-break italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="font-black mb-1 text-[10px] text-[#0284C7] uppercase italic leading-none border-b border-black pb-1">Reach Us</div>
                      <div className="mt-2 font-bold not-italic">Niskala Tech Support:</div>
                      <div className="mt-1 flex justify-between font-black not-italic border-b border-black/10 pb-0.5"><span>WA:</span> <span>0851-7525-6728</span></div>
                      <div className="mt-0.5 flex justify-between font-black not-italic"><span>Email:</span> <span>niskalaidtech@gmail.com</span></div>
                      <div className="mt-2 text-gray-500 font-medium">Please contact us if you have any questions regarding this proposal.</div>
                    </div>
                </div>

                <div className="flex justify-between text-[10px] mt-10 no-break">
                  <div className="w-1/2">
                    <div className="text-[7px] uppercase font-bold text-gray-400 mb-1">Prepared & Authorized By</div>
                    <div className="mb-14 font-black uppercase italic tracking-tighter text-[#0284C7] text-sm">NISKALA TECH ID</div>
                    <div className="border-t-2 border-black w-56 font-black flex justify-center text-[10px] pt-1.5 uppercase italic tracking-widest">
                      {formData.authorizedName || 'ARIEF FARIS'}
                    </div>
                  </div>
                  <div className="w-1/2 text-right">
                    <div className="text-[7px] uppercase font-bold text-gray-400 mb-1">Accepted & Approved By</div>
                    <div className="mb-14 font-black uppercase italic tracking-tighter text-gray-600 text-sm">{formData.client || 'CLIENT ENTITY'}</div>
                    <div className="border-t-2 border-black w-56 float-right justify-center flex font-black text-[10px] pt-1.5 uppercase italic tracking-widest">
                      {formData.clientRepresentative || 'REPRESENTATIVE'}
                    </div>
                  </div>
                </div>

              </div>
           </div>
        </div>
      </div>

      {/* Quotation History */}
      <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs mt-8">
        <div className="p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Riwayat Dokumen (SOW/Quotation)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daftar penawaran proyek yang pernah diterbitkan</p>
            </div>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Kategori</th>
                <th>Tanggal</th>
                <th className="text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {quotations.length > 0 ? (
                [...quotations].reverse().map(q => {
                  const itemsGross = q.items.reduce((acc: number, it: QuotationItem) => acc + (it.publishRate * (1 - it.discount / 100)), 0);
                  const qGrandTotal = itemsGross - (q.barterValue || 0);
                  return (
                    <tr key={q.id}>
                      <td className="font-black uppercase text-[10px] lg:text-xs tracking-tight" style={{ borderRight: '2px solid var(--border-color)' }}>{q.client}</td>
                      <td className="text-[10px] lg:text-xs font-bold" style={{ borderRight: '2px solid var(--border-color)' }}>{q.categoryName}</td>
                      <td className="italic font-bold text-[10px] lg:text-xs whitespace-nowrap" style={{ borderRight: '2px solid var(--border-color)' }}>{q.date}</td>
                      <td className="text-right font-black italic text-sm lg:text-md text-blue-500 tabular-nums tracking-tighter whitespace-nowrap">
                        {formatCurrency(qGrandTotal)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-16 lg:py-20">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={40} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
                      <div className="font-black text-base lg:text-xl uppercase italic tracking-widest" style={{ color: 'var(--text-faint)' }}>Belum Ada Riwayat Dokumen</div>
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

export default QuotationView;
