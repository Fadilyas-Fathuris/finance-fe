import React from 'react';
import { FileText, Printer, BarChart, CreditCard, Users, Building2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import type { Transaction, Subscriber, Employee, Opex, Workspace } from '../Types';
import { cn, StatCard } from './Common';
import { generateDocNumber } from '../utils/docNumbering';

interface ReportsViewProps {
  transactions: Transaction[];
  subscribers: Subscriber[];
  employees: Employee[];
  opex: Opex[];
  formatCurrency: (amount: number) => string;
  activeWorkspace: Workspace;
}

const WORKSPACE_LABELS: Record<Workspace, string> = {
  global: 'Global',
  niskala: 'Niskala',
  aksalab: 'Aksalab',
  snapcala: 'Snapcala',
};

const BUSINESS_LINES = ['niskala', 'aksalab', 'snapcala'] as const;

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, subscribers, employees, opex, formatCurrency, activeWorkspace }) => {
  const totalIn = transactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
  const totalSalary = employees.reduce((acc, e) => acc + e.thp, 0);
  const totalOpex = opex.reduce((acc, o) => acc + o.amount, 0);
  
  const hppTransactions = transactions.filter(t => t.category === 'event_cost' || t.category === 'event');
  const totalHPP = hppTransactions.filter(t => t.type === 'out').reduce((a, b) => a + b.amount, 0);

  const grossProfit = totalIn - totalHPP;
  const netIncome = grossProfit - totalSalary - totalOpex;
  const netMargin = totalIn > 0 ? Math.round((netIncome / totalIn) * 100) : 0;
  const generatedDate = new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  const reportNumber = generateDocNumber('LK', 1);

  const businessLineSummary = BUSINESS_LINES.map(line => {
    const lineTransactions = transactions.filter(t => t.businessLine === line);
    const lineSubscribers = subscribers.filter(s => s.businessLine === line);
    const lineEmployees = employees.filter(e => e.businessLine === line);
    const lineOpex = opex.filter(o => o.businessLine === line);
    const income = lineTransactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
    const expense = lineTransactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
    const salary = lineEmployees.reduce((acc, e) => acc + e.thp, 0);
    const fixedCost = lineOpex.reduce((acc, o) => acc + o.amount, 0);

    return {
      line,
      income,
      expense,
      salary,
      fixedCost,
      net: income - expense - salary - fixedCost,
      mrr: lineSubscribers.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.monthly * s.units), 0),
    };
  });

  const printReport = () => {
    const report = document.getElementById('financial-report-document');
    if (!report) {
      window.print();
      return;
    }

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = report.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      <div id="financial-report-document" className="hidden">
        <style>{`
          @page { size: A4 portrait; margin: 14mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #ffffff;
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .doc-page { width: 100%; min-height: 269mm; padding: 0; position: relative; }
          .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111827; padding-bottom: 18px; margin-bottom: 22px; }
          .doc-brand { display: flex; align-items: center; gap: 14px; }
          .doc-logo { width: 72px; height: 72px; object-fit: contain; }
          .doc-title { font-size: 24px; font-weight: 900; letter-spacing: .04em; margin: 0; text-transform: uppercase; }
          .doc-subtitle { margin: 4px 0 0; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #4b5563; }
          .doc-meta { text-align: right; font-size: 10px; line-height: 1.7; color: #374151; }
          .doc-meta strong { color: #111827; text-transform: uppercase; }
          .doc-section-title { background: #111827; color: #ffffff; padding: 9px 12px; margin: 22px 0 0; font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
          .doc-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
          .doc-table th, .doc-table td { border: 1.5px solid #111827; padding: 9px 10px; font-size: 11px; vertical-align: top; }
          .doc-table th { background: #f3f4f6; text-align: left; text-transform: uppercase; letter-spacing: .08em; font-size: 9px; }
          .doc-table .num { text-align: right; font-family: "Courier New", monospace; font-weight: 700; white-space: nowrap; }
          .doc-total td { background: #e5e7eb; font-weight: 900; }
          .doc-profit td { background: #d9f99d; font-weight: 900; }
          .doc-loss td { background: #fecaca; font-weight: 900; }
          .doc-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0 20px; }
          .doc-card { border: 1.5px solid #111827; padding: 10px; min-height: 66px; }
          .doc-card-label { font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; color: #6b7280; margin-bottom: 8px; }
          .doc-card-value { font-size: 13px; font-weight: 900; font-family: "Courier New", monospace; }
          .doc-note { border: 1.5px solid #111827; padding: 12px; font-size: 10px; line-height: 1.6; color: #374151; margin-top: 18px; }
          .doc-signature { display: flex; justify-content: flex-end; margin-top: 44px; page-break-inside: avoid; }
          .doc-signature-box { width: 240px; text-align: center; font-size: 11px; }
          .doc-signature-space { height: 76px; }
          .doc-signature-name { border-top: 2px solid #111827; padding-top: 8px; font-weight: 900; text-transform: uppercase; }
          .doc-footer { position: absolute; bottom: 0; left: 0; right: 0; border-top: 1px solid #d1d5db; padding-top: 8px; font-size: 8px; color: #6b7280; text-align: center; letter-spacing: .12em; text-transform: uppercase; }
        `}</style>
        <div className="doc-page">
          <div className="doc-header">
            <div className="doc-brand">
              <img src="/logo.png" alt="Niskala Logo" className="doc-logo" />
              <div>
                <h1 className="doc-title">Laporan Keuangan</h1>
                <p className="doc-subtitle">Niskala Finance Official Statement</p>
              </div>
            </div>
            <div className="doc-meta">
              <div><strong>No. Dokumen:</strong> {reportNumber}</div>
              <div><strong>Tanggal:</strong> {generatedDate}</div>
              <div><strong>Lini Bisnis:</strong> {WORKSPACE_LABELS[activeWorkspace]}</div>
              <div><strong>Status:</strong> Final untuk ditinjau</div>
            </div>
          </div>

          <div className="doc-summary">
            <div className="doc-card">
              <div className="doc-card-label">Total Pendapatan</div>
              <div className="doc-card-value">{formatCurrency(totalIn)}</div>
            </div>
            <div className="doc-card">
              <div className="doc-card-label">Total Pengeluaran</div>
              <div className="doc-card-value">{formatCurrency(totalHPP + totalSalary + totalOpex)}</div>
            </div>
            <div className="doc-card">
              <div className="doc-card-label">Laba Bersih</div>
              <div className="doc-card-value">{formatCurrency(netIncome)}</div>
            </div>
            <div className="doc-card">
              <div className="doc-card-label">Net Margin</div>
              <div className="doc-card-value">{netMargin}%</div>
            </div>
          </div>

          <div className="doc-section-title">Laporan Laba Rugi</div>
          <table className="doc-table">
            <tbody>
              <tr>
                <td>Total Pendapatan</td>
                <td className="num">{formatCurrency(totalIn)}</td>
              </tr>
              <tr>
                <td>HPP / COGS Proyek</td>
                <td className="num">({formatCurrency(totalHPP)})</td>
              </tr>
              <tr className="doc-total">
                <td>Laba Kotor</td>
                <td className="num">{formatCurrency(grossProfit)}</td>
              </tr>
              <tr>
                <td>Gaji dan Tunjangan</td>
                <td className="num">({formatCurrency(totalSalary)})</td>
              </tr>
              <tr>
                <td>Biaya Operasional</td>
                <td className="num">({formatCurrency(totalOpex)})</td>
              </tr>
              <tr className={netIncome >= 0 ? 'doc-profit' : 'doc-loss'}>
                <td>Laba Bersih</td>
                <td className="num">{formatCurrency(netIncome)}</td>
              </tr>
            </tbody>
          </table>

          {activeWorkspace === 'global' && (
            <>
              <div className="doc-section-title">Ringkasan Per Lini Bisnis</div>
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Lini Bisnis</th>
                    <th className="num">Pendapatan</th>
                    <th className="num">Pengeluaran</th>
                    <th className="num">MRR Aktif</th>
                    <th className="num">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {businessLineSummary.map(item => (
                    <tr key={item.line}>
                      <td>{WORKSPACE_LABELS[item.line]}</td>
                      <td className="num">{formatCurrency(item.income)}</td>
                      <td className="num">{formatCurrency(item.expense + item.salary + item.fixedCost)}</td>
                      <td className="num">{formatCurrency(item.mrr)}</td>
                      <td className="num">{formatCurrency(item.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className="doc-note">
            Dokumen ini dibuat oleh sistem Niskala Finance berdasarkan data transaksi, pelanggan aktif,
            penggajian, dan biaya operasional yang tercatat pada workspace {WORKSPACE_LABELS[activeWorkspace]}.
            Dokumen ditujukan sebagai laporan internal dan bahan pengambilan keputusan manajemen.
          </div>

          <div className="doc-signature">
            <div className="doc-signature-box">
              <div>Tangerang, {generatedDate}</div>
              <div>Disetujui oleh,</div>
              <div className="doc-signature-space" />
              <div className="doc-signature-name">Faris Dwi Ramadhan</div>
              <div>Chief Executive Officer</div>
            </div>
          </div>

          <div className="doc-footer">
            Niskala Finance - Confidential Internal Financial Report
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; color: black !important; }
          .report-no-print { display: none !important; }
          .neo-card, .neo-container { box-shadow: none !important; break-inside: avoid; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #111827; padding: 8px; }
        }
      `}</style>
      {/* Hero Banner */}
      <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm">
        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-3 lg:gap-4 mb-2">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
              <BarChart size={24} />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100">Financial Insight</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-xs text-slate-500 dark:text-slate-400">Digenerate pada {new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</p>
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 border border-[#4682B4]/20 rounded-full text-[#4682B4] bg-[#4682B4]/10">
              {WORKSPACE_LABELS[activeWorkspace]}
            </span>
          </div>
        </div>
        <button onClick={printReport} className="report-no-print bg-[#4682B4] hover:bg-[#2F6F9F] text-white py-3 px-5 text-sm font-bold rounded-xl relative z-10 shrink-0 w-full md:w-auto flex items-center justify-center gap-2 shadow-sm transition-colors">
          <Printer size={18} /> Cetak Laporan
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* P&L Statement */}
        <div className="lg:col-span-7 neo-card p-5 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 lg:mb-8 gap-2" style={{ borderBottom: 'var(--border-size) solid var(--border-color)' }}>
            <h3 className="text-base lg:text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              Laporan Laba Rugi
            </h3>
            <div className="text-[9px] lg:text-[10px] font-black uppercase italic px-3 py-1 border-2 rounded-md shrink-0" style={{ color: 'var(--text-faint)', background: 'var(--bg-elevated)', borderColor: 'var(--divider)' }}>Bulanan</div>
          </div>
          
          <div className="space-y-4 lg:space-y-6">
            <ReportItem label="TOTAL PENDAPATAN" value={formatCurrency(totalIn)} color="text-green-600" large />
            <ReportItem label="HPP / COGS (PROYEK)" value={`(${formatCurrency(totalHPP)})`} color="text-red-500" />
            <div className="border-t-2 border-dashed my-2" style={{ borderColor: 'var(--border-color)' }} />
            <ReportItem label="LABA KOTOR (GROSS PROFIT)" value={formatCurrency(grossProfit)} bold />
            <div className="space-y-3 lg:space-y-4 pt-4 mt-4" style={{ borderTop: '2px solid var(--divider)' }}>
              <ReportItem label="GAJI & TUNJANGAN" value={`(${formatCurrency(totalSalary)})`} color="text-red-400" />
              <ReportItem label="BIAYA OPERASIONAL (OPEX)" value={`(${formatCurrency(totalOpex)})`} color="text-red-400" />
            </div>
            
            {/* Net Income Box */}
            <div className="mt-6 lg:mt-8 bg-[#1a1a2e] text-white rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(163,230,53,1)] lg:shadow-[8px_8px_0px_0px_rgba(163,230,53,1)]">
              <div className="p-5 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] lg:text-[10px] font-black italic uppercase opacity-60 tracking-[0.3em] block mb-1 text-white">Bottom Line Result</span>
                  <span className="text-base lg:text-xl font-black italic uppercase text-white">NET INCOME</span>
                  {netIncome > 0 ? 
                    <div className="flex items-center gap-1 text-[#A3E635] text-[9px] font-black mt-1 uppercase italic"><TrendingUp size={10} /> Profit Zone</div> : 
                    <div className="flex items-center gap-1 text-red-500 text-[9px] font-black mt-1 uppercase italic"><TrendingDown size={10} /> Loss Zone</div>
                  }
                </div>
                <div className={cn(
                  "text-2xl lg:text-3xl xl:text-4xl font-black italic tabular-nums tracking-tighter",
                  netIncome >= 0 ? 'text-[#A3E635]' : 'text-red-500'
                )}>
                  {formatCurrency(netIncome)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Transaksi" value={transactions.length} sub="Stream Kas Terdata" icon={<CreditCard size={18} />} variant="primary" />
            <StatCard label="Active Subs" value={subscribers.length} sub="Pelanggan Aktif" icon={<FileText size={18} />} variant="purple" />
            <StatCard label="Headcount" value={employees.length} sub="Karyawan Perusahaan" icon={<Users size={18} />} variant="emerald" />
            <StatCard label="Fixed Costs" value={opex.length} sub="Pos OPEX Terdaftar" icon={<Building2 size={18} />} variant="rose" />
          </div>
          
          {/* Business Status */}
          <div className="neo-card flex-1 flex flex-col p-5 lg:p-8 border-[3px]">
             <div className="flex items-center justify-between mb-6 lg:mb-8">
               <span className="text-[9px] lg:text-[10px] font-black uppercase italic tracking-widest" style={{ color: 'var(--text-faint)' }}>Business Performance Status</span>
               <Target size={18} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
             </div>
             
             <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
               <div className={cn(
                 "text-lg lg:text-2xl xl:text-3xl font-black italic uppercase tracking-tighter leading-tight p-3 lg:p-4 border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg w-full",
                 netIncome > 0 ? 'bg-[#A3E635] text-black border-black' : 'bg-red-500 text-white border-black'
               )}>
                 {netIncome > 0 ? 'MENGUNTUNGKAN' : 'PERLU EVALUASI'}
               </div>
               
               <div className="w-full pt-6 lg:pt-8">
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-[9px] font-black uppercase italic" style={{ color: 'var(--text-faint)' }}>Net Profit Margin</span>
                   <span className="text-lg lg:text-xl font-black italic">{netMargin}%</span>
                 </div>
                 <div className="w-full h-3 border-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-color)' }}>
                   <div 
                    className={cn("h-full transition-all duration-1000", netIncome > 0 ? 'bg-blue-600' : 'bg-red-400')}
                    style={{ width: `${Math.max(0, Math.min(100, netMargin))}%` }}
                   />
                 </div>
                 <p className="text-[8px] font-bold mt-2 uppercase italic tracking-tight" style={{ color: 'var(--text-faint)' }}>Persentase laba bersih dari total pendapatan kotor.</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {activeWorkspace === 'global' && (
        <div className="neo-card p-5 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 gap-2" style={{ borderBottom: 'var(--border-size) solid var(--border-color)' }}>
            <h3 className="text-base lg:text-xl font-black uppercase italic tracking-tighter">Ringkasan Per Lini Bisnis</h3>
            <div className="text-[9px] lg:text-[10px] font-black uppercase italic px-3 py-1 border-2 rounded-md shrink-0" style={{ color: 'var(--text-faint)', background: 'var(--bg-elevated)', borderColor: 'var(--divider)' }}>Global View</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {businessLineSummary.map(item => (
              <div key={item.line} className="border-[3px] rounded-xl p-4 lg:p-5" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
                <div className="font-black uppercase italic text-xs lg:text-sm tracking-widest mb-4">{WORKSPACE_LABELS[item.line]}</div>
                <div className="space-y-3">
                  <ReportItem label="Pendapatan" value={formatCurrency(item.income)} color="text-green-600" />
                  <ReportItem label="Pengeluaran" value={`(${formatCurrency(item.expense + item.salary + item.fixedCost)})`} color="text-red-500" />
                  <ReportItem label="MRR Aktif" value={formatCurrency(item.mrr)} />
                  <div className="border-t-2 border-dashed pt-3" style={{ borderColor: 'var(--divider)' }}>
                    <ReportItem label="Net" value={formatCurrency(item.net)} color={item.net >= 0 ? 'text-green-600' : 'text-red-500'} bold />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== SUB COMPONENTS =====
interface ReportItemProps {
  label: string;
  value: string;
  color?: string;
  large?: boolean;
  bold?: boolean;
}

const ReportItem: React.FC<ReportItemProps> = ({ label, value, color = "", large, bold }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
    <span className={cn(
      "uppercase font-black italic tracking-wider",
      bold ? 'text-xs lg:text-sm' : 'text-[9px] lg:text-[10px]'
    )} style={bold ? { color: 'var(--text-primary)' } : { color: 'var(--text-faint)' }}>{label}</span>
    <span className={cn(
      "font-black italic tabular-nums tracking-tighter",
      color,
      large ? 'text-xl lg:text-2xl' : 'text-base lg:text-lg',
      bold && 'text-lg lg:text-xl'
    )} style={!color ? { color: 'var(--text-primary)' } : {}}>{value}</span>
  </div>
);

export default ReportsView;
