import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Store, Plus, TrendingUp, Percent, MapPin, Edit2, Trash2, 
  Printer, AlertCircle, FileText, X, Calendar, Clock, Settings
} from 'lucide-react';
import type { VenuePartner } from '../Types';
import { cn, StatCard } from './Common';
import { api } from '../api';
import { generateDocNumber } from '../utils/docNumbering';

interface VenuePartnersViewProps {
  formatCurrency: (amount: number) => string;
}

export type SettlementRecord = {
  id: string;
  venueId: string;
  venueName: string;
  startDateTime: string;
  endDateTime: string;
  totalTransactions: number;
  pricePerTrx: number;
  grossRevenue: number;
  schemeType: 'dynamic' | 'static';
  effectiveSharePercent: number;
  partnerPayout: number;
  snapcalaNet: number;
  notes?: string;
  status: 'settled' | 'pending';
  createdAt: string;
};

const INITIAL_VENUES: VenuePartner[] = [
  {
    id: 'v1',
    name: 'Kopi Kenangan Junction',
    location: 'Bandung Town Square',
    type: 'static',
    contactPerson: 'Budi Santoso',
    phone: '0812-3456-7890',
    bankName: 'BCA',
    bankAccount: '1234567890 a.n Budi Santoso',
    schemeType: 'dynamic',
    baseSharePercent: 15,
    bonusSharePercent: 20,
    tierThreshold: 50,
    status: 'active',
    businessLine: 'snapcala'
  },
  {
    id: 'v2',
    name: 'Cinema XXI Plaza',
    location: 'Mall Grand Indonesia, Jakarta',
    type: 'static',
    contactPerson: 'Siti Rahmawati',
    phone: '0819-8765-4321',
    bankName: 'Mandiri',
    bankAccount: '9876543210 a.n Siti Rahmawati',
    schemeType: 'dynamic',
    baseSharePercent: 15,
    bonusSharePercent: 20,
    tierThreshold: 50,
    status: 'active',
    businessLine: 'snapcala'
  },
  {
    id: 'v3',
    name: 'Wedding Event - Hotel Mulia',
    location: 'Senayan, Jakarta',
    type: 'dynamic_event',
    contactPerson: 'EO Platinum Wedding',
    phone: '0857-1122-3344',
    bankName: 'BCA',
    bankAccount: '5544332211 a.n Platinum EO',
    schemeType: 'static',
    staticSharePercent: 0,
    status: 'active',
    businessLine: 'snapcala'
  }
];

const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'set-1',
    venueId: 'v1',
    venueName: 'Kopi Kenangan Junction',
    startDateTime: '2026-08-01T08:00',
    endDateTime: '2026-08-31T23:59',
    totalTransactions: 65,
    pricePerTrx: 35000,
    grossRevenue: 22750000,
    schemeType: 'dynamic',
    effectiveSharePercent: 20,
    partnerPayout: 4550000,
    snapcalaNet: 18200000,
    status: 'settled',
    createdAt: '2026-08-31'
  },
  {
    id: 'set-2',
    venueId: 'v2',
    venueName: 'Cinema XXI Plaza',
    startDateTime: '2026-08-01T10:00',
    endDateTime: '2026-08-31T22:00',
    totalTransactions: 42,
    pricePerTrx: 40000,
    grossRevenue: 16800000,
    schemeType: 'dynamic',
    effectiveSharePercent: 15,
    partnerPayout: 2520000,
    snapcalaNet: 14280000,
    status: 'settled',
    createdAt: '2026-08-31'
  }
];

export const getEffectiveShareRate = (venue: VenuePartner, trxCountOverride?: number) => {
  if (venue.schemeType === 'static') {
    return venue.staticSharePercent ?? venue.customSharePercent ?? 15;
  }

  const trx = trxCountOverride !== undefined ? trxCountOverride : 0;
  const threshold = venue.tierThreshold ?? 50;
  const baseRate = venue.baseSharePercent ?? 15;
  const bonusRate = venue.bonusSharePercent ?? 20;

  return trx >= threshold ? bonusRate : baseRate;
};

