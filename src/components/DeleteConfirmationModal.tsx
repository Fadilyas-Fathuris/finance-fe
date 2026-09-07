import React from 'react';
import { AlertOctagon, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (val: string) => void;
  targetName: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reason,
  setReason,
  targetName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-6 relative overflow-hidden animate-scale-up">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3 mb-4 mt-2">
          <div className="w-10 h-10 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center rounded-xl border border-rose-500/20">
            <AlertOctagon size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Konfirmasi Penghapusan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Anti-Fraud Safeguard</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
            Anda akan menghapus data keuangan: <strong className="font-mono text-xs text-rose-600 dark:text-rose-400">{targetName}</strong>. 
            Tindakan ini akan dicatat dalam log audit C-Level secara real-time.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
              Alasan Penghapusan (Wajib diisi):
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Salah input nominal / Duplikasi transaksi..."
              className="w-full neo-input h-24 p-3 text-xs resize-none rounded-xl"
              maxLength={255}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            BATAL
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim()}
            className={`text-xs font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              reason.trim()
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                : 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
          >
            YA, HAPUS DATA
          </button>
        </div>
      </div>
    </div>
  );
};
