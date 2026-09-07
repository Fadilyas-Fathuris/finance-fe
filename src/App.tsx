import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Package, 
  Laptop, 
  Calculator, 
  Building2, 
  Users, 
  BarChart3, 
  Target, 
  FileText, 
  Printer,
  Menu,
  X,
  PieChart,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown
} from 'lucide-react';
import type { Transaction, Subscriber, Project, Opex, Employee, Budget, Invoice, Page, ProfitShareScheme, Quotation, Workspace } from './Types';
import HPPCalculator from './HPPCalculator';
import SalaryView from './components/SalaryView';
import AnalyticsView from './components/AnalyticsView';
import InvoiceView from './components/InvoiceView';
import ReportsView from './components/ReportsView';
import ProjectsView from './components/ProjectsView';
import OpexView from './components/OpexView';
import DashboardView from './components/DashboardView';
import CashflowView from './components/CashflowView';
import SubscribersView from './components/SubscribersView';
import BudgetView from './components/BudgetView';
import ProfitShareView from './components/ProfitShareView';
import QuotationView from './components/QuotationView';
import VenuePartnersView from './components/VenuePartnersView';
import ThemeToggle from './components/ThemeToggle';
import { cn } from './components/Common';
import { api } from './api';
import { useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';

// ===== ROLE & WORKSPACE NAV CONFIGURATION =====
type Role = 'CEO' | 'CFO' | 'MANAGER' | 'STAFF';

const navItems: { id: string; label: string; icon: React.ReactNode; section: string; allowedRoles: Role[]; allowedWorkspaces?: Workspace[] }[] = [
  { id: 'dashboard',      label: 'Dashboard',             icon: <LayoutDashboard size={18} />, section: 'Overview',            allowedRoles: ['CEO', 'CFO', 'MANAGER', 'STAFF'], allowedWorkspaces: ['global', 'niskala', 'aksalab', 'snapcala'] },
  { id: 'cashflow',       label: 'Arus Kas',              icon: <Wallet size={18} />,          section: 'Overview',            allowedRoles: ['CEO', 'CFO', 'MANAGER', 'STAFF'], allowedWorkspaces: ['global', 'niskala', 'aksalab', 'snapcala'] },
  { id: 'subscribers',    label: 'Lisensi & Kuota SaaS',  icon: <Package size={18} />,         section: 'Aksalab SaaS',        allowedRoles: ['CEO', 'CFO', 'MANAGER'],          allowedWorkspaces: ['global', 'aksalab'] },
  { id: 'projects',       label: 'Proyek Software',      icon: <Laptop size={18} />,          section: 'Niskala Dev',         allowedRoles: ['CEO', 'CFO', 'MANAGER'],          allowedWorkspaces: ['global', 'niskala'] },
  { id: 'venue_partners', label: 'Venue & Bagi Hasil',   icon: <Store size={18} />,           section: 'Snapcala Photobooth', allowedRoles: ['CEO', 'CFO', 'MANAGER'],          allowedWorkspaces: ['global', 'snapcala'] },
  { id: 'hpp',            label: 'Kalkulator HPP',        icon: <Calculator size={18} />,      section: 'Niskala Dev',         allowedRoles: ['CEO', 'CFO', 'MANAGER'],          allowedWorkspaces: ['global', 'niskala'] },
  { id: 'opex',           label: 'Biaya Operasional',     icon: <Building2 size={18} />,       section: 'Biaya & Ops',         allowedRoles: ['CEO', 'CFO', 'MANAGER'],          allowedWorkspaces: ['global', 'niskala', 'aksalab', 'snapcala'] },
  { id: 'salary',         label: 'Gaji Karyawan',         icon: <Users size={18} />,           section: 'SDM',                 allowedRoles: ['CEO', 'CFO'],                     allowedWorkspaces: ['global', 'niskala', 'aksalab', 'snapcala'] },
  { id: 'profitshare',    label: 'Bagi Hasil Investor',   icon: <PieChart size={18} />,        section: 'Analitik & Dokumen',  allowedRoles: ['CEO', 'CFO', 'MANAGER'],          allowedWorkspaces: ['global', 'snapcala', 'niskala', 'aksalab'] },
  { id: 'analytics',      label: 'Grafik & Analitik',     icon: <BarChart3 size={18} />,       section: 'Analitik & Dokumen',  allowedRoles: ['CEO', 'CFO'],                     allowedWorkspaces: ['global', 'niskala', 'aksalab', 'snapcala'] },
  { id: 'budget',         label: 'Target & Budget',       icon: <Target size={18} />,          section: 'Analitik & Dokumen',  allowedRoles: ['CEO', 'CFO'],                     allowedWorkspaces: ['global', 'niskala', 'aksalab', 'snapcala'] },
  { id: 'invoice',        label: 'Invoice Generator',     icon: <FileText size={18} />,        section: 'Analitik & Dokumen',  allowedRoles: ['CEO', 'CFO', 'MANAGER'],          allowedWorkspaces: ['global', 'niskala', 'aksalab'] },
  { id: 'quotation',      label: 'SOW / Quotation',       icon: <FileText size={18} />,        section: 'Niskala Dev',         allowedRoles: ['CEO', 'CFO', 'MANAGER'],          allowedWorkspaces: ['global', 'niskala'] },
  { id: 'reports',        label: 'Cetak Laporan',         icon: <Printer size={18} />,         section: 'Analitik & Dokumen',  allowedRoles: ['CEO', 'CFO'],                     allowedWorkspaces: ['global', 'niskala', 'aksalab', 'snapcala'] },
];

const MONTHS = [
  { val: 'all', label: 'Semua Bulan' },
  { val: 1, label: 'Januari' }, { val: 2, label: 'Februari' }, { val: 3, label: 'Maret' },
  { val: 4, label: 'April' }, { val: 5, label: 'Mei' }, { val: 6, label: 'Juni' },
  { val: 7, label: 'Juli' }, { val: 8, label: 'Agustus' }, { val: 9, label: 'September' },
  { val: 10, label: 'Oktober' }, { val: 11, label: 'November' }, { val: 12, label: 'Desember' }
];

const YEARS = ['all', 2024, 2025, 2026, 2027];

const WORKSPACE_LABELS: Record<Workspace, string> = {
  global: 'Global',
  niskala: 'Niskala',
  aksalab: 'Aksalab',
  snapcala: 'Snapcala',
};


// ===== FORMAT HELPER =====
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

// ===== APP =====
const App: React.FC = () => {
  const { user, loading: authLoading, logout, activeWorkspace, setActiveWorkspace } = useAuth();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Overview: true,
  });

  // Filters
  const [filterMonth, setFilterMonth] = useState<number | 'all'>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number | 'all'>(new Date().getFullYear());

  // Modal state for Soft Delete
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    targetId: string;
    targetType: 'transaction' | 'opex';
    targetName: string;
    reason: string;
  }>({
    isOpen: false,
    targetId: '',
    targetType: 'transaction',
    targetName: '',
    reason: '',
  });

  // Data state with actual backend synchronization
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [opex, setOpex] = useState<Opex[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [profitShareSchemes, setProfitShareSchemes] = useState<ProfitShareScheme[]>([]);
  const [budget, setBudget] = useState<Budget>({
    incomeTarget: 100000000,
    gaji: 30000000,
    server: 5000000,
    marketing: 10000000,
    operasional: 10000000,
    event: 20000000
  });
  const [loading, setLoading] = useState(true);

  // Load data from backend on mount
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setLoading(true);
        const [
          txData,
          subData,
          projData,
          opexData,
          empData,
          invData,
          quotData,
          psData,
          budgetData
        ] = await Promise.all([
          api.getTransactions(),
          api.getSubscribers(),
          api.getProjects(),
          api.getOpex(),
          api.getEmployees(),
          api.getInvoices(),
          api.getQuotations(),
          api.getProfitShareSchemes(),
          api.getBudget().catch(() => ({
            incomeTarget: 100000000,
            gaji: 30000000,
            server: 5000000,
            marketing: 10000000,
            operasional: 10000000,
            event: 20000000
          })) // fallback if not seeded
        ]);

        setTransactions(txData);
        setSubscribers(subData);
        setProjects(projData);
        setOpex(opexData);
        setEmployees(empData);
        setInvoices(invData);
        setQuotations(quotData);
        setProfitShareSchemes(psData);
        setBudget(budgetData);
      } catch (err) {
        console.error('Failed to load data from backend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // ===== WORKSPACE + DATE FILTERING =====
  const isCLevel = user?.role === 'CEO' || user?.role === 'CFO';

  // Helper: filter any array by businessLine based on active workspace
  const filterByWorkspace = <T extends { businessLine?: string }>(data: T[]): T[] => {
    if (activeWorkspace === 'global') return data; // C-level global view: show all
    return data.filter(d => d.businessLine === activeWorkspace);
  };

  // Workspace-filtered data
  const wsTransactions = filterByWorkspace(transactions);
  const wsSubscribers = filterByWorkspace(subscribers);
  const wsProjects = filterByWorkspace(projects);
  const wsOpex = filterByWorkspace(opex);
  const wsEmployees = filterByWorkspace(employees);
  const wsInvoices = filterByWorkspace(invoices);

  // Date-filtered transactions (on top of workspace filter)
  const filteredTransactions = wsTransactions.filter(t => {
    const d = new Date(t.date);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    if (filterMonth !== 'all' && m !== filterMonth) return false;
    if (filterYear !== 'all' && y !== filterYear) return false;
    return true;
  });

  // Computed values based on filtered + workspace-scoped transactions
  const totalIn = filteredTransactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = filteredTransactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
  const netIncome = totalIn - totalOut;
  const mrr = wsSubscribers.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.monthly * s.units), 0);
  const subCount = wsSubscribers.reduce((acc, s) => acc + s.units, 0);

  // Close sidebar on page change (mobile)
  const handlePageChange = useCallback((page: Page) => {
    setActivePage(page);
    setSidebarOpen(false);
  }, []);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    const activeSection = navItems.find(item => item.id === activePage)?.section;
    if (!activeSection) return;
    setOpenSections(prev => prev[activeSection] ? prev : { ...prev, [activeSection]: true });
  }, [activePage]);

  const getBadge = (id: string) => {
    if (id === 'subscribers' && subCount > 0) return subCount.toString();
    return undefined;
  };

  // ===== HANDLERS =====
  const handleAddTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      const saved = await api.createTransaction({ ...t, createdById: user?.id });
      setTransactions(prev => [saved, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllTransactions = async (reason: string) => {
    try {
      await Promise.all(transactions.map(t => api.deleteTransaction(t.id, user?.id, reason || 'Reset ledger oleh C-Level')));
      setTransactions([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubscriber = async (s: Omit<Subscriber, 'id'>) => {
    try {
      const saved = await api.createSubscriber(s);
      setSubscribers(prev => [saved, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      await api.deleteSubscriber(id);
      setSubscribers(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (p: Omit<Project, 'id'>) => {
    try {
      const saved = await api.createProject(p);
      setProjects(prev => [saved, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOpex = async (o: Omit<Opex, 'id'>) => {
    try {
      const saved = await api.createOpex({ ...o, createdById: user?.id });
      setOpex(prev => [saved, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDeleteTransaction = (id: string) => {
    const t = transactions.find(item => item.id === id);
    if (!t) return;
    setDeleteModal({
      isOpen: true,
      targetId: id,
      targetType: 'transaction',
      targetName: `${t.type === 'in' ? 'Pemasukan' : 'Pengeluaran'} - ${t.category} (${formatCurrency(t.amount)})`,
      reason: '',
    });
  };

  const triggerDeleteOpex = (id: string) => {
    const o = opex.find(item => item.id === id);
    if (!o) return;
    setDeleteModal({
      isOpen: true,
      targetId: id,
      targetType: 'opex',
      targetName: `OPEX - ${o.name} (${formatCurrency(o.amount)} / ${o.freq === 'monthly' ? 'bulan' : 'tahun'})`,
      reason: '',
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.reason.trim()) return;
    try {
      if (deleteModal.targetType === 'transaction') {
        await api.deleteTransaction(deleteModal.targetId, user?.id, deleteModal.reason);
        setTransactions(prev => prev.filter(t => t.id !== deleteModal.targetId));
      } else {
        await api.deleteOpex(deleteModal.targetId, user?.id, deleteModal.reason);
        setOpex(prev => prev.filter(o => o.id !== deleteModal.targetId));
      }
      setDeleteModal({ isOpen: false, targetId: '', targetType: 'transaction', targetName: '', reason: '' });
    } catch (err) {
      console.error('Failed to soft delete:', err);
    }
  };

  const handleAddEmployee = async (e: Omit<Employee, 'id' | 'thp'>) => {
    try {
      const saved = await api.createEmployee(e);
      setEmployees(prev => [...prev, saved]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.deleteEmployee(id);
      setEmployees(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetSchemes = async (newSchemes: React.SetStateAction<ProfitShareScheme[]>) => {
    try {
      const schemesArray = typeof newSchemes === 'function' ? newSchemes(profitShareSchemes) : newSchemes;
      const synced = await api.updateProfitShareSchemes(schemesArray);
      setProfitShareSchemes(synced);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBudget = async (newBudget: React.SetStateAction<Budget>) => {
    try {
      const budgetObj = typeof newBudget === 'function' ? newBudget(budget) : newBudget;
      const saved = await api.updateBudget(budgetObj);
      setBudget(saved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInvoice = async (inv: Omit<Invoice, 'id'>) => {
    try {
      const saved = await api.createInvoice({ ...inv, createdById: user?.id });
      setInvoices(prev => [saved, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuotation = async (q: Omit<Quotation, 'id'>) => {
    try {
      const saved = await api.createQuotation(q);
      setQuotations(prev => [saved, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // ===== RENDER PAGE =====
  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="neo-card bg-[#A3E635] text-black border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-8 py-6 font-black uppercase italic tracking-wider flex flex-col items-center gap-4">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-black rounded-full" />
            <div>Memuat Data Keuangan...</div>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard': 
        return <DashboardView totalIn={totalIn} totalOut={totalOut} netIncome={netIncome} mrr={mrr} subCount={subCount} formatCurrency={formatCurrency} transactions={filteredTransactions} subscribers={wsSubscribers} />;
      case 'cashflow': 
        return <CashflowView transactions={filteredTransactions} addTransaction={handleAddTransaction} formatCurrency={formatCurrency} clearAll={handleClearAllTransactions} deleteTransaction={triggerDeleteTransaction} />;
      case 'subscribers': 
        return <SubscribersView subscribers={wsSubscribers} addSubscriber={handleAddSubscriber} deleteSubscriber={handleDeleteSubscriber} formatCurrency={formatCurrency} />;
      case 'projects':
        return <ProjectsView projects={wsProjects} addProject={handleAddProject} deleteProject={handleDeleteProject} formatCurrency={formatCurrency} />;
      case 'venue_partners':
        return <VenuePartnersView formatCurrency={formatCurrency} />;
      case 'hpp':
        return <HPPCalculator />;
      case 'opex':
        return <OpexView opex={wsOpex} addOpex={handleAddOpex} deleteOpex={triggerDeleteOpex} formatCurrency={formatCurrency} />;
      case 'salary':
        return <SalaryView employees={wsEmployees} addEmployee={handleAddEmployee} deleteEmployee={handleDeleteEmployee} formatCurrency={formatCurrency} />;
      case 'profitshare':
        return <ProfitShareView netIncome={netIncome} schemes={profitShareSchemes} setSchemes={handleSetSchemes} formatCurrency={formatCurrency} />;
      case 'analytics':
        return <AnalyticsView transactions={filteredTransactions} formatCurrency={formatCurrency} />;
      case 'budget':
        return <BudgetView budget={budget} transactions={filteredTransactions} employees={wsEmployees} opex={wsOpex} setBudget={handleUpdateBudget} formatCurrency={formatCurrency} />;
      case 'invoice':
        return <InvoiceView invoices={wsInvoices} addInvoice={handleAddInvoice} formatCurrency={formatCurrency} />;
      case 'quotation':
        return <QuotationView quotations={quotations} addQuotation={handleAddQuotation} formatCurrency={formatCurrency} />;
      case 'reports':
        return <ReportsView transactions={filteredTransactions} subscribers={wsSubscribers} employees={wsEmployees} opex={wsOpex} formatCurrency={formatCurrency} activeWorkspace={activeWorkspace} />;
      default: 
        return <div className="neo-card">Halaman ini sedang dalam pengembangan.</div>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#111827] flex items-center justify-center p-6">
        <div className="neo-card bg-[#A3E635] text-black border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-8 py-6 font-black uppercase italic tracking-wider flex flex-col items-center gap-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-black rounded-full" />
          <div className="font-bold font-mono">Memeriksa Otentikasi...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className={cn("app-layout", sidebarMinimized && "sidebar-minimized")}>
      {/* ===== MOBILE OVERLAY ===== */}
      <div 
        className={cn("sidebar-overlay", sidebarOpen && "visible")}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ===== SIDEBAR ===== */}
      <aside className={cn("app-sidebar flex flex-col", sidebarOpen && "open")}>
        {/* Logo */}
        <div className="sidebar-header shrink-0 p-5 flex items-center justify-between border-b border-[var(--border-color)]">
          <div 
            className={cn("flex items-center gap-3 group cursor-pointer min-w-0", sidebarMinimized && "lg:justify-center lg:w-full")} 
            onClick={() => handlePageChange('dashboard')}
            title={sidebarMinimized ? 'Niskala Finance' : undefined}
          >
            <img src="/logo.png" alt="Niskala Logo" className="w-10 h-10 object-contain shrink-0 group-hover:scale-105 transition-all duration-300" />
            <div className={cn("flex flex-col min-w-0 sidebar-label", sidebarMinimized && "lg:hidden")}>
              <span className="text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">NISKALA <span className="text-[#4682B4] font-extrabold">FINANCE</span></span>
              <span className="text-[9px] font-medium text-slate-400 tracking-wider">Digital Profit System</span>
            </div>
          </div>
          <button
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0 sidebar-collapse-toggle"
            onClick={() => setSidebarMinimized(prev => !prev)}
            title={sidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
            aria-label={sidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {sidebarMinimized ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          {/* Close button (mobile) */}
          <button 
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6 pb-6">
          {(() => {
            const userRole = user.role as Role;
            const visibleItems = navItems.filter(i => 
              i.allowedRoles.includes(userRole) &&
              (!i.allowedWorkspaces || i.allowedWorkspaces.includes(activeWorkspace))
            );
            const visibleSections = Array.from(new Set(visibleItems.map(i => i.section)));
            return visibleSections.map(section => {
              const sectionItems = visibleItems.filter(i => i.section === section);
              const sectionOpen = sidebarMinimized || (openSections[section] ?? sectionItems.some(i => i.id === activePage));
              const sectionActive = sectionItems.some(i => i.id === activePage);

              return (
              <div key={section} className="sidebar-section">
              <button
                type="button"
                onClick={() => setOpenSections(prev => ({ ...prev, [section]: !sectionOpen }))}
                className={cn(
                  "sidebar-section-toggle w-full text-[10px] font-bold uppercase tracking-wider mb-2.5 px-2.5 py-2 text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors",
                  sectionActive && "text-[#4682B4] dark:text-sky-300 bg-[#4682B4]/5 dark:bg-sky-400/10",
                  sidebarMinimized && "lg:hidden"
                )}
                aria-expanded={sectionOpen}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", sectionActive ? "bg-[#4682B4]" : "bg-slate-300 dark:bg-slate-600")} />
                  <span className="truncate">{section}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">{sectionItems.length}</span>
                  <ChevronDown size={13} className={cn("transition-transform", sectionOpen && "rotate-180")} />
                </span>
              </button>
              <div className={cn("space-y-1 overflow-hidden transition-all", sectionOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                {sectionItems.map(item => {
                  const badge = getBadge(item.id);
                  return (
                    <button 
                      key={item.id}
                      onClick={() => handlePageChange(item.id as Page)}
                      title={sidebarMinimized ? item.label : undefined}
                      className={cn(
                        "w-full transition-all flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold group relative",
                        sidebarMinimized && "lg:justify-center lg:px-2.5",
                        activePage === item.id 
                          ? "bg-[#4682B4] text-white shadow-sm font-bold" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors shrink-0",
                        activePage === item.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                      )}>
                        {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { size: 14 }) : item.icon}
                      </div>
                      <span className={cn("flex-1 text-left tracking-wide truncate sidebar-label", sidebarMinimized && "lg:hidden")}>{item.label}</span>
                      {badge && (
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 sidebar-badge",
                          sidebarMinimized && "lg:hidden",
                          activePage === item.id ? "bg-white/20 text-white" : "bg-[#4682B4]/10 text-[#4682B4] dark:bg-sky-400/20 dark:text-sky-300"
                        )}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            );
          });
          })()}
        </nav>

        {/* User Card */}
        <div className="shrink-0 p-4 border-t border-[var(--border-color)] flex flex-col gap-3 bg-[var(--bg-card)]">
          <div className={cn("flex items-center justify-between px-1 sidebar-footer-actions", sidebarMinimized && "lg:hidden")}>
            <ThemeToggle />
            <button
              onClick={logout}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3 py-1 rounded-lg transition-all"
            >
              Keluar
            </button>
          </div>

          <div
            className={cn("p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center gap-3", sidebarMinimized && "lg:justify-center lg:px-2")}
            title={sidebarMinimized ? `${user.name} - ${user.role}` : undefined}
          >
            <div className="w-9 h-9 bg-[#4682B4] text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className={cn("overflow-hidden sidebar-label", sidebarMinimized && "lg:hidden")}>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
              <div className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-wider">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE NAV TOGGLE ===== */}
      <button 
        className="mobile-nav-toggle"
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
      </button>

      {/* ===== MAIN CONTENT ===== */}
      <main className="app-main">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-[#4682B4] rounded-full" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                {navItems.find(i => i.id === activePage)?.label}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {filterMonth === 'all' ? 'Semua Bulan' : MONTHS.find(m => m.val === filterMonth)?.label || 'Semua Bulan'}
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {filterYear === 'all' ? 'Semua Tahun' : `FY ${filterYear}`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            {isCLevel ? (
              <select
                value={activeWorkspace}
                onChange={e => setActiveWorkspace(e.target.value as Workspace)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold rounded-xl cursor-pointer shadow-xs focus:ring-2 focus:ring-[#4682B4]/20"
              >
                {(Object.keys(WORKSPACE_LABELS) as Workspace[]).map(w => (
                  <option key={w} value={w}>Workspace: {WORKSPACE_LABELS[w]}</option>
                ))}
              </select>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold rounded-xl">
                Workspace: {WORKSPACE_LABELS[activeWorkspace]}
              </div>
            )}

            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold rounded-xl cursor-pointer shadow-xs focus:ring-2 focus:ring-[#4682B4]/20"
            >
              {MONTHS.map(m => (
                <option key={m.val} value={m.val}>{m.label}</option>
              ))}
            </select>
            
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold rounded-xl cursor-pointer shadow-xs focus:ring-2 focus:ring-[#4682B4]/20"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y === 'all' ? 'Semua Tahun' : y}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-[1400px] mx-auto animate-fade-in-up">
          {renderPage()}
        </div>
      </main>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        reason={deleteModal.reason}
        setReason={(val) => setDeleteModal(prev => ({ ...prev, reason: val }))}
        targetName={deleteModal.targetName}
      />
    </div>
  );
};

export default App;
