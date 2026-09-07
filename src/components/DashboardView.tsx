import React from 'react';
import { ArrowUpRight, Plus, Wallet, Camera, FileText, Calculator } from 'lucide-react';
import type { Subscriber, Transaction, Workspace } from '../Types';
import { cn, StatCard, BudgetMiniItem } from './Common';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  totalIn: number;
  totalOut: number;
  netIncome: number;
  mrr: number;
  subCount: number;
  formatCurrency: (amount: number) => string;
  transactions: Transaction[];
  subscribers: Subscriber[];
}

const WORKSPACE_LABELS: Record<Workspace, string> = {
  global: 'Global Workspace',
  niskala: 'Niskala (Dev)',
  aksalab: 'Aksalab (SaaS)',
  snapcala: 'Snapcala (Photo)',
};

const BUSINESS_LINES = ['niskala', 'aksalab', 'snapcala'] as const;

const DashboardView: React.FC<DashboardViewProps> = ({ 
  totalIn, totalOut, netIncome, mrr, subCount, formatCurrency, transactions, subscribers
}) => {
  const { activeWorkspace } = useAuth();
  const latestTrx = transactions.slice(-5).reverse();
  const businessLineSummary = BUSINESS_LINES.map(line => {
    const lineTransactions = transactions.filter(t => t.businessLine === line);
    const lineSubscribers = subscribers.filter(s => s.businessLine === line);
    const income = lineTransactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
    const expense = lineTransactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
    const lineMrr = lineSubscribers.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.monthly * s.units), 0);

    return {
      line,
      income,
      expense,
      net: income - expense,
      mrr: lineMrr,
    };
  });
  
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard label="Live Revenue" value={formatCurrency(totalIn)} sub="Total Pemasukan" icon={<ArrowUpRight size={20} />} variant="emerald" />
        <StatCard label="Burn Rate" value={formatCurrency(totalOut)} sub="Total Pengeluaran" icon={<Plus size={20} className="rotate-45" />} variant="rose" />
        <StatCard label="Net Profit" value={formatCurrency(netIncome)} sub="Likuiditas Bersih" icon={<Wallet size={20} />} variant={netIncome >= 0 ? "emerald" : "rose"} />
        <StatCard label="MRR Subskripsi" value={formatCurrency(mrr)} sub={`Pelanggan Aktif: ${subCount}`} icon={<Camera size={20} />} variant="purple" />
      </div>

      {activeWorkspace === 'global' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Performa Per Lini Bisnis</h2>
            <span className="text-xs font-medium text-slate-400">Ringkasan Konsolidasi C-Level</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {businessLineSummary.map(item => (
              <div key={item.line} className="app-card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold uppercase text-xs tracking-wider text-slate-800 dark:text-slate-200">{WORKSPACE_LABELS[item.line]}</div>
                  <div className={cn(
                    "text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border",
                    item.net >= 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  )}>
                    {item.net >= 0 ? 'Surplus' : 'Defisit'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <MiniMetric label="Pendapatan" value={formatCurrency(item.income)} color="text-emerald-600 dark:text-emerald-400" />
                  <MiniMetric label="Pengeluaran" value={formatCurrency(item.expense)} color="text-rose-600 dark:text-rose-400" />
                  <MiniMetric label="Bersih (Net)" value={formatCurrency(item.net)} color={item.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} />
                  <MiniMetric label="MRR" value={formatCurrency(item.mrr)} color="text-[#4682B4] dark:text-sky-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Recent Activity */}
        <div className="xl:col-span-8 app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
           <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Aktivitas Transaksi Terakhir</h2>
                <p className="text-xs text-slate-400 mt-0.5">Stream transaksi kas real-time</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                LIVE
              </div>
           </div>
           <div className="p-4 space-y-2.5">
              {latestTrx.length > 0 ? latestTrx.map((t: Transaction) => (
                <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100 dark:border-slate-800/80 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all">
                   <div className="flex items-center gap-3.5 min-w-0">
                      <div className={cn(
                        "w-9 h-9 flex items-center justify-center font-bold rounded-xl shrink-0 text-white", 
                        t.type === 'in' ? 'bg-emerald-500' : 'bg-rose-500'
                      )}>
                        {t.type === 'in' ? <Plus size={16} strokeWidth={2.5} /> : <div className="w-3 h-0.5 bg-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{t.description}</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">{t.category} • {t.date}</div>
                      </div>
                   </div>
                   <div className={cn("text-base font-bold tabular-nums font-mono shrink-0", t.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      {t.type === 'in' ? '+' : '-'} {formatCurrency(t.amount)}
                   </div>
                </div>
              )) : (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl mx-auto flex items-center justify-center mb-3">
                    <FileText size={24} className="text-slate-400" />
                  </div>
                  <div className="font-semibold text-slate-400 text-sm">Belum ada transaksi kas</div>
                </div>
              )}
           </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="xl:col-span-4 space-y-6">
           <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="w-10 h-10 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 rounded-xl flex items-center justify-center mb-4">
                <Calculator size={20} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold mb-1">HPP & Event Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">Kalkulasi biaya otomatis & proyeksi HPP untuk perencanaan event yang presisi.</p>
              <button className="w-full bg-[#4682B4] text-white hover:bg-[#2F6F9F] font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm">Buka HPP Engine</button>
           </div>
           
           <div className="app-card bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Monitor Anggaran</h3>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div className="space-y-4">
                 <BudgetMiniItem label="Operasional" pct={45} color="bg-[#4682B4]" />
                 <BudgetMiniItem label="Marketing" pct={82} color="bg-amber-400" />
                 <BudgetMiniItem label="Payroll" pct={95} color="bg-rose-500" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MiniMetric = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="min-w-0">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
    <div className={cn("text-sm font-bold tabular-nums font-mono truncate", color)}>{value}</div>
  </div>
);

export default DashboardView;
