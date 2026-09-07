import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'emerald' | 'amber' | 'rose' | 'purple' | 'sky' | 'indigo' | 'default';
  className?: string;
  onClick?: () => void;
}

const VARIANT_STYLES = {
  primary: {
    iconBg: 'bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 group-hover:bg-[#4682B4] group-hover:text-white',
    dotBg: 'bg-[#4682B4]',
    valColor: 'text-slate-900 dark:text-slate-100',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white',
    dotBg: 'bg-emerald-500',
    valColor: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white',
    dotBg: 'bg-amber-500',
    valColor: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 group-hover:bg-rose-600 group-hover:text-white',
    dotBg: 'bg-rose-500',
    valColor: 'text-rose-600 dark:text-rose-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white',
    dotBg: 'bg-purple-500',
    valColor: 'text-purple-600 dark:text-purple-400',
  },
  sky: {
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white',
    dotBg: 'bg-sky-500',
    valColor: 'text-sky-600 dark:text-sky-400',
  },
  indigo: {
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white',
    dotBg: 'bg-indigo-500',
    valColor: 'text-indigo-600 dark:text-indigo-400',
  },
  default: {
    iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 group-hover:bg-[#4682B4] group-hover:text-white',
    dotBg: 'bg-slate-400',
    valColor: 'text-slate-900 dark:text-slate-100',
  }
};

export const StatCard = ({ label, value, sub, icon, variant = 'primary', className, onClick }: StatCardProps) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-w-0 space-y-3",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
          {label}
        </span>
        {icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300", styles.iconBg)}>
            {icon}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className={cn("text-xl sm:text-2xl xl:text-3xl font-black font-mono tracking-tight break-words truncate", styles.valColor)}>
          {value}
        </div>

        {sub && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1.5 truncate">
            <span className={cn("inline-block w-1.5 h-1.5 shrink-0 rounded-full", styles.dotBg)} />
            <span className="truncate">{sub}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const BudgetProgress = ({ label, actual, target, formatCurrency, isIncome }: any) => {
  const pct = Math.min(100, Math.round((actual / (target || 1)) * 100));
  const over = !isIncome && actual > target;
  
  return (
    <div className="space-y-2.5">
       <div className="flex justify-between items-center">
          <span className="font-semibold text-xs lg:text-sm text-slate-800 dark:text-slate-200">{label}</span>
          <span className={cn("text-base lg:text-lg font-bold tabular-nums font-mono", over ? "text-rose-500" : pct >= 100 && isIncome ? "text-emerald-500" : "text-[#4682B4]")}>{pct}%</span>
       </div>
       <div className="h-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden rounded-full">
          <div className={cn("h-full transition-all duration-700 rounded-full", isIncome ? "bg-emerald-500" : over ? "bg-rose-500" : "bg-[#4682B4]")} style={{ width: `${pct}%` }} />
       </div>
       <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight tabular-nums font-mono">
          <span>Actual: {formatCurrency(actual)}</span>
          <span>Target: {formatCurrency(target)}</span>
       </div>
    </div>
  );
};

export const BudgetMiniItem = ({ label, pct, color }: any) => (
  <div className="space-y-1.5">
     <div className="flex justify-between text-[11px] font-semibold text-slate-400 tracking-wide">
        <span>{label}</span>
        <span>{pct}%</span>
     </div>
     <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
     </div>
  </div>
);

export const FormGroup = ({ label, children, textWhite }: any) => (
  <div className="space-y-1.5 w-full">
    <label className={cn(
      "block text-[11px] font-semibold uppercase tracking-wider ml-0.5",
      textWhite ? "text-slate-200" : "text-slate-600 dark:text-slate-400"
    )}>
      {label}
    </label>
    {children}
  </div>
);