export const formatDateTimeRange = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return '-';
  const start = new Date(startStr);
  const end = new Date(endStr);

  const formatDate = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return `${formatDate(start)} ${formatTime(start)} s/d ${formatDate(end)} ${formatTime(end)}`;
};

const LOCAL_STORAGE_VENUES_KEY = 'niskala_snapcala_venues_v1';
const LOCAL_STORAGE_SETTLEMENTS_KEY = 'niskala_snapcala_settlements_v1';

const VenuePartnersView: React.FC<VenuePartnersViewProps> = ({ formatCurrency }) => {
  // Initialize from LocalStorage or Fallback
  const [venues, setVenues] = useState<VenuePartner[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VENUES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_VENUES;
    } catch {
      return INITIAL_VENUES;
    }
  });

  const [settlements, setSettlements] = useState<SettlementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTLEMENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
    } catch {
      return INITIAL_SETTLEMENTS;
    }
  });

  // Backend Integration API Fetching
  useEffect(() => {
    async function syncBackendData() {
      try {
        const [vData, sData] = await Promise.all([
          api.getVenuePartners(),
          api.getVenueSettlements()
        ]);
        if (vData && Array.isArray(vData) && vData.length > 0) {
          setVenues(vData);
          localStorage.setItem(LOCAL_STORAGE_VENUES_KEY, JSON.stringify(vData));
        }
        if (sData && Array.isArray(sData) && sData.length > 0) {
          const mappedSettlements: SettlementRecord[] = sData.map((s: any) => ({
            id: s.id,
            venueId: s.venueId,
            venueName: s.venueName,
            startDateTime: s.startDateTime || `${s.periodMonth || '2026-08'}-01T08:00`,
            endDateTime: s.endDateTime || `${s.periodMonth || '2026-08'}-31T23:59`,
            totalTransactions: Number(s.totalTransactions) || 0,
            pricePerTrx: Number(s.pricePerTrx) || 35000,
            grossRevenue: Number(s.grossRevenue) || 0,
            schemeType: s.schemeType || 'dynamic',
            effectiveSharePercent: Number(s.effectiveSharePercent) || 15,
            partnerPayout: Number(s.partnerPayout) || 0,
            snapcalaNet: Number(s.snapcalaNet) || 0,
            notes: s.notes || '',
            status: s.status || 'settled',
            createdAt: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '2026-08-31'
          }));
          setSettlements(mappedSettlements);
          localStorage.setItem(LOCAL_STORAGE_SETTLEMENTS_KEY, JSON.stringify(mappedSettlements));
        }
      } catch (err) {
        console.warn('Backend sync failed, using cached state:', err);
      }
    }
    syncBackendData();
  }, []);

  // Save to LocalStorage whenever venues change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_VENUES_KEY, JSON.stringify(venues));
    } catch (err) {
      console.error('Failed to write venues to localStorage', err);
    }
  }, [venues]);

  // Save to LocalStorage whenever settlements change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTLEMENTS_KEY, JSON.stringify(settlements));
    } catch (err) {
      console.error('Failed to write settlements to localStorage', err);
    }
  }, [settlements]);
  
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'settlement' | 'venues'>('settlement');
  
  // Modal states
  const [isVenueFormOpen, setIsVenueFormOpen] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [isSettlementFormOpen, setIsSettlementFormOpen] = useState(false);
  const [printSettlement, setPrintSettlement] = useState<{ venue: VenuePartner; settlement: SettlementRecord } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State: Master Venue
  const [venueFormData, setVenueFormData] = useState<Partial<VenuePartner>>({
    name: '',
    location: '',
    type: 'static',
    contactPerson: '',
    phone: '',
    bankName: 'BCA',
    bankAccount: '',
    schemeType: 'dynamic',
    staticSharePercent: 20,
    baseSharePercent: 15,
    bonusSharePercent: 20,
    tierThreshold: 50,
  });

  // Form State: Monthly Settlement Input
  const [settlementFormData, setSettlementFormData] = useState({
    venueId: '',
    startDateTime: '2026-09-01T08:00',
    endDateTime: '2026-09-30T23:59',
    totalTransactions: 0,
    pricePerTrx: 35000,
    notes: '',
  });

  // Open Create Venue Form (Master Data Only)
  const handleOpenCreateVenue = () => {
    setEditingVenueId(null);
    setVenueFormData({
      name: '',
      location: '',
      type: 'static',
      contactPerson: '',
      phone: '',
      bankName: 'BCA',
      bankAccount: '',
      schemeType: 'dynamic',
      staticSharePercent: 20,
      baseSharePercent: 15,
      bonusSharePercent: 20,
      tierThreshold: 50,
    });
    setIsVenueFormOpen(true);
  };

  // Open Edit Venue Form (Master Data Only)
  const handleOpenEditVenue = (venue: VenuePartner) => {
    setEditingVenueId(venue.id);
    const staticRate = venue.staticSharePercent ?? venue.customSharePercent ?? 20;
    setVenueFormData({
      ...venue,
      schemeType: venue.schemeType || (venue.customSharePercent !== null && venue.customSharePercent !== undefined ? 'static' : 'dynamic'),
      staticSharePercent: staticRate,
    });
    setIsVenueFormOpen(true);
  };

  const handleDeleteVenue = async (id: string) => {
    try {
      await api.deleteVenuePartner(id);
    } catch (err) {
      console.warn('Backend delete venue error, updating local state:', err);
    }
    setVenues(prev => prev.filter(v => v.id !== id));
    setDeleteConfirmId(null);
  };

  // Save Master Venue (Backend Sync + Local Persistence)
  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueFormData.name || !venueFormData.location) return;

    const schemeType = venueFormData.schemeType || 'dynamic';
    const normalizedVenueData: Partial<VenuePartner> = {
      ...venueFormData,
      schemeType,
      staticSharePercent: schemeType === 'static' ? Number(venueFormData.staticSharePercent ?? 0) : undefined,
      customSharePercent: schemeType === 'static' ? Number(venueFormData.staticSharePercent ?? 0) : null,
      baseSharePercent: Number(venueFormData.baseSharePercent ?? 15),
      bonusSharePercent: Number(venueFormData.bonusSharePercent ?? 20),
      tierThreshold: Number(venueFormData.tierThreshold ?? 50),
    };

    if (editingVenueId) {
      try {
        const updated = await api.updateVenuePartner(editingVenueId, normalizedVenueData);
        setVenues(prev => prev.map(v => v.id === editingVenueId ? { ...v, ...updated } : v));
      } catch {
        setVenues(prev => prev.map(v => v.id === editingVenueId ? {
          ...v,
          ...normalizedVenueData,
        } as VenuePartner : v));
      }
    } else {
      const payload = {
        name: venueFormData.name || '',
        location: venueFormData.location || '',
        type: venueFormData.type || 'static',
        contactPerson: venueFormData.contactPerson || 'PIC',
        phone: venueFormData.phone || '-',
        bankName: venueFormData.bankName || 'BCA',
        bankAccount: venueFormData.bankAccount || '-',
        schemeType,
        staticSharePercent: schemeType === 'static' ? Number(venueFormData.staticSharePercent ?? 0) : undefined,
        customSharePercent: schemeType === 'static' ? Number(venueFormData.staticSharePercent ?? 0) : null,
        baseSharePercent: Number(venueFormData.baseSharePercent ?? 15),
        bonusSharePercent: Number(venueFormData.bonusSharePercent ?? 20),
        tierThreshold: Number(venueFormData.tierThreshold ?? 50),
        status: 'active',
        businessLine: 'snapcala',
      };
      try {
        const created = await api.createVenuePartner(payload as any);
        setVenues(prev => [created, ...prev]);
      } catch {
        const newVenue: VenuePartner = {
          id: `v-${Date.now()}`,
          ...payload,
        } as VenuePartner;
        setVenues(prev => [newVenue, ...prev]);
      }
    }

    setIsVenueFormOpen(false);
    setEditingVenueId(null);
  };

  // Save Monthly Settlement Input (Backend Sync + Local Persistence)
  const handleSaveSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedVenue = venues.find(v => v.id === settlementFormData.venueId);
    if (!selectedVenue) return;

    const trxCount = Number(settlementFormData.totalTransactions) || 0;
    const price = Number(settlementFormData.pricePerTrx) || 35000;
    const gross = trxCount * price;
    const effectiveRate = getEffectiveShareRate(selectedVenue, trxCount);
    const partnerPayout = gross * (effectiveRate / 100);
    const snapcalaNet = gross - partnerPayout;

    const settlementPayload = {
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      startDateTime: settlementFormData.startDateTime,
      endDateTime: settlementFormData.endDateTime,
      periodMonth: settlementFormData.startDateTime.substring(0, 7),
      totalTransactions: trxCount,
      pricePerTrx: price,
      grossRevenue: gross,
      schemeType: selectedVenue.schemeType || 'dynamic',
      effectiveSharePercent: effectiveRate,
      partnerPayout,
      snapcalaNet,
      notes: settlementFormData.notes,
      status: 'settled',
    };

    try {
      const created = await api.createVenueSettlement(settlementPayload);
      setSettlements(prev => [{
        ...settlementPayload,
        id: created.id || `set-${Date.now()}`,
        createdAt: created.createdAt ? new Date(created.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      } as SettlementRecord, ...prev]);
    } catch {
      setSettlements(prev => [{
        ...settlementPayload,
        id: `set-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      } as SettlementRecord, ...prev]);
    }

    setIsSettlementFormOpen(false);
    setSettlementFormData({
      venueId: '',
      startDateTime: '2026-09-01T08:00',
      endDateTime: '2026-09-30T23:59',
      totalTransactions: 0,
      pricePerTrx: 35000,
      notes: '',
    });
  };

  // Global Metrics
  const totalGrossRevenue = settlements.reduce((acc, s) => acc + s.grossRevenue, 0);
  const totalSnapcalaNetRevenue = settlements.reduce((acc, s) => acc + s.snapcalaNet, 0);
  const totalPartnerPayoutAmount = settlements.reduce((acc, s) => acc + s.partnerPayout, 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard 
          label="Total Omzet Booth" 
          value={formatCurrency(totalGrossRevenue)} 
          sub={`${settlements.reduce((acc, s) => acc + s.totalTransactions, 0)} Transaksi Terdata`} 
          icon={<Store size={20} />} 
          variant="primary" 
        />
        <StatCard 
          label="Net Retensi Snapcala" 
          value={formatCurrency(totalSnapcalaNetRevenue)} 
          sub="Pendapatan Bersih Snapcala" 
          icon={<TrendingUp size={20} />} 
          variant="emerald" 
        />
        <StatCard 
          label="Bagi Hasil Partner" 
          value={formatCurrency(totalPartnerPayoutAmount)} 
          sub="Hak Payout Settlement Partner" 
          icon={<Percent size={20} />} 
          variant="amber" 
        />
        <StatCard 
          label="Konfigurasi Skema" 
          value="Dinamis & Statis" 
          sub="Tier & Flat Rate Manual %" 
          icon={<Settings size={20} />} 
          variant="indigo" 
        />
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('settlement')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
              activeTab === 'settlement' 
                ? "bg-[#4682B4] text-white border-[#2F6F9F] shadow-xs" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            )}
          >
            <Calendar size={15} />
            Rekap & Input Settlement Periode
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
              activeTab === 'venues' 
                ? "bg-[#4682B4] text-white border-[#2F6F9F] shadow-xs" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            )}
          >
            <Store size={15} />
            Master Data Venue Partner ({venues.length})
          </button>
        </div>

        {activeTab === 'settlement' ? (
          <button
            onClick={() => setIsSettlementFormOpen(true)}
            className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus size={16} />
            Input Settlement Transaksi Periode
          </button>
        ) : (
          <button
            onClick={handleOpenCreateVenue}
            className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus size={16} />
            Tambah Venue Partner Baru
          </button>
        )}
      </div>

      {/* ===== TAB 1: REKAP SETTLEMENT BULANAN / PERIODE ===== */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          {/* Monthly Settlement Input Form */}
          {isSettlementFormOpen && (
            <form onSubmit={handleSaveSettlement} className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-5 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Input Settlement Transaksi Berdasarkan Rentang Waktu</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tentukan dari tanggal & jam berapa hingga tanggal & jam berapa transaksi terjadi</p>
                </div>
                <button type="button" onClick={() => setIsSettlementFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pilih Venue Partner</label>
                  <select
                    required
                    value={settlementFormData.venueId}
                    onChange={e => setSettlementFormData({ ...settlementFormData, venueId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4682B4]/20"
                  >
                    <option value="">-- Pilih Venue Partner --</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.type === 'static' ? 'Statis' : 'Event'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Dari Tanggal & Jam (Start DateTime)</label>
                  <input
                    type="datetime-local"
                    required
                    value={settlementFormData.startDateTime}
                    onChange={e => setSettlementFormData({ ...settlementFormData, startDateTime: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hingga Tanggal & Jam (End DateTime)</label>
                  <input
                    type="datetime-local"
                    required
                    value={settlementFormData.endDateTime}
                    onChange={e => setSettlementFormData({ ...settlementFormData, endDateTime: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Jumlah Transaksi Foto</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={settlementFormData.totalTransactions}
                    onChange={e => setSettlementFormData({ ...settlementFormData, totalTransactions: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Harga Per Transaksi (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={settlementFormData.pricePerTrx}
                    onChange={e => setSettlementFormData({ ...settlementFormData, pricePerTrx: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Misal: Event Weekend / Shift Malam"
                    value={settlementFormData.notes}
                    onChange={e => setSettlementFormData({ ...settlementFormData, notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Dynamic Calculation Live Preview */}
              {settlementFormData.venueId && (() => {
                const venue = venues.find(v => v.id === settlementFormData.venueId);
                if (!venue) return null;
                const trxCount = Number(settlementFormData.totalTransactions) || 0;
                const price = Number(settlementFormData.pricePerTrx) || 35000;
                const gross = trxCount * price;
                const effectiveRate = getEffectiveShareRate(venue, trxCount);
                const partnerPayout = gross * (effectiveRate / 100);
                const snapcalaNet = gross - partnerPayout;

                return (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Skema Terdaftar Partner:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                        Skema {venue.schemeType === 'static' ? 'Statis (Flat)' : 'Dinamis (Tier)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Persentase Sharing Rate Berlaku:</span>
                      <span className="font-bold text-[#4682B4] text-sm">
                        {effectiveRate}% {venue.schemeType === 'dynamic' && `(${trxCount >= (venue.tierThreshold || 50) ? 'Bonus Tier 2' : 'Base Tier 1'})`}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center font-mono">
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                        <span className="text-[10px] text-slate-400 block font-sans">Total Omzet Kotor</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(gross)}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                        <span className="text-[10px] text-amber-500 block font-sans">Bagi Hasil Partner ({effectiveRate}%)</span>
                        <span className="font-bold text-amber-600">{formatCurrency(partnerPayout)}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                        <span className="text-[10px] text-emerald-500 block font-sans">Net Retensi Snapcala ({100 - effectiveRate}%)</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(snapcalaNet)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettlementFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold px-6 py-2 rounded-xl text-xs transition-all shadow-sm"
                >
                  Simpan Settlement Transaksi
                </button>
              </div>
            </form>
          )}

          {/* Table List of Settlements */}
          <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Riwayat Settlement Transaksi Berdasarkan Rentang Waktu</h3>
                <p className="text-xs text-slate-400 mt-0.5">Mencatat jam & tanggal transaksi secara tepat untuk pelaporan transparan</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                {settlements.length} Record Terdata
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3.5 px-6">Venue Partner</th>
                    <th className="py-3.5 px-6">Rentang Waktu Periode Transaksi</th>
                    <th className="py-3.5 px-6 text-center">Volume Transaksi</th>
                    <th className="py-3.5 px-6">Skema & Rate %</th>
                    <th className="py-3.5 px-6 text-right">Omzet Kotor</th>
                    <th className="py-3.5 px-6 text-right">Bagi Hasil Partner</th>
                    <th className="py-3.5 px-6 text-right">Net Snapcala</th>
                    <th className="py-3.5 px-6 text-center">Cetak Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {settlements.map(set => {
                    const venueObj = venues.find(v => v.id === set.venueId) || {
                      id: set.venueId,
                      name: set.venueName,
                      location: 'Lokasi Partner',
                      type: 'static',
                      contactPerson: 'PIC',
                      phone: '-',
                      status: 'active'
                    } as VenuePartner;

                    return (
                      <tr key={set.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">
                          {set.venueName}
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock size={13} className="text-[#4682B4]" />
                            <span>{formatDateTimeRange(set.startDateTime, set.endDateTime)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-bold">
                          {set.totalTransactions} Transaksi
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border",
                            set.schemeType === 'dynamic' 
                              ? "bg-sky-50 text-[#4682B4] border-sky-200 dark:bg-sky-950/40 dark:text-sky-300" 
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          )}>
                            {set.effectiveSharePercent}% ({set.schemeType === 'dynamic' ? 'Dinamis' : 'Statis Manual'})
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(set.grossRevenue)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(set.partnerPayout)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(set.snapcalaNet)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setPrintSettlement({ venue: venueObj, settlement: set })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4682B4]/10 hover:bg-[#4682B4] text-[#4682B4] hover:text-white rounded-xl text-xs font-semibold transition-all"
                          >
                            <Printer size={14} />
                            Cetak Laporan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 2: MASTER DATA VENUE PARTNER & KONFIGURASI SKEMA ===== */}
      {activeTab === 'venues' && (
        <div className="space-y-6">
          {/* Master Venue Form */}
          {isVenueFormOpen && (
            <form onSubmit={handleSaveVenue} className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingVenueId ? 'Edit Profil & Skema Venue Partner' : 'Registrasi Venue Partner Baru'}
                </h3>
                <span className="text-xs font-medium text-slate-400">Master Setup & Konfigurasi Sharing</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Tempat / Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi Kenangan / XXI Plaza"
                    value={venueFormData.name || ''}
                    onChange={e => setVenueFormData({ ...venueFormData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4682B4]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Lokasi / Kota</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bandung Town Square"
                    value={venueFormData.location || ''}
                    onChange={e => setVenueFormData({ ...venueFormData, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4682B4]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Jenis Tempat</label>
                  <select
                    value={venueFormData.type || 'static'}
                    onChange={e => setVenueFormData({ ...venueFormData, type: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4682B4]/20"
                  >
                    <option value="static">Venue Statis (Cafe/Mall/Cinema)</option>
                    <option value="dynamic_event">Booth Event (Event/EO/Sewa Khusus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kontak Person (PIC Partner)</label>
                  <input
                    type="text"
                    placeholder="Nama PIC Partner"
                    value={venueFormData.contactPerson || ''}
                    onChange={e => setVenueFormData({ ...venueFormData, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4682B4]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={venueFormData.phone || ''}
                    onChange={e => setVenueFormData({ ...venueFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4682B4]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rekening Pembayaran Bagi Hasil</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Bank (BCA)"
                      value={venueFormData.bankName || ''}
                      onChange={e => setVenueFormData({ ...venueFormData, bankName: e.target.value })}
                      className="w-1/3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="No Rek & Nama"
                      value={venueFormData.bankAccount || ''}
                      onChange={e => setVenueFormData({ ...venueFormData, bankAccount: e.target.value })}
                      className="w-2/3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* SIFAT & SKEMA SHARING PROFIT (DINAMIS vs STATIS) */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Pilihan Skema Sharing Profit</h4>
                    <p className="text-[11px] text-slate-400">Atur apakah persentase sifatnya dinamis (Tier Transaksi) atau statis (Fixed Flat Rate)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="schemeType"
                        value="dynamic"
                        checked={venueFormData.schemeType === 'dynamic'}
                        onChange={() => setVenueFormData({ ...venueFormData, schemeType: 'dynamic' })}
                        className="text-[#4682B4]"
                      />
                      Dinamis (Tier Transaksi)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="schemeType"
                        value="static"
                        checked={venueFormData.schemeType === 'static'}
                        onChange={() => setVenueFormData({ ...venueFormData, schemeType: 'static' })}
                        className="text-[#4682B4]"
                      />
                      Statis (Flat Rate Manual %)
                    </label>
                  </div>
                </div>

                {venueFormData.schemeType === 'dynamic' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Share Rate (&lt; Threshold %)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={venueFormData.baseSharePercent ?? 15}
                        onChange={e => setVenueFormData({ ...venueFormData, baseSharePercent: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bonus Share Rate (≥ Threshold %)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={venueFormData.bonusSharePercent ?? 20}
                        onChange={e => setVenueFormData({ ...venueFormData, bonusSharePercent: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Threshold Volume Transaksi</label>
                      <input
                        type="number"
                        min="1"
                        value={venueFormData.tierThreshold ?? 50}
                        onChange={e => setVenueFormData({ ...venueFormData, tierThreshold: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Input Persentase Bagi Hasil Statis (%)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={venueFormData.staticSharePercent ?? 20}
                        onChange={e => setVenueFormData({ ...venueFormData, staticSharePercent: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-sm font-bold">% Payout Partner</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVenueFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold px-6 py-2 rounded-xl text-xs transition-all shadow-sm"
                >
                  {editingVenueId ? 'Simpan Perubahan Master' : 'Simpan Venue Partner'}
                </button>
              </div>
            </form>
          )}

          {/* Master Venue Table */}
          <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Daftar Master Data Venue Partner</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pengelolaan profil, kontak, rekening, dan konfigurasi skema persentase bagi hasil</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3.5 px-6">Nama Venue / Tempat</th>
                    <th className="py-3.5 px-6">Lokasi</th>
                    <th className="py-3.5 px-6">Skema Sharing</th>
                    <th className="py-3.5 px-6">Kontak PIC</th>
                    <th className="py-3.5 px-6">Informasi Rekening</th>
                    <th className="py-3.5 px-6 text-center">Aksi Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {venues.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {v.name}
                      </td>
                      <td className="py-4 px-6 text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {v.location}
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border",
                          v.schemeType === 'dynamic' 
                            ? "bg-sky-50 text-[#4682B4] border-sky-200 dark:bg-sky-950/40 dark:text-sky-300" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                        )}>
                          {v.schemeType === 'dynamic' 
                            ? `Dinamis (${v.baseSharePercent}% / ${v.bonusSharePercent}%)` 
                            : `Statis (${v.staticSharePercent ?? v.customSharePercent ?? 0}%)`}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <div className="text-slate-800 dark:text-slate-200">{v.contactPerson}</div>
                        <div className="text-[11px] text-slate-400">{v.phone}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-400">
                        {v.bankName} - {v.bankAccount}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditVenue(v)}
                            className="p-1.5 text-slate-600 hover:text-[#4682B4] dark:text-slate-400 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Master Partner"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(v.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Hapus Master Partner"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteConfirmId && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Hapus Venue Partner?</h3>
              <p className="text-xs text-slate-400 mt-1">Data partner akan dihapus dari master data.</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Batal
              </button>
              <button onClick={() => handleDeleteVenue(deleteConfirmId)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl text-xs">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===== PRINTABLE REPORT TEMPLATE MODAL ===== */}
      {printSettlement && (() => {
        const settlementIdx = settlements.findIndex(s => s.id === printSettlement.settlement.id);
        const seq = settlementIdx >= 0 ? settlements.length - settlementIdx : 1;
        const autoDocNum = generateDocNumber('LPS', seq, printSettlement.settlement.startDateTime);

        return createPortal(
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto animate-fade-in print-modal-overlay">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto print-modal-container">
              <button
                onClick={() => setPrintSettlement(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 print:hidden"
              >
                <X size={20} />
              </button>

              {/* Print Header Actions */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-[#4682B4]" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Laporan Settlement Sharing Profit Rentang Waktu</h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <Printer size={16} />
                  Cetak Dokumen (PDF)
                </button>
              </div>

              {/* Printable Document Sheet (Only this renders in print) */}
              <div id="printable-report-sheet" className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 space-y-6">
                {/* Document Letterhead */}
                <div className="flex items-center justify-between border-b-2 border-slate-800 dark:border-slate-200 pb-4">
                  <div className="flex items-center gap-3.5">
                    <img src="/logo.png" alt="Niskala Logo" className="h-12 w-auto object-contain shrink-0" />
                    <div>
                      <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        SNAPCALA PHOTOBOOTH
                      </h1>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Divisi Operasional & Venue Partnership • PT. NISKALA TECH ID</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">NOMOR SURAT RESMI</div>
                    <div className="text-sm font-mono font-bold text-[#4682B4]">{autoDocNum}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center py-2">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">LAPORAN PEMBAGIAN KEUNTUNGAN (SHARING PROFIT)</h2>
                  <p className="text-xs text-slate-500 font-mono mt-1 flex items-center justify-center gap-1">
                    <Clock size={12} /> Rentang Waktu: {formatDateTimeRange(printSettlement.settlement.startDateTime, printSettlement.settlement.endDateTime)}
                  </p>
                </div>

                {/* Partner Info Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Pihak Pertama (Pengelola):</span>
                    <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">PT. NISKALA TECH ID (Snapcala Photobooth)</div>
                    <div className="text-slate-500">PIC Operasional Snapcala</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Pihak Kedua (Mitra Venue Owner):</span>
                    <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{printSettlement.venue.name}</div>
                    <div className="text-slate-500">{printSettlement.venue.contactPerson || 'Mitra Venue Owner'}</div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ringkasan Performa & Skema Sharing Profit</h4>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Total Transaksi</div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5">{printSettlement.settlement.totalTransactions} Transaksi</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Pendapatan Kotor</div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5">{formatCurrency(printSettlement.settlement.grossRevenue)}</div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <div className="text-amber-600 dark:text-amber-400 text-[10px] uppercase font-semibold">Persentase Bagi Hasil</div>
                      <div className="text-sm font-extrabold text-amber-700 dark:text-amber-300 font-mono mt-0.5">
                        {printSettlement.settlement.effectiveSharePercent}% ({printSettlement.settlement.schemeType === 'dynamic' ? 'Dinamis Tier' : 'Statis'})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown Box */}
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center font-semibold text-slate-600 dark:text-slate-400">
                    <span>Pendapatan Kotor Keseluruhan:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100">{formatCurrency(printSettlement.settlement.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-amber-700 dark:text-amber-300 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <span>Hak Pembagian Keuntungan Partner ({printSettlement.settlement.effectiveSharePercent}%):</span>
                    <span className="font-mono text-sm">{formatCurrency(printSettlement.settlement.partnerPayout)}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-emerald-700 dark:text-emerald-300">
                    <span>Pendapatan Bersih Snapcala Photobooth ({100 - printSettlement.settlement.effectiveSharePercent}%):</span>
                    <span className="font-mono">{formatCurrency(printSettlement.settlement.snapcalaNet)}</span>
                  </div>
                </div>

                {/* Notes & Bank Details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 text-xs">
                  <div className="text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Catatan Settlement:</span> {printSettlement.settlement.notes || '-'}
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div className="font-bold text-slate-700 dark:text-slate-300">Informasi Transfer Pembayaran Partner:</div>
                    <div className="font-mono text-slate-600 dark:text-slate-400">
                      Bank: <span className="font-bold text-slate-800 dark:text-slate-200">{printSettlement.venue.bankName || 'BCA'}</span> • Rekening: <span className="font-bold text-slate-800 dark:text-slate-200">{printSettlement.venue.bankAccount || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-8 flex justify-end text-center text-xs">
                  <div className="w-64">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Disetujui oleh,</p>
                                        <p className="text-slate-500">CEO PT. NISKALA TECH ID</p>

                    <p className="font-bold text-slate-900 dark:text-slate-100 mt-12 border-t border-slate-800 dark:border-slate-200 pt-2">Faris Dwi Ramadhan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
};

export default VenuePartnersView;
