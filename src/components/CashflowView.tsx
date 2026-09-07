import React, { useState, useRef, useEffect } from 'react';
import { Plus, BarChart3, Trash2, FileText, Printer, AlertTriangle } from 'lucide-react';
import type { Transaction } from '../Types';
import { cn, FormGroup } from './Common';
import { ReceiptUploader } from './ReceiptUploader';
import { useAuth } from '../context/AuthContext';
import { generateDocNumber } from '../utils/docNumbering';

interface CashflowViewProps {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  formatCurrency: (amount: number) => string;
  clearAll: (reason: string) => void;
  deleteTransaction?: (id: string) => void;
}

// Default form state factory
const createEmptyForm = () => ({
  date: new Date().toISOString().split('T')[0],
  category: '',
  description: '',
  amount: 0,
  receiptImage: '',
});

const businessLineLabels: Record<string, string> = {
  global: 'Seluruh Lini Bisnis',
  niskala: 'Niskala Dev',
  aksalab: 'Aksalab SaaS',
  snapcala: 'Snapcala Photobooth',
};

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const CashflowView: React.FC<CashflowViewProps> = ({ transactions, addTransaction, formatCurrency, clearAll, deleteTransaction }) => {
  const { user, activeWorkspace } = useAuth();
  const isCLevel = user?.role === 'CEO' || user?.role === 'CFO';
  const ledgerColSpan = (activeWorkspace === 'global' ? 7 : 6) + (isCLevel ? 1 : 0);
  const printRef = useRef<HTMLDivElement>(null);

  // ===== SEPARATE form states for Income and Expense =====
  const [incomeForm, setIncomeForm] = useState({
    ...createEmptyForm(),
    category: 'Photobooth Subs',
    businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
  });
  const [expenseForm, setExpenseForm] = useState({
    ...createEmptyForm(),
    category: 'Gaji Karyawan',
    businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
  });

  useEffect(() => {
    setIncomeForm(prev => ({
      ...prev,
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    }));
    setExpenseForm(prev => ({
      ...prev,
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    }));
  }, [activeWorkspace]);

  // Reset Ledger modal state
  const [resetModal, setResetModal] = useState({ isOpen: false, reason: '' });

  const categories = {
    in: ['Photobooth Subs', 'Proyek Dev', 'Event Photobooth', 'Maintenance', 'Lainnya'],
    out: ['Gaji Karyawan', 'Operasional Kantor', 'Biaya Event', 'Marketing', 'Alat Kerja', 'Server/Hosting', 'Lainnya']
  };

  const handleSaveIncome = () => {
    if (!incomeForm.description || incomeForm.amount <= 0) return;
    addTransaction({ ...incomeForm, type: 'in' });
    setIncomeForm({
      ...createEmptyForm(),
      category: 'Photobooth Subs',
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    });
  };

  const handleSaveExpense = () => {
    if (!expenseForm.description || expenseForm.amount <= 0) return;
    addTransaction({ ...expenseForm, type: 'out' });
    setExpenseForm({
      ...createEmptyForm(),
      category: 'Gaji Karyawan',
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    });
  };

  const handleConfirmReset = () => {
    if (!resetModal.reason.trim()) return;
    clearAll(resetModal.reason);
    setResetModal({ isOpen: false, reason: '' });
  };

  const handlePrintLedger = () => {
    const totalIn = transactions.filter(t => t.type === 'in').reduce((a, t) => a + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'out').reduce((a, t) => a + t.amount, 0);
    const net = totalIn - totalOut;
    const sortedTransactions = [...transactions].reverse();
    const docNumber = generateDocNumber('LK', Math.max(sortedTransactions.length, 1), new Date().toISOString());
    const printedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const workspaceLabel = businessLineLabels[activeWorkspace] || activeWorkspace;

    const legacyPrintWindow = window.open('', '_blank');
    if (!legacyPrintWindow) return;

    legacyPrintWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Buku Besar Kas - Niskala Finance</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: Inter, Arial, sans-serif; padding: 20px; color: #1e293b; font-size: 11px; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sheet { max-width: 210mm; margin: 0 auto; }
          .letterhead { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 16px; margin-bottom: 18px; }
          .brand { display: flex; align-items: center; gap: 14px; }
          .brand img { width: 48px; height: 48px; object-fit: contain; }
          h1 { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.2px; }
          .kicker { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1.8px; font-weight: 700; margin-top: 4px; }
          .doc-meta { text-align: right; color: #64748b; line-height: 1.6; }
          .doc-meta strong { display: block; color: #4682B4; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
          .title { text-align: center; padding: 8px 0 16px; }
          .title h2 { font-size: 16px; color: #0f172a; text-transform: uppercase; letter-spacing: .4px; }
          .title p { color: #64748b; margin-top: 5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #f8fafc; border-radius: 12px; padding: 14px; margin-bottom: 18px; }
          .label { display: block; color: #94a3b8; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; margin-bottom: 4px; }
          .value { color: #0f172a; font-weight: 800; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
          .summary-card { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 12px; padding: 12px; text-align: center; }
          .summary-card strong { display: block; margin-top: 4px; font-size: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #0f172a; }
          .summary-card.in strong { color: #059669; }
          .summary-card.out strong { color: #dc2626; }
          .summary-card.net { background: ${net >= 0 ? '#ecfdf5' : '#fff1f2'}; border-color: ${net >= 0 ? '#a7f3d0' : '#fecdd3'}; }
          .summary-card.net strong { color: ${net >= 0 ? '#047857' : '#be123c'}; }
          table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 12px; margin-top: 8px; }
          th { background: #1e293b; color: #ffffff; padding: 9px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: .7px; font-weight: 800; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 8px; font-weight: 900; text-transform: uppercase; }
          .badge-in { background: #dcfce7; color: #047857; }
          .badge-out { background: #ffe4e6; color: #be123c; }
          .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .amount { text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 900; white-space: nowrap; }
          .amount-in { color: #059669; }
          .amount-out { color: #dc2626; }
          .signature { display: flex; justify-content: flex-end; padding-top: 36px; text-align: center; page-break-inside: avoid; }
          .signature-box { width: 230px; }
          .signature-role { color: #94a3b8; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }
          .signature-name { margin-top: 54px; color: #0f172a; font-weight: 900; border-top: 1px solid #1e293b; padding-top: 8px; }
          .footer { margin-top: 28px; text-align: center; color: #cbd5e1; font-size: 7px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="letterhead">
            <div class="brand">
              <img src="${window.location.origin}/logo.png" alt="Niskala Logo" />
              <div>
                <h1>NISKALA FINANCE</h1>
                <div class="kicker">Financial Operations Ledger - PT. NISKALA TECH ID</div>
              </div>
            </div>
            <div class="doc-meta">
              <div>NOMOR DOKUMEN</div>
              <strong>${docNumber}</strong>
              <div>Tanggal Cetak: ${printedAt}</div>
            </div>
          </div>

          <div class="title">
            <h2>Laporan Buku Besar Kas / General Ledger</h2>
            <p>Periode seluruh transaksi tercatat</p>
          </div>

          <div class="info-grid">
            <div>
              <span class="label">Entitas Pengelola:</span>
              <div class="value">PT. NISKALA TECH ID</div>
              <div>Finance & Accounting</div>
            </div>
            <div>
              <span class="label">Lingkup Laporan:</span>
              <div class="value">${escapeHtml(workspaceLabel)}</div>
              <div>Dicetak oleh ${escapeHtml(user?.name || '-')} (${escapeHtml(user?.role || '-')})</div>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-card in"><span class="label">Total Pemasukan</span><strong>+ Rp ${totalIn.toLocaleString('id-ID')}</strong></div>
            <div class="summary-card out"><span class="label">Total Pengeluaran</span><strong>- Rp ${totalOut.toLocaleString('id-ID')}</strong></div>
            <div class="summary-card net"><span class="label">Saldo Bersih</span><strong>Rp ${net.toLocaleString('id-ID')}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:12%">Tanggal</th>
                <th style="width:14%">Tipe</th>
                <th style="width:18%">Kategori</th>
                <th>Deskripsi</th>
                <th style="width:20%; text-align:right">Mutasi Kas</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTransactions.map(t => `
                <tr>
                  <td class="mono" style="font-weight:700">${new Date(t.date).toLocaleDateString('id-ID')}</td>
                  <td><span class="badge ${t.type === 'in' ? 'badge-in' : 'badge-out'}">${t.type === 'in' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
                  <td style="font-weight:700">${escapeHtml(t.category)}</td>
                  <td>${escapeHtml(t.description)}</td>
                  <td class="amount ${t.type === 'in' ? 'amount-in' : 'amount-out'}">${t.type === 'in' ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signature">
            <div class="signature-box">
              <div class="signature-role">Disetujui oleh,</div>
              <div class="signature-name">Faris Dwi Ramadhan</div>
              <div>CEO NISKALA</div>
            </div>
          </div>

          <div class="footer">Document Generated by Niskala Finance OS - Precision Ledger System</div>
        </div>
      </body>
      </html>
    `);
    legacyPrintWindow.document.close();
    legacyPrintWindow.focus();
    legacyPrintWindow.print();
    return;

    const printWindow = window.open('', '_blank')!;
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Buku Besar Kas — Niskala Finance</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 32px; color: #1a1a2e; font-size: 11px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #1a1a2e; padding-bottom: 16px; }
          .header h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: -0.5px; }
          .header .sub { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
          .header .date { text-align: right; font-size: 10px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #1a1a2e; color: white; padding: 8px 12px; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; text-align: left; }
          th:nth-child(5) { text-align: right; }
          td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
          tr:nth-child(even) { background: #f9fafb; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 8px; font-weight: 800; text-transform: uppercase; }
          .badge-in { background: #A3E635; color: black; }
          .badge-out { background: #FF5A5F; color: white; }
          .amount-in { color: #16a34a; font-weight: 800; text-align: right; font-family: monospace; }
          .amount-out { color: #ef4444; font-weight: 800; text-align: right; font-family: monospace; }
          .summary { margin-top: 20px; border-top: 3px solid #1a1a2e; padding-top: 12px; display: flex; justify-content: flex-end; gap: 24px; }
          .summary-item { text-align: right; }
          .summary-label { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 800; }
          .summary-value { font-size: 14px; font-weight: 900; font-family: monospace; }
          .footer { margin-top: 40px; font-size: 8px; color: #999; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>NISKALA FINANCE</h1>
            <div class="sub">Buku Besar Kas / General Ledger</div>
          </div>
          <div class="date">
            Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            Oleh: ${user?.name || '-'} (${user?.role || '-'})
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:12%">Tanggal</th>
              <th style="width:15%">Tipe</th>
              <th style="width:15%">Kategori</th>
              <th>Deskripsi</th>
              <th style="width:20%; text-align:right">Mutasi Kas</th>
            </tr>
          </thead>
          <tbody>
            ${[...transactions].reverse().map(t => `
              <tr>
                <td style="font-family:monospace; font-weight:700">${new Date(t.date).toLocaleDateString('id-ID')}</td>
                <td><span class="badge ${t.type === 'in' ? 'badge-in' : 'badge-out'}">${t.type === 'in' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
                <td style="font-weight:700">${t.category}</td>
                <td>${t.description}</td>
                <td class="${t.type === 'in' ? 'amount-in' : 'amount-out'}">${t.type === 'in' ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Pemasukan</div>
            <div class="summary-value" style="color:#16a34a">+ Rp ${totalIn.toLocaleString('id-ID')}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Pengeluaran</div>
            <div class="summary-value" style="color:#ef4444">- Rp ${totalOut.toLocaleString('id-ID')}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Saldo Bersih</div>
            <div class="summary-value" style="color:${net >= 0 ? '#16a34a' : '#ef4444'}">Rp ${net.toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div class="footer">Dokumen ini digenerate otomatis oleh Niskala Finance ERP — ${new Date().toISOString()}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      {/* Input Cards Container */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Income Card */}
        <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 lg:gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center rounded-xl shrink-0">
              <Plus size={22} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Catat Pemasukan</h2>
              <p className="text-xs text-slate-400 mt-0.5">Input Transaksi Kas Masuk</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Tanggal Transaksi">
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="neo-input"
                />
              </FormGroup>
              <FormGroup label="Kategori Pemasukan">
                <select
                  value={incomeForm.category}
                  onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  className="neo-input font-medium cursor-pointer"
                >
                  {categories.in.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormGroup>
            </div>

            {activeWorkspace === 'global' && (
              <FormGroup label="Lini Bisnis Target">
                <select
                  value={incomeForm.businessLine}
                  onChange={(e) => setIncomeForm({ ...incomeForm, businessLine: e.target.value as any })}
                  className="neo-input uppercase font-semibold text-xs cursor-pointer"
                >
                  <option value="niskala">Niskala (Dev)</option>
                  <option value="aksalab">Aksalab (SaaS)</option>
                  <option value="snapcala">Snapcala (Photobooth)</option>
                </select>
              </FormGroup>
            )}

            <FormGroup label="Deskripsi / Keterangan Pemasukan">
              <input
                type="text"
                placeholder="Contoh: Pembayaran DP Proyek Website PT XYZ..."
                value={incomeForm.description}
                onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                className="neo-input"
              />
            </FormGroup>

            <FormGroup label="Jumlah Pemasukan (Nominal)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400 text-xs">RP</span>
                <input
                  type="number"
                  placeholder="0"
                  value={incomeForm.amount || ''}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })}
                  className="neo-input pl-12 font-bold font-mono text-lg tabular-nums"
                />
              </div>
            </FormGroup>

            <FormGroup label="Upload Bukti Transfer / Nota (Opsional)">
              <ReceiptUploader
                value={incomeForm.receiptImage}
                onUploadSuccess={(url: string) => setIncomeForm({ ...incomeForm, receiptImage: url })}
                onClear={() => setIncomeForm({ ...incomeForm, receiptImage: '' })}
              />
            </FormGroup>

            <button
              type="button"
              onClick={handleSaveIncome}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} strokeWidth={2.5} /> SIMPAN PEMASUKAN
            </button>
          </div>
        </div>

        {/* Expense Card */}
        <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 lg:gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center rounded-xl shrink-0">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Catat Pengeluaran</h2>
              <p className="text-xs text-slate-400 mt-0.5">Input Transaksi Kas Keluar</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Tanggal Transaksi">
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="neo-input"
                />
              </FormGroup>
              <FormGroup label="Kategori Pengeluaran">
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="neo-input font-medium cursor-pointer"
                >
                  {categories.out.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormGroup>
            </div>

            {activeWorkspace === 'global' && (
              <FormGroup label="Lini Bisnis Penanggung Jawab">
                <select
                  value={expenseForm.businessLine}
                  onChange={(e) => setExpenseForm({ ...expenseForm, businessLine: e.target.value as any })}
                  className="neo-input uppercase font-semibold text-xs cursor-pointer"
                >
                  <option value="niskala">Niskala (Dev)</option>
                  <option value="aksalab">Aksalab (SaaS)</option>
                  <option value="snapcala">Snapcala (Photobooth)</option>
                </select>
              </FormGroup>
            )}

            <FormGroup label="Deskripsi / Keterangan Pengeluaran">
              <input
                type="text"
                placeholder="Contoh: Pembelian lisensi Figma Pro bulan ini..."
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="neo-input"
              />
            </FormGroup>

            <FormGroup label="Jumlah Pengeluaran (Nominal)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400 text-xs">RP</span>
                <input
                  type="number"
                  placeholder="0"
                  value={expenseForm.amount || ''}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="neo-input pl-12 font-bold font-mono text-lg tabular-nums"
                />
              </div>
            </FormGroup>

            <FormGroup label="Upload Bukti Struk / Kwitansi (Opsional)">
              <ReceiptUploader
                value={expenseForm.receiptImage}
                onUploadSuccess={(url: string) => setExpenseForm({ ...expenseForm, receiptImage: url })}
                onClear={() => setExpenseForm({ ...expenseForm, receiptImage: '' })}
              />
            </FormGroup>

            <button
              type="button"
              onClick={handleSaveExpense}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} strokeWidth={2.5} /> SIMPAN PENGELUARAN
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div ref={printRef} className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Buku Besar Kas</h2>
              <p className="text-xs text-slate-400 mt-0.5">Catatan Mutasi Transaksi Keuangan Realtime</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrintLedger}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 px-3.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Printer size={15} /> CETAK LEDGER
            </button>

            {isCLevel && (
              <button
                onClick={() => setResetModal({ isOpen: true, reason: '' })}
                className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={15} /> RESET LEDGER
              </button>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="neo-table">
            <thead>
              <tr>
                <th className="w-28 lg:w-40">Tanggal</th>
                {activeWorkspace === 'global' && <th className="w-24 lg:w-32 text-center">Lini Bisnis</th>}
                <th className="w-32 lg:w-48 text-center">Kategori</th>
                <th>Deskripsi</th>
                <th className="text-center w-28">Bukti</th>
                {isCLevel && <th className="text-center w-36 lg:w-44">Audit</th>}
                <th className="text-right w-40 lg:w-64">Mutasi Kas</th>
                <th className="text-center w-16 lg:w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                [...transactions].reverse().map((t, idx) => (
                  <tr key={t.id || idx} className="transition-all duration-150">
                    <td className="font-mono font-bold text-xs whitespace-nowrap">{t.date}</td>
                    {activeWorkspace === 'global' && (
                      <td className="text-center">
                        <span className="neo-badge bg-[#4682B4]/10 text-[#4682B4] px-2 py-0.5 text-[10px] font-bold uppercase rounded-md">
                          {t.businessLine || 'niskala'}
                        </span>
                      </td>
                    )}
                    <td className="text-center">
                      <span className={cn(
                        "neo-badge text-[10px] px-2.5 py-1 font-bold rounded-md whitespace-nowrap",
                        t.type === 'in' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      )}>
                        {t.category}
                      </span>
                    </td>
                    <td className="font-medium text-xs text-slate-900 dark:text-slate-100 max-w-[140px] lg:max-w-xs truncate">{t.description}</td>
                    <td className="text-center">
                      {t.receiptImage ? (
                        <a
                          href={t.receiptImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-[#4682B4] hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    {isCLevel && (
                      <td className="text-center">
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {t.createdBy?.name || 'Sistem lama'}
                        </div>
                        {t.updatedBy && (
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            Ubah: {t.updatedBy.name}
                          </div>
                        )}
                      </td>
                    )}
                    <td className={cn("font-mono font-bold text-right text-xs sm:text-sm tabular-nums whitespace-nowrap", t.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      {t.type === 'in' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="text-center">
                      {isCLevel && (
                        <button
                          onClick={() => deleteTransaction && deleteTransaction(t.id)}
                          className="hover:text-rose-600 text-slate-400 transition-colors p-1.5 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={ledgerColSpan} className="py-16 lg:py-20 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <FileText size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400">Belum Ada Transaksi Tercatat</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modernized Reset Ledger Modal */}
      {resetModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-6 relative overflow-hidden animate-scale-up">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
            
            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-10 h-10 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center rounded-xl border border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Reset Seluruh Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tindakan Kritis — Anti-Fraud Safeguard</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium mb-4">
              Anda akan <strong className="text-rose-600 dark:text-rose-400 font-bold">menghapus seluruh {transactions.length} catatan transaksi</strong> dari buku besar kas.
              Tindakan ini akan dicatat dalam log audit C-Level.
            </p>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
                Alasan Reset (Wajib diisi):
              </label>
              <textarea
                value={resetModal.reason}
                onChange={(e) => setResetModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Contoh: Tutup buku akhir bulan / Migrasi data ke sistem baru..."
                className="w-full neo-input h-24 p-3 text-xs resize-none rounded-xl"
                maxLength={255}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResetModal({ isOpen: false, reason: '' })}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                BATAL
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={!resetModal.reason.trim()}
                className={`text-xs font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  resetModal.reason.trim()
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                    : 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                YA, RESET SEMUA DATA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashflowView;
