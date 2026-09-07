import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { Transaction, Workspace } from '../Types';
import { cn, StatCard } from './Common';
import { useAuth } from '../context/AuthContext';

interface AnalyticsViewProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
}

interface MonthlyData { month: string; income: number; expense: number; net: number; }
interface CategoryData { name: string; value: number; }

const WORKSPACE_LABELS: Record<Workspace, string> = {
  global: 'Global',
  niskala: 'Niskala',
  aksalab: 'Aksalab',
  snapcala: 'Snapcala',
};

const BUSINESS_LINES = ['niskala', 'aksalab', 'snapcala'] as const;

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, formatCurrency }) => {
  const { activeWorkspace } = useAuth();
  const monthsMap = new Map<string, MonthlyData>();
  transactions.forEach(t => {
    const month = t.date.substring(0, 7);
    if (!monthsMap.has(month)) monthsMap.set(month, { month, income: 0, expense: 0, net: 0 });
    const data = monthsMap.get(month);
    if (data) {
      if (t.type === 'in') data.income += t.amount;
      else data.expense += t.amount;
      data.net = data.income - data.expense;
    }
  });

  const chartData = Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  const incomeCats: CategoryData[] = [];
  const incMap = new Map<string, number>();
  transactions.filter(t => t.type === 'in').forEach(t => {
    incMap.set(t.category, (incMap.get(t.category) || 0) + t.amount);
  });
  incMap.forEach((value, name) => incomeCats.push({ name, value }));

  const expenseCats: CategoryData[] = [];
  const expMap = new Map<string, number>();
  transactions.filter(t => t.type === 'out').forEach(t => {
    expMap.set(t.category, (expMap.get(t.category) || 0) + t.amount);
  });
  expMap.forEach((value, name) => expenseCats.push({ name, value }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  const businessLineSummary = BUSINESS_LINES.map(line => {
    const lineTransactions = transactions.filter(t => t.businessLine === line);
    const income = lineTransactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
    const expense = lineTransactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
    return {
      line,
      income,
      expense,
      net: income - expense,
      count: lineTransactions.length,
    };
  });

  const tooltipStyle = {
    backgroundColor: 'var(--bg-card, #fff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontWeight: '600',
    fontSize: '12px',
    borderRadius: '12px',
    color: 'var(--text-primary, #0f172a)'
  };

  const avgIncome = chartData.length ? chartData.reduce((acc, d) => acc + d.income, 0) / chartData.length : 0;
  const avgExpense = chartData.length ? chartData.reduce((acc, d) => acc + d.expense, 0) / chartData.length : 0;
  const totalNet = transactions.reduce((acc, t) => acc + (t.type === 'in' ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">Analitik & Performa Keuangan</h2>
          <p className="text-xs text-slate-400 mt-1">Metrik visualisasi tren dan distribusi arus kas</p>
        </div>
        <div className="app-badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold rounded-xl">
          Scope: {WORKSPACE_LABELS[activeWorkspace]}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <StatCard label="Rata-rata Pemasukan" value={formatCurrency(avgIncome)} sub="Kinerja Omzet Bulanan" icon={<TrendingUp size={20} />} variant="emerald" />
        <StatCard label="Rata-rata Pengeluaran" value={formatCurrency(avgExpense)} sub="Alokasi OPEX Bulanan" icon={<TrendingDown size={20} />} variant="rose" />
        <StatCard label="Likuiditas Bersih" value={formatCurrency(totalNet)} sub="Total Surplus/Defisit Kas" icon={<Activity size={20} />} variant={totalNet >= 0 ? 'primary' : 'rose'} />
      </div>

      {activeWorkspace === 'global' && (
        <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-2xl shadow-sm">
          <div className="pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Komparasi Performa Lini Bisnis</h2>
            <p className="text-xs text-slate-400 mt-0.5">Perbandingan pendapatan dan biaya antar entitas</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {businessLineSummary.map(item => (
              <div key={item.line} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{WORKSPACE_LABELS[item.line]}</div>
                  <div className="text-[10px] font-semibold px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">
                    {item.count} transaksi
                  </div>
                </div>
                <div className="space-y-3">
                  <AnalyticsLine label="Pendapatan" value={formatCurrency(item.income)} color="text-emerald-600 dark:text-emerald-400" />
                  <AnalyticsLine label="Pengeluaran" value={formatCurrency(item.expense)} color="text-rose-600 dark:text-rose-400" />
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <AnalyticsLine label="Net Flow" value={formatCurrency(item.net)} color={item.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} strong />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Bar Chart */}
        <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col p-6 lg:p-8 rounded-2xl shadow-sm" style={{ minHeight: '360px' }}>
          <div className="pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#4682B4]" /> Performa Operasional Bulanan
            </h2>
          </div>
          <div className="flex-1 w-full min-h-[250px] lg:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-faint)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-faint)" tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col p-6 lg:p-8 rounded-2xl shadow-sm" style={{ minHeight: '360px' }}>
          <div className="pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity size={18} className="text-[#4682B4]" /> Lintasan Laba Bersih (Net Flow)
            </h2>
          </div>
          <div className="flex-1 w-full min-h-[250px] lg:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-faint)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-faint)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="net" name="Net Flow" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie: Income */}
        <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col p-6 lg:p-8 rounded-2xl shadow-sm" style={{ minHeight: '360px' }}>
          <div className="pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Kanal Pendapatan</h2>
          </div>
          <div className="flex-1 w-full min-h-[250px] lg:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incomeCats} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={80} dataKey="value"
                >
                  {incomeCats.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie: Expense */}
        <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col p-6 lg:p-8 rounded-2xl shadow-sm" style={{ minHeight: '360px' }}>
          <div className="pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Distribusi Pengeluaran</h2>
          </div>
          <div className="flex-1 w-full min-h-[250px] lg:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseCats} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={80} dataKey="value"
                >
                  {expenseCats.map((_, index) => <Cell key={index} fill={COLORS[(index + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsLine = ({ label, value, color, strong }: { label: string; value: string; color: string; strong?: boolean }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
    <span className={cn("font-bold font-mono text-xs sm:text-sm whitespace-nowrap", color, strong && "text-sm sm:text-base")}>{value}</span>
  </div>
);

export default AnalyticsView;
