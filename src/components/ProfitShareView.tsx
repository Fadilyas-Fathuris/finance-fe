import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, Building, Plus, Trash2, Edit2, Calculator, 
  Printer, CheckCircle, Clock, Banknote, Award, 
  FileText, X, AlertCircle, TrendingUp
} from 'lucide-react';
import type { ProfitShareScheme, SukukProject, SukukInvestor, SukukSettlementRecord } from '../Types';
import { cn, StatCard } from './Common';
import { api } from '../api';
import { generateDocNumber } from '../utils/docNumbering';

interface ProfitShareViewProps {
  netIncome: number;
  schemes: ProfitShareScheme[];
  setSchemes: React.Dispatch<React.SetStateAction<ProfitShareScheme[]>>;
  formatCurrency: (amount: number) => string;
}

const LOCAL_STORAGE_SUKUK_PROJECTS_KEY = 'niskala_sukuk_projects_v1';
const LOCAL_STORAGE_SUKUK_SETTLEMENTS_KEY = 'niskala_sukuk_settlements_v1';

const INITIAL_SUKUK_PROJECTS: SukukProject[] = [
  {
    id: 'sukuk-p1',
    projectName: 'Pemasangan Booth Photobooth - Kopi Kenangan Junction',
    totalRequiredCapital: 16500000,
    tenorMonths: 18,
    preBepInvestorShare: 80,
    preBepNiskalaShare: 20,
    postBepInvestorShare: 20,
    postBepNiskalaShare: 80,
    startDate: '2026-08-01',
    status: 'active',
    businessLine: 'snapcala',
    investors: [
      {
        id: 'inv-1',
        name: 'Investor A (Budi Santoso)',
        capitalAmount: 10000000,
        ownershipPercent: 60.61,
        returnedCapital: 4848800,
        bankName: 'BCA',
        bankAccount: '1234567890 a.n Budi Santoso',
      },
      {
        id: 'inv-2',
        name: 'Investor B (Siti Rahmawati)',
        capitalAmount: 6500000,
        ownershipPercent: 39.39,
        returnedCapital: 3151200,
        bankName: 'Mandiri',
        bankAccount: '9876543210 a.n Siti Rahmawati',
      }
    ]
  }
];

const INITIAL_SUKUK_SETTLEMENTS: SukukSettlementRecord[] = [
  {
    id: 'set-sukuk-1',
    projectId: 'sukuk-p1',
    projectName: 'Pemasangan Booth Photobooth - Kopi Kenangan Junction',
    periodMonth: '2026-08',
    startDateTime: '2026-08-01T08:00',
    endDateTime: '2026-08-31T23:59',
    monthlyNetProfit: 10000000,
    isBepReached: false,
    appliedInvestorSharePercent: 80,
    appliedNiskalaSharePercent: 20,
    totalInvestorPayout: 8000000,
    totalNiskalaNet: 2000000,
    investorPayoutBreakdown: [
      {
        investorId: 'inv-1',
        investorName: 'Investor A (Budi Santoso)',
        ownershipPercent: 60.61,
        payoutAmount: 4848800,
      },
      {
        investorId: 'inv-2',
        investorName: 'Investor B (Siti Rahmawati)',
        ownershipPercent: 39.39,
        payoutAmount: 3151200,
      }
    ],
    notes: 'Bagi Hasil Bulan Agustus 2026 - Skema 80/20 (Pre-BEP / Balik Modal)',
    status: 'paid',
    createdAt: '2026-08-31'
  }
];

