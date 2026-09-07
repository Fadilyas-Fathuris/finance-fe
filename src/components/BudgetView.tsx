import React from 'react';
import { Target } from 'lucide-react';
import type { Budget, Transaction, Employee, Opex } from '../Types';
import { FormGroup, BudgetProgress } from './Common';

interface BudgetViewProps {
  budget: Budget;
  transactions: Transaction[];
  employees: Employee[];
  opex: Opex[];
  setBudget: (b: Budget) => void;
  formatCurrency: (amount: number) => string;
}

const BudgetView: React.FC<BudgetViewProps> = ({ budget, transactions, employees, opex, setBudget, formatCurrency }) => {
  const actualIn = transactions.filter((t:any) => t.type === 'in').reduce((a:any, b:any) => a + b.amount, 0);
  const actualGaji = employees.reduce((a:any, b:any) => a + b.thp, 0);
  const actualOpex = opex.reduce((a:any, b:any) => a + b.amount, 0);
  
  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Budget Parameters */}
          <div className="lg:col-span-7 app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-2xl shadow-sm space-y-6 lg:space-y-8">
             <div className="flex items-center gap-3 lg:gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
                   <Target size={20} />
                </div>
                <div>
                   <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Parameter Anggaran</h2>
                   <p className="text-xs text-slate-400 mt-0.5">Target & Batas Fiskal Operasional Perusahaan</p>
                </div>
             </div>
             <div className="space-y-6 lg:space-y-8">
                <FormGroup label="Target Pemasukan Bulanan (Revenue Goal)">
                   <div className="relative">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">RP</div>
                     <input type="number" value={budget.incomeTarget} onChange={e => setBudget({...budget, incomeTarget: Number(e.target.value)})} className="neo-input text-xl lg:text-2xl font-bold font-mono py-3.5 pl-12 tabular-nums" />
                   </div>
                </FormGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                   <FormGroup label="Limit Payroll"><input type="number" value={budget.gaji} onChange={e => setBudget({...budget, gaji: Number(e.target.value)})} className="neo-input text-base lg:text-lg font-bold font-mono py-2.5 px-4" /></FormGroup>
                   <FormGroup label="Limit Operasional"><input type="number" value={budget.operasional} onChange={e => setBudget({...budget, operasional: Number(e.target.value)})} className="neo-input text-base lg:text-lg font-bold font-mono py-2.5 px-4" /></FormGroup>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                   <strong>Catatan:</strong> Target ini bersifat internal dan digunakan sebagai tolok ukur performa pada visualisasi grafik dan dashboard eksekutif.
                </div>
             </div>
          </div>

          {/* Performance */}
          <div className="lg:col-span-5 app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 space-y-8 rounded-2xl shadow-sm relative overflow-hidden">
             <div className="border-b border-slate-100 dark:border-slate-800 pb-4 relative z-10">
                <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Performa vs Target</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-xs text-slate-400">Live Calculation</span>
                </div>
             </div>
             <div className="space-y-6 relative z-10">
                <BudgetProgress label="Pemasukan" actual={actualIn} target={budget.incomeTarget} formatCurrency={formatCurrency} isIncome />
                <BudgetProgress label="Payroll Karyawan" actual={actualGaji} target={budget.gaji} formatCurrency={formatCurrency} />
                <BudgetProgress label="Operasional" actual={actualOpex} target={budget.operasional} formatCurrency={formatCurrency} />
             </div>
          </div>
       </div>
    </div>
  );
};

export default BudgetView;