const formatDateTimeRange = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return '-';
  const start = new Date(startStr);
  const end = new Date(endStr);
  const formatDate = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(start)} ${formatTime(start)} s/d ${formatDate(end)} ${formatTime(end)}`;
};

const ProfitShareView: React.FC<ProfitShareViewProps> = ({ 
  netIncome, 
  schemes,
  setSchemes,
  formatCurrency 
}) => {
  // Main Module Tab State
  const [activeMainTab, setActiveMainTab] = useState<'sukuk' | 'simulation'>('sukuk');

  // Sukuk Sub-Tab State
  const [sukukSubTab, setSukukSubTab] = useState<'settlements' | 'projects'>('settlements');

  // State: Sukuk Projects & Settlements
  const [sukukProjects, setSukukProjects] = useState<SukukProject[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SUKUK_PROJECTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SUKUK_PROJECTS;
    } catch {
      return INITIAL_SUKUK_PROJECTS;
    }
  });

  const [sukukSettlements, setSukukSettlements] = useState<SukukSettlementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SUKUK_SETTLEMENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SUKUK_SETTLEMENTS;
    } catch {
      return INITIAL_SUKUK_SETTLEMENTS;
    }
  });

  // LocalStorage Persistence
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SUKUK_PROJECTS_KEY, JSON.stringify(sukukProjects));
    } catch (e) {
      console.error('Failed to save sukuk projects to localStorage', e);
    }
  }, [sukukProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SUKUK_SETTLEMENTS_KEY, JSON.stringify(sukukSettlements));
    } catch (e) {
      console.error('Failed to save sukuk settlements to localStorage', e);
    }
  }, [sukukSettlements]);

  // Modals for Sukuk
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isSettlementFormOpen, setIsSettlementFormOpen] = useState(false);
  const [printSukukSettlement, setPrintSukukSettlement] = useState<{ project: SukukProject; settlement: SukukSettlementRecord } | null>(null);
  const [selectedPrintInvestorId, setSelectedPrintInvestorId] = useState<string>('all');
  const [deleteConfirmProjectId, setDeleteConfirmProjectId] = useState<string | null>(null);

  // Form State: Sukuk Project
  const [projectFormData, setProjectFormData] = useState({
    projectName: '',
    totalRequiredCapital: 16500000,
    tenorMonths: 18,
    preBepInvestorShare: 80,
    preBepNiskalaShare: 20,
    postBepInvestorShare: 20,
    postBepNiskalaShare: 80,
    startDate: '2026-09-01',
    investors: [
      { id: 'inv-1', name: '', capitalAmount: 0, bankName: 'BCA', bankAccount: '' }
    ]
  });

  // Form State: Sukuk Settlement Input
  const [settlementFormData, setSettlementFormData] = useState({
    projectId: '',
    startDateTime: '2026-09-01T08:00',
    endDateTime: '2026-09-30T23:59',
    monthlyNetProfit: 0,
    notes: ''
  });

  // Simulation Scheme State
  const [activeSchemeId, setActiveSchemeId] = useState<string>('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerPct, setPartnerPct] = useState<number>(0);

  useEffect(() => {
    if (schemes.length === 0) {
      const defaultScheme: ProfitShareScheme = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'Total Bisnis Global',
        isAuto: true,
        isProductBased: false,
        manualBaseAmount: 0,
        companyReservePct: 10,
        partners: []
      };
      setSchemes([defaultScheme]);
      setActiveSchemeId(defaultScheme.id);
    } else if (!activeSchemeId || !schemes.find(s => s.id === activeSchemeId)) {
      setActiveSchemeId(schemes[0].id);
    }
  }, [schemes, activeSchemeId, setSchemes]);

  // Project Helper: Get Total Cumulative Payouts to Investors for a project
  const getProjectCumulativeInvestorPayouts = (projectId: string) => {
    return sukukSettlements
      .filter(s => s.projectId === projectId)
      .reduce((acc, s) => acc + s.totalInvestorPayout, 0);
  };

  // Helper: Open Create Project Form
  const handleOpenCreateProject = () => {
    setEditingProjectId(null);
    setProjectFormData({
      projectName: '',
      totalRequiredCapital: 16500000,
      tenorMonths: 18,
      preBepInvestorShare: 80,
      preBepNiskalaShare: 20,
      postBepInvestorShare: 20,
      postBepNiskalaShare: 80,
      startDate: '2026-09-01',
      investors: [
        { id: `inv-${Date.now()}-1`, name: 'Investor A', capitalAmount: 10000000, bankName: 'BCA', bankAccount: '' },
        { id: `inv-${Date.now()}-2`, name: 'Investor B', capitalAmount: 6500000, bankName: 'Mandiri', bankAccount: '' }
      ]
    });
    setIsProjectFormOpen(true);
  };

  // Helper: Open Edit Project Form
  const handleOpenEditProject = (proj: SukukProject) => {
    setEditingProjectId(proj.id);
    setProjectFormData({
      projectName: proj.projectName,
      totalRequiredCapital: proj.totalRequiredCapital,
      tenorMonths: proj.tenorMonths,
      preBepInvestorShare: proj.preBepInvestorShare,
      preBepNiskalaShare: proj.preBepNiskalaShare,
      postBepInvestorShare: proj.postBepInvestorShare,
      postBepNiskalaShare: proj.postBepNiskalaShare,
      startDate: proj.startDate || '2026-09-01',
      investors: proj.investors.map(inv => ({
        id: inv.id,
        name: inv.name,
        capitalAmount: inv.capitalAmount,
        bankName: inv.bankName || 'BCA',
        bankAccount: inv.bankAccount || ''
      }))
    });
    setIsProjectFormOpen(true);
  };

  // Helper: Add Investor Row in Form
  const handleAddInvestorRow = () => {
    setProjectFormData(prev => ({
      ...prev,
      investors: [
        ...prev.investors,
        { id: `inv-${Date.now()}-${prev.investors.length + 1}`, name: '', capitalAmount: 0, bankName: 'BCA', bankAccount: '' }
      ]
    }));
  };

  // Helper: Remove Investor Row
  const handleRemoveInvestorRow = (id: string) => {
    if (projectFormData.investors.length <= 1) {
      alert('Minimal harus ada 1 investor dalam projek sukuk.');
      return;
    }
    setProjectFormData(prev => ({
      ...prev,
      investors: prev.investors.filter(i => i.id !== id)
    }));
  };

  // Save Sukuk Project
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.projectName || projectFormData.totalRequiredCapital <= 0) return;

    const totalInputCapital = projectFormData.investors.reduce((acc, i) => acc + Number(i.capitalAmount || 0), 0);

    // Compute pro-rata ownership percentage for each investor
    const processedInvestors: SukukInvestor[] = projectFormData.investors.map(inv => {
      const cap = Number(inv.capitalAmount || 0);
      const ownershipPercent = totalInputCapital > 0 ? (cap / totalInputCapital) * 100 : 0;
      return {
        id: inv.id,
        name: inv.name || 'Investor Tanpa Nama',
        capitalAmount: cap,
        ownershipPercent: Number(ownershipPercent.toFixed(2)),
        returnedCapital: 0,
        bankName: inv.bankName || 'BCA',
        bankAccount: inv.bankAccount || '-'
      };
    });

    if (editingProjectId) {
      setSukukProjects(prev => prev.map(p => p.id === editingProjectId ? {
        ...p,
        projectName: projectFormData.projectName,
        totalRequiredCapital: Number(projectFormData.totalRequiredCapital),
        tenorMonths: Number(projectFormData.tenorMonths),
        preBepInvestorShare: Number(projectFormData.preBepInvestorShare),
        preBepNiskalaShare: 100 - Number(projectFormData.preBepInvestorShare),
        postBepInvestorShare: Number(projectFormData.postBepInvestorShare),
        postBepNiskalaShare: 100 - Number(projectFormData.postBepInvestorShare),
        startDate: projectFormData.startDate,
        investors: processedInvestors
      } : p));
    } else {
      const newProj: SukukProject = {
        id: `sukuk-p-${Date.now()}`,
        projectName: projectFormData.projectName,
        totalRequiredCapital: Number(projectFormData.totalRequiredCapital),
        tenorMonths: Number(projectFormData.tenorMonths),
        preBepInvestorShare: Number(projectFormData.preBepInvestorShare),
        preBepNiskalaShare: 100 - Number(projectFormData.preBepInvestorShare),
        postBepInvestorShare: Number(projectFormData.postBepInvestorShare),
        postBepNiskalaShare: 100 - Number(projectFormData.postBepInvestorShare),
        startDate: projectFormData.startDate,
        status: 'active',
        businessLine: 'snapcala',
        investors: processedInvestors
      };
      setSukukProjects(prev => [newProj, ...prev]);
      api.createSukukProject(newProj).catch(() => {});
    }

    setIsProjectFormOpen(false);
    setEditingProjectId(null);
  };

  // Delete Sukuk Project
  const handleDeleteProject = (id: string) => {
    setSukukProjects(prev => prev.filter(p => p.id !== id));
    setSukukSettlements(prev => prev.filter(s => s.projectId !== id));
    setDeleteConfirmProjectId(null);
  };

  // Save Sukuk Settlement Distribution Input
  const handleSaveSukukSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProj = sukukProjects.find(p => p.id === settlementFormData.projectId);
    if (!selectedProj) return;

    const monthlyProfit = Number(settlementFormData.monthlyNetProfit) || 0;
    const currentCumulativePayouts = getProjectCumulativeInvestorPayouts(selectedProj.id);
    const isBepAlreadyReached = currentCumulativePayouts >= selectedProj.totalRequiredCapital;

    // Stage Rule: If already BEP -> use Post-BEP rate (20%); Else -> use Pre-BEP rate (80%)
    const appliedInvestorPct = isBepAlreadyReached ? selectedProj.postBepInvestorShare : selectedProj.preBepInvestorShare;
    const appliedNiskalaPct = 100 - appliedInvestorPct;

    const totalInvestorPayout = monthlyProfit * (appliedInvestorPct / 100);
    const totalNiskalaNet = monthlyProfit - totalInvestorPayout;

    // Split payouts pro-rata among project investors
    const breakdown = selectedProj.investors.map(inv => {
      const payoutAmount = totalInvestorPayout * (inv.ownershipPercent / 100);
      return {
        investorId: inv.id,
        investorName: inv.name,
        ownershipPercent: inv.ownershipPercent,
        payoutAmount: Number(payoutAmount.toFixed(0))
      };
    });

    const newSettlement: SukukSettlementRecord = {
      id: `set-sukuk-${Date.now()}`,
      projectId: selectedProj.id,
      projectName: selectedProj.projectName,
      periodMonth: settlementFormData.startDateTime.substring(0, 7),
      startDateTime: settlementFormData.startDateTime,
      endDateTime: settlementFormData.endDateTime,
      monthlyNetProfit: monthlyProfit,
      isBepReached: isBepAlreadyReached || (currentCumulativePayouts + totalInvestorPayout >= selectedProj.totalRequiredCapital),
      appliedInvestorSharePercent: appliedInvestorPct,
      appliedNiskalaSharePercent: appliedNiskalaPct,
      totalInvestorPayout: Math.round(totalInvestorPayout),
      totalNiskalaNet: Math.round(totalNiskalaNet),
      investorPayoutBreakdown: breakdown,
      notes: settlementFormData.notes || `Bagi Hasil Periode (${isBepAlreadyReached ? 'Fase Post-BEP' : 'Fase Pre-BEP'})`,
      status: 'paid',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSukukSettlements(prev => [newSettlement, ...prev]);

    // Synchronize to NestJS Backend Database (Disbursements Table)
    breakdown.forEach(async (inv) => {
      try {
        await api.createDisbursement({
          investorName: inv.investorName,
          businessLine: selectedProj.businessLine || 'snapcala',
          periodMonth: parseInt(settlementFormData.startDateTime.substring(5, 7)) || 9,
          periodYear: parseInt(settlementFormData.startDateTime.substring(0, 4)) || 2026,
          netProfit: monthlyProfit,
          sharePercent: Number((appliedInvestorPct * (inv.ownershipPercent / 100)).toFixed(2)),
          amount: inv.payoutAmount,
          status: 'paid',
          notes: `[Sukuk: ${selectedProj.projectName}] ${settlementFormData.notes || ''}`,
        });
      } catch (err) {
        console.warn('Syncing disbursement to backend database failed, stored in persistent local state', err);
      }
    });

    api.createSukukSettlement(newSettlement).catch(() => {});

    // Update returnedCapital on project investors
    setSukukProjects(prev => prev.map(p => {
      if (p.id !== selectedProj.id) return p;
      return {
        ...p,
        investors: p.investors.map(inv => {
          const match = breakdown.find(b => b.investorId === inv.id);
          return match ? { ...inv, returnedCapital: inv.returnedCapital + match.payoutAmount } : inv;
        })
      };
    }));

    setIsSettlementFormOpen(false);
    setSettlementFormData({
      projectId: '',
      startDateTime: '2026-09-01T08:00',
      endDateTime: '2026-09-30T23:59',
      monthlyNetProfit: 0,
      notes: ''
    });
  };

  // Compute Global Metrics for Sukuk
  const totalSukukCapitalManaged = sukukProjects.reduce((acc, p) => acc + p.totalRequiredCapital, 0);
  const totalSukukInvestorPayouts = sukukSettlements.reduce((acc, s) => acc + s.totalInvestorPayout, 0);
  const totalSukukNiskalaNet = sukukSettlements.reduce((acc, s) => acc + s.totalNiskalaNet, 0);
  const activeSukukProjectCount = sukukProjects.filter(p => p.status === 'active').length;

  // Active Simulation Scheme
  const activeScheme = schemes.find(s => s.id === activeSchemeId) || schemes[0];

  const updateActiveScheme = (updates: Partial<ProfitShareScheme>) => {
    setSchemes(prev => prev.map(s => s.id === activeSchemeId ? { ...s, ...updates } : s));
  };

  const handleAddScheme = () => {
    const newScheme: ProfitShareScheme = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Skenario Simulasi Baru`,
      isAuto: false,
      isProductBased: true,
      productPrice: 750000,
      productQty: 1,
      hppPerYear: 0,
      deductions: [],
      manualBaseAmount: 0,
      companyReservePct: 10,
      partners: []
    };
    setSchemes([...schemes, newScheme]);
    setActiveSchemeId(newScheme.id);
  };

  const handleDeleteScheme = (id: string) => {
    if (schemes.length <= 1) return;
    if (window.confirm('Hapus skenario bagi hasil ini?')) {
      setSchemes(prev => prev.filter(s => s.id !== id));
    }
  };

  // Calculator for simulation
  const isProduct = activeScheme?.isProductBased;
  const productPrice = activeScheme?.productPrice ?? 750000;
  const productQty = activeScheme?.productQty ?? 1;
  const hppPerYear = activeScheme?.hppPerYear ?? 0;
  const monthlyRevenue = productPrice * productQty;
  const monthlyHpp = hppPerYear / 12;
  const grossProfit = monthlyRevenue - monthlyHpp;
  const deductions = activeScheme?.deductions || [];
  const totalDeductionsAmount = deductions.reduce((acc, d) => acc + d.amount, 0);
  const netProfitFromProduct = grossProfit - totalDeductionsAmount;
  const rawBaseIncome = isProduct 
    ? netProfitFromProduct
    : (activeScheme?.isAuto ? netIncome : activeScheme?.manualBaseAmount || 0);
  const baseIncome = Math.max(0, rawBaseIncome);
  const companyReserveAmount = (baseIncome * (activeScheme?.companyReservePct || 10)) / 100;
  const targetToShare = baseIncome - companyReserveAmount;
  const totalAllocatedPct = activeScheme?.partners.reduce((acc, s) => acc + s.percentage, 0) || 0;

  const handleAddPartner = () => {
    if (!partnerName || partnerPct <= 0) return;
    if (totalAllocatedPct + partnerPct > 100) {
      alert('Total persentase partner tidak boleh melebihi 100%');
      return;
    }
    const newPartner = { id: Math.random().toString(36).substr(2, 9), name: partnerName, percentage: partnerPct };
    updateActiveScheme({ partners: [...activeScheme.partners, newPartner] });
    setPartnerName('');
    setPartnerPct(0);
  };

  const handleDeletePartner = (id: string) => {
    updateActiveScheme({ partners: activeScheme.partners.filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Module Header & Main Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Users className="text-[#4682B4]" size={26} />
            Bagi Hasil Investor (Sukuk Projek & Profit Share)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan investasi projek berbasis metode Sukuk & skema pembagian keuntungan dinamis (Pre-BEP 80/20 vs Post-BEP 20/80).
          </p>
        </div>

        {/* Main Tab Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveMainTab('sukuk')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center",
              activeMainTab === 'sukuk'
                ? "bg-[#4682B4] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Award size={16} />
            Projek Investasi Sukuk
          </button>
          <button
            onClick={() => setActiveMainTab('simulation')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center",
              activeMainTab === 'simulation'
                ? "bg-[#4682B4] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Calculator size={16} />
            Simulasi Skenario Umum
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MAIN TAB 1: SUKUK INVESTOR PROJECTS */}
      {/* ================================================================= */}
      {activeMainTab === 'sukuk' && (
        <div className="space-y-6">
          {/* Executive Summary Cards (3 Cards Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <StatCard
              label="TOTAL MODAL DANA SUKUK"
              value={formatCurrency(totalSukukCapitalManaged)}
              sub={`${activeSukukProjectCount} Projek Investasi Aktif`}
              icon={<Building size={20} />}
              variant="primary"
            />
            <StatCard
              label="TOTAL HAK BAGI HASIL INVESTOR"
              value={formatCurrency(totalSukukInvestorPayouts)}
              sub="Terdistribusi ke Para Investor"
              icon={<CheckCircle size={20} />}
              variant="amber"
            />
            <StatCard
              label="RETENSI NISKALA (KAS BERSIH)"
              value={formatCurrency(totalSukukNiskalaNet)}
              sub="Bagian Laba Bersih Perusahaan"
              icon={<TrendingUp size={20} />}
              variant="emerald"
            />
          </div>

          {/* Sukuk Action Bar & Sub-Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSukukSubTab('settlements')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
                  sukukSubTab === 'settlements'
                    ? "bg-[#4682B4] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <FileText size={16} />
                Riwayat Settlement Bagi Hasil ({sukukSettlements.length})
              </button>
              <button
                onClick={() => setSukukSubTab('projects')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
                  sukukSubTab === 'projects'
                    ? "bg-[#4682B4] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Building size={16} />
                Master Projek Investasi ({sukukProjects.length})
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (sukukProjects.length === 0) {
                    alert('Silakan buat Master Projek Investasi Sukuk terlebih dahulu.');
                    return;
                  }
                  setSettlementFormData({
                    projectId: sukukProjects[0].id,
                    startDateTime: '2026-09-01T08:00',
                    endDateTime: '2026-09-30T23:59',
                    monthlyNetProfit: 0,
                    notes: ''
                  });
                  setIsSettlementFormOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"
              >
                <Banknote size={16} />
                Input Settlement Bagi Hasil
              </button>

              <button
                onClick={handleOpenCreateProject}
                className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm flex-1 sm:flex-none"
              >
                <Plus size={16} />
                Tambah Projek Sukuk Baru
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: SETTLEMENTS HISTORY TABLE */}
          {sukukSubTab === 'settlements' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText size={18} className="text-[#4682B4]" />
                Riwayat Settlement Bagi Hasil Investor Periode Bulanan
              </h3>

              {sukukSettlements.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada riwayat settlement bagi hasil investor. Klik "+ Input Settlement Bagi Hasil" untuk menambah catatan baru.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Projek / Rentang Waktu</th>
                        <th className="py-3 px-4 text-right">Laba Bersih Projek</th>
                        <th className="py-3 px-4 text-center">Fase & Skema Rate</th>
                        <th className="py-3 px-4 text-right">Bagi Hasil Investor</th>
                        <th className="py-3 px-4 text-right">Retensi Niskala</th>
                        <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sukukSettlements.map(s => {
                        const proj = sukukProjects.find(p => p.id === s.projectId);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-slate-100">{s.projectName}</div>
                              <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                                <Clock size={12} /> {formatDateTimeRange(s.startDateTime, s.endDateTime)}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(s.monthlyNetProfit)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block",
                                s.isBepReached
                                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                              )}>
                                {s.isBepReached ? `Post-BEP (${s.appliedInvestorSharePercent}%)` : `Pre-BEP (${s.appliedInvestorSharePercent}%)`}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                              {formatCurrency(s.totalInvestorPayout)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(s.totalNiskalaNet)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {proj && (
                                <button
                                  onClick={() => setPrintSukukSettlement({ project: proj, settlement: s })}
                                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 mx-auto transition-all shadow-2xs"
                                >
                                  <Printer size={14} className="text-[#4682B4]" />
                                  Cetak Laporan
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: MASTER PROJECTS LIST */}
          {sukukSubTab === 'projects' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sukukProjects.map(proj => {
                const cumulativePayouts = getProjectCumulativeInvestorPayouts(proj.id);
                const bepProgressPct = Math.min(100, (cumulativePayouts / proj.totalRequiredCapital) * 100);
                const isBepReached = cumulativePayouts >= proj.totalRequiredCapital;

                return (
                  <div key={proj.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm relative">
                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            isBepReached ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          )}>
                            {isBepReached ? 'Post-BEP (Balik Modal Achieved)' : 'Pre-BEP (Menuju Balik Modal)'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Tenor: {proj.tenorMonths} Bulan</span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">{proj.projectName}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditProject(proj)}
                          className="text-slate-400 hover:text-[#4682B4] p-1.5 rounded-lg transition-colors"
                          title="Edit Master Projek Sukuk"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmProjectId(proj.id)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                          title="Hapus Projek Sukuk"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress to BEP Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500">Progres Pengembalian Modal (BEP):</span>
                        <span className="font-bold text-[#4682B4] font-mono">{bepProgressPct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-500 rounded-full", isBepReached ? "bg-purple-500" : "bg-[#4682B4]")}
                          style={{ width: `${bepProgressPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                        <span>Terbayar: {formatCurrency(cumulativePayouts)}</span>
                        <span>Modal: {formatCurrency(proj.totalRequiredCapital)}</span>
                      </div>
                    </div>

                    {/* Stage Share Percent Rules */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">SKEMA PRE-BEP (80/20):</span>
                        <div className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                          Investor {proj.preBepInvestorShare}% • Niskala {proj.preBepNiskalaShare}%
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">SKEMA POST-BEP (20/80):</span>
                        <div className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                          Investor {proj.postBepInvestorShare}% • Niskala {proj.postBepNiskalaShare}%
                        </div>
                      </div>
                    </div>

                    {/* Investors Breakdown List */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                        <span>Daftar Pemegang Modal Investor Sukuk:</span>
                        <span className="text-[10px] text-slate-400 uppercase">Porsi Pro-Rata</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                        {proj.investors.map(inv => (
                          <div key={inv.id} className="p-3 bg-white dark:bg-slate-900 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{inv.name}</div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {inv.bankName} - {inv.bankAccount}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#4682B4] font-mono">{formatCurrency(inv.capitalAmount)}</div>
                              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                {inv.ownershipPercent}% Porsi Kepemilikan
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* MAIN TAB 2: GENERAL SIMULATION SCENARIO TOOL (EXISTING SIMULATION) */}
      {/* ================================================================= */}
      {activeMainTab === 'simulation' && (
        <div className="space-y-8">
          {/* Schemes Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {schemes.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSchemeId(s.id)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-xl transition-all border",
                  activeSchemeId === s.id
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                )}
              >
                {s.name}
              </button>
            ))}
            <button 
              onClick={handleAddScheme}
              className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus size={16} />
              <span>Tambah Skenario Baru</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeScheme.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Kalkulator & Simulasi Alokasi Bagi Hasil Partner</p>
              </div>

              <button 
                onClick={() => handleDeleteScheme(activeScheme.id)}
                className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 size={16} />
                <span>Hapus Skenario</span>
              </button>
            </div>

            {/* Calculations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">BASIS PERHITUNGAN</span>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">{formatCurrency(baseIncome)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">CADANGAN KAS (RESERVE {activeScheme.companyReservePct}%)</span>
                <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(companyReserveAmount)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">TOTAL POTENSI DIBAGIKAN</span>
                <div className="text-lg font-black font-mono text-[#4682B4]">{formatCurrency(targetToShare)}</div>
              </div>
            </div>

            {/* Partners List */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Daftar Penerima Alokasi Bagi Hasil:</h4>
                <span className="text-xs font-mono text-slate-400">Total Alokasi: {totalAllocatedPct}% / 100%</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama Partner"
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs rounded-xl flex-1 text-slate-900 dark:text-slate-100"
                />
                <input
                  type="number"
                  placeholder="Alokasi (%)"
                  value={partnerPct || ''}
                  onChange={e => setPartnerPct(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs rounded-xl w-28 text-slate-900 dark:text-slate-100"
                />
                <button
                  onClick={handleAddPartner}
                  className="bg-[#4682B4] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2F6F9F] transition-all"
                >
                  Tambah Partner
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                {activeScheme.partners.map(p => {
                  const shareAmount = (targetToShare * p.percentage) / 100;
                  return (
                    <div key={p.id} className="p-3 bg-white dark:bg-slate-900 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{p.percentage}% dari Porsi Bagi Hasil</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(shareAmount)}</div>
                        <button onClick={() => handleDeletePartner(p.id)} className="text-slate-400 hover:text-rose-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: CREATE / EDIT SUKUK PROJECT */}
      {/* ================================================================= */}
      {isProjectFormOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
            <button onClick={() => setIsProjectFormOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5">
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Building size={20} className="text-[#4682B4]" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingProjectId ? 'Edit Master Projek Sukuk' : 'Tambah Projek Investasi Sukuk Baru'}
              </h3>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Projek / Lokasi Booth</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pemasangan Booth Photobooth - Kopi Kenangan"
                  value={projectFormData.projectName}
                  onChange={e => setProjectFormData({ ...projectFormData, projectName: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Dana Dibutuhkan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={projectFormData.totalRequiredCapital || ''}
                    onChange={e => setProjectFormData({ ...projectFormData, totalRequiredCapital: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Tenor Investasi (Bulan)</label>
                  <input
                    type="number"
                    required
                    value={projectFormData.tenorMonths || ''}
                    onChange={e => setProjectFormData({ ...projectFormData, tenorMonths: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Dynamic Rate Rules Configuration */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Skema Pembagian Keuntungan Dinamis (BEP Rule):</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-amber-600 block mb-1">Skema Pre-BEP (Sampai Balik Modal)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Investor:</span>
                      <input
                        type="number"
                        value={projectFormData.preBepInvestorShare}
                        onChange={e => setProjectFormData({ ...projectFormData, preBepInvestorShare: Number(e.target.value) })}
                        className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-mono text-center"
                      />
                      <span className="text-xs text-slate-500">% / Niskala {100 - projectFormData.preBepInvestorShare}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-purple-600 block mb-1">Skema Post-BEP (Setelah Balik Modal)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Investor:</span>
                      <input
                        type="number"
                        value={projectFormData.postBepInvestorShare}
                        onChange={e => setProjectFormData({ ...projectFormData, postBepInvestorShare: Number(e.target.value) })}
                        className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-mono text-center"
                      />
                      <span className="text-xs text-slate-500">% / Niskala {100 - projectFormData.postBepInvestorShare}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Investors Input Rows */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rincian Pemegang Modal Investor:</span>
                  <button
                    type="button"
                    onClick={handleAddInvestorRow}
                    className="text-[#4682B4] hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> Tambah Investor
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {projectFormData.investors.map((inv, idx) => (
                    <div key={inv.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-xs">
                      <div className="col-span-4">
                        <input
                          type="text"
                          required
                          placeholder={`Nama Investor ${idx + 1}`}
                          value={inv.name}
                          onChange={e => {
                            const val = e.target.value;
                            setProjectFormData(prev => ({
                              ...prev,
                              investors: prev.investors.map(i => i.id === inv.id ? { ...i, name: val } : i)
                            }));
                          }}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          required
                          placeholder="Nominal Investasi (Rp)"
                          value={inv.capitalAmount || ''}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setProjectFormData(prev => ({
                              ...prev,
                              investors: prev.investors.map(i => i.id === inv.id ? { ...i, capitalAmount: val } : i)
                            }));
                          }}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Bank & No Rek"
                          value={inv.bankAccount}
                          onChange={e => {
                            const val = e.target.value;
                            setProjectFormData(prev => ({
                              ...prev,
                              investors: prev.investors.map(i => i.id === inv.id ? { ...i, bankAccount: val } : i)
                            }));
                          }}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveInvestorRow(inv.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProjectFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm"
                >
                  Simpan Master Projek Sukuk
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================================================================= */}
      {/* MODAL 2: INPUT SETTLEMENT BAGI HASIL */}
      {/* ================================================================= */}
      {isSettlementFormOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
            <button onClick={() => setIsSettlementFormOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5">
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Banknote size={20} className="text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Input Settlement Bagi Hasil Investor Bulanan
              </h3>
            </div>

            <form onSubmit={handleSaveSukukSettlement} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pilih Projek Investasi Sukuk</label>
                <select
                  required
                  value={settlementFormData.projectId}
                  onChange={e => setSettlementFormData({ ...settlementFormData, projectId: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100"
                >
                  {sukukProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectName} (Tenor {p.tenorMonths} bln)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Periode Dari (Tanggal & Jam)</label>
                  <input
                    type="datetime-local"
                    required
                    value={settlementFormData.startDateTime}
                    onChange={e => setSettlementFormData({ ...settlementFormData, startDateTime: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Periode Sampai (Tanggal & Jam)</label>
                  <input
                    type="datetime-local"
                    required
                    value={settlementFormData.endDateTime}
                    onChange={e => setSettlementFormData({ ...settlementFormData, endDateTime: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Total Laba Bersih Projek Bulan Ini (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Misal: 10000000"
                  value={settlementFormData.monthlyNetProfit || ''}
                  onChange={e => setSettlementFormData({ ...settlementFormData, monthlyNetProfit: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Bagi hasil bulan pertama booth Kopi Kenangan"
                  value={settlementFormData.notes}
                  onChange={e => setSettlementFormData({ ...settlementFormData, notes: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Automatic Calculation Preview */}
              {settlementFormData.monthlyNetProfit > 0 && settlementFormData.projectId && (() => {
                const proj = sukukProjects.find(p => p.id === settlementFormData.projectId);
                if (!proj) return null;
                const cumPayouts = getProjectCumulativeInvestorPayouts(proj.id);
                const isBep = cumPayouts >= proj.totalRequiredCapital;
                const rate = isBep ? proj.postBepInvestorShare : proj.preBepInvestorShare;
                const investorPayout = settlementFormData.monthlyNetProfit * (rate / 100);
                const niskalaNet = settlementFormData.monthlyNetProfit - investorPayout;

                return (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
                    <div className="flex justify-between items-center font-bold text-emerald-800 dark:text-emerald-300">
                      <span>Simulasi Kalkulasi Otomatis:</span>
                      <span className="uppercase text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded">
                        {isBep ? `Fase Post-BEP (${rate}%)` : `Fase Pre-BEP (${rate}%)`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 font-mono">
                      <span>Hak Bagi Hasil Investor ({rate}%):</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(investorPayout)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 font-mono">
                      <span>Retensi Bersih Niskala ({100 - rate}%):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(niskalaNet)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSettlementFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm"
                >
                  Simpan & Distribusikan Bagi Hasil
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ===== MODAL 3: PRINTABLE REPORT DOCUMENT FOR SUKUK INVESTOR ===== */}
      {printSukukSettlement && (() => {
        const setIdx = sukukSettlements.findIndex(s => s.id === printSukukSettlement.settlement.id);
        const seq = setIdx >= 0 ? sukukSettlements.length - setIdx : 1;
        let subIdx: number | undefined = undefined;
        if (selectedPrintInvestorId !== 'all') {
          const invIdx = printSukukSettlement.settlement.investorPayoutBreakdown.findIndex(i => i.investorId === selectedPrintInvestorId);
          subIdx = invIdx >= 0 ? invIdx + 1 : 1;
        }
        const autoDocNum = generateDocNumber('LPI', seq, printSukukSettlement.settlement.startDateTime, subIdx);

        return createPortal(
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto animate-fade-in print-modal-overlay">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto print-modal-container">
              <button
                onClick={() => setPrintSukukSettlement(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 print:hidden"
              >
                <X size={20} />
              </button>

              {/* Print Header Actions & Investor Selector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-[#4682B4]" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Laporan Bagi Hasil Investor Sukuk Projek</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-slate-500">Pilih Tampilan Dokumen:</span>
                    <select
                      value={selectedPrintInvestorId}
                      onChange={e => setSelectedPrintInvestorId(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100"
                    >
                      <option value="all">Semua Investor (Ringkasan Konsolidasi)</option>
                      {printSukukSettlement.settlement.investorPayoutBreakdown.map(inv => (
                        <option key={inv.investorId} value={inv.investorId}>
                          Atas Nama: {inv.investorName} ({inv.ownershipPercent}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-stretch sm:self-auto justify-center"
                >
                  <Printer size={16} />
                  Cetak Dokumen (PDF)
                </button>
              </div>

              {/* Printable Document Sheet */}
              <div id="printable-report-sheet" className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 space-y-6">
                {/* Document Letterhead */}
                <div className="flex items-center justify-between border-b-2 border-slate-800 dark:border-slate-200 pb-4">
                  <div className="flex items-center gap-3.5">
                    <img src="/logo.png" alt="Niskala Logo" className="h-12 w-auto object-contain shrink-0" />
                    <div>
                      <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                        PT. NISKALA TECH ID
                      </h1>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Divisi Kemitraan & Investor Relations • Sukuk Investment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">NOMOR SURAT RESMI</div>
                    <div className="text-sm font-mono font-bold text-[#4682B4]">
                      {autoDocNum}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center py-2">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                    {selectedPrintInvestorId === 'all'
                      ? 'LAPORAN KONSOLIDASI HASIL INVESTASI SUKUK PROJEK'
                      : `LAPORAN BAGI HASIL INVESTOR ATAS NAMA ${printSukukSettlement.settlement.investorPayoutBreakdown.find(i => i.investorId === selectedPrintInvestorId)?.investorName.toUpperCase()}`}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-1 flex items-center justify-center gap-1">
                    <Clock size={12} /> Periode Transaksi: {formatDateTimeRange(printSukukSettlement.settlement.startDateTime, printSukukSettlement.settlement.endDateTime)}
                  </p>
                </div>

                {/* Project Overview */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Nama Projek Investasi:</span>
                    <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{printSukukSettlement.project.projectName}</div>
                    <div className="text-slate-500 font-mono mt-1">Tenor: {printSukukSettlement.project.tenorMonths} Bulan</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Total Modal Projek:</span>
                    <div className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm mt-0.5">{formatCurrency(printSukukSettlement.project.totalRequiredCapital)}</div>
                    <div className="text-slate-500 font-mono mt-1">
                      Status Skema: {printSukukSettlement.settlement.isBepReached ? 'Post-BEP (20/80)' : 'Pre-BEP (80/20)'}
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown View */}
                {selectedPrintInvestorId === 'all' ? (
                  <>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-y border-slate-300 dark:border-slate-700">
                          <th className="py-3 px-4">Deskripsi Laba Operasional Projek</th>
                          <th className="py-3 px-4 text-center">Fase Rate</th>
                          <th className="py-3 px-4 text-right">Alokasi Investor</th>
                          <th className="py-3 px-4 text-right">Retensi Niskala</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 font-sans">
                            Laba Bersih Projek ({formatDateTimeRange(printSukukSettlement.settlement.startDateTime, printSukukSettlement.settlement.endDateTime)})
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-slate-100 font-sans">
                            {printSukukSettlement.settlement.appliedInvestorSharePercent}% : {printSukukSettlement.settlement.appliedNiskalaSharePercent}%
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(printSukukSettlement.settlement.totalInvestorPayout)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(printSukukSettlement.settlement.totalNiskalaNet)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Rincian Pembagian Bagi Hasil Per Investor (Proporsional Pro-Rata):
                      </div>
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-y border-slate-300 dark:border-slate-700">
                            <th className="py-2.5 px-4">Nama Pemegang Modal Investor</th>
                            <th className="py-2.5 px-4 text-center">Porsi Modal (%)</th>
                            <th className="py-2.5 px-4 text-right">Nominal Hak Bagi Hasil (Rp)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono">
                          {printSukukSettlement.settlement.investorPayoutBreakdown.map((inv, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100 font-sans">{inv.investorName}</td>
                              <td className="py-2.5 px-4 text-center font-bold">{inv.ownershipPercent}%</td>
                              <td className="py-2.5 px-4 text-right font-bold text-amber-600 dark:text-amber-400">{formatCurrency(inv.payoutAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (() => {
                  const targetInv = printSukukSettlement.settlement.investorPayoutBreakdown.find(i => i.investorId === selectedPrintInvestorId);
                  const projInv = printSukukSettlement.project.investors.find(i => i.id === selectedPrintInvestorId);
                  if (!targetInv) return null;

                  return (
                    <div className="space-y-4">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-y border-slate-300 dark:border-slate-700">
                            <th className="py-3 px-4">Keterangan Rincian bagi Hasil</th>
                            <th className="py-3 px-4 text-center">Proporsi Modal (%)</th>
                            <th className="py-3 px-4 text-right">Jumlah Hak Bagi Hasil (Rp)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono">
                          <tr>
                            <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">
                              Total Laba Bersih Projek Periode Operasional
                            </td>
                            <td className="py-3 px-4 text-center font-sans">100% Projek</td>
                            <td className="py-3 px-4 text-right font-bold">{formatCurrency(printSukukSettlement.settlement.monthlyNetProfit)}</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">
                              Alokasi Bagi Hasil Seluruh Investor (Fase Rate {printSukukSettlement.settlement.appliedInvestorSharePercent}%)
                            </td>
                            <td className="py-3 px-4 text-center font-sans">{printSukukSettlement.settlement.appliedInvestorSharePercent}% Rate</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">{formatCurrency(printSukukSettlement.settlement.totalInvestorPayout)}</td>
                          </tr>
                          <tr className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-sm">
                            <td className="py-4 px-4 font-sans uppercase">
                              Nett Bagi Hasil Hak {targetInv.investorName}
                            </td>
                            <td className="py-4 px-4 text-center font-sans">{targetInv.ownershipPercent}% Porsi</td>
                            <td className="py-4 px-4 text-right text-amber-600 dark:text-amber-400 font-extrabold text-base">
                              {formatCurrency(targetInv.payoutAmount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {projInv && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                          <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">REKAPITULASI DANA REKENING TUJUAN TRANSFER:</div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{targetInv.investorName}</div>
                          <div className="font-mono text-slate-600 dark:text-slate-300">Transfer Bank: {projInv.bankName} • Account: {projInv.bankAccount}</div>
                          <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Status Pencairan: Lunas & Terverifikasi</div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* CEO Signature Block Only */}
                <div className="pt-10 flex justify-end text-center text-xs">
                  <div className="w-64 space-y-1">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Penerbit & Pengelola Projek,</p>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide">PT. NISKALA TECH ID</p>
                    <div className="h-16 flex items-center justify-center">
                      {/* Clean Official Signature Space */}
                    </div>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 underline text-sm font-sans">Faris Dwi Ramadhan</p>
                    <p className="text-slate-500 font-semibold text-[11px]">Chief Executive Officer (CEO)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmProjectId && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Hapus Projek Investasi Sukuk?</h3>
              <p className="text-xs text-slate-400 mt-1">Seluruh data master dan riwayat settlement projek ini akan dihapus.</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setDeleteConfirmProjectId(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Batal
              </button>
              <button onClick={() => handleDeleteProject(deleteConfirmProjectId)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl text-xs">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfitShareView;
