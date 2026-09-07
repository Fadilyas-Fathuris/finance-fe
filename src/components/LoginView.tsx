import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldAlert } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, error } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) return;

    setSubmitting(true);
    setLocalError(null);
    try {
      await login(emailInput.trim(), passwordInput);
    } catch {
      setLocalError('Email atau password tidak sesuai');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-200">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <img src="/logo.png" alt="Niskala Logo" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">Niskala Finance</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Digital Profit System</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-7 sm:p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/20">
          <div className="mb-7">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#4682B4] dark:bg-slate-800">
              <LockKeyhole size={21} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">Masuk</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Akses dashboard keuangan internal Niskala.
              </p>
            </div>
          </div>

          {(error || localError) && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/70 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <ShieldAlert className="text-rose-600 dark:text-rose-300 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-rose-800 dark:text-rose-200">Gagal masuk</p>
                <p className="text-xs text-rose-700 dark:text-rose-300">{localError || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setLocalError(null);
                  }}
                  placeholder="email@niskala.id"
                  autoComplete="email"
                  className="w-full h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 pl-11 pr-4 font-semibold text-sm outline-none transition-all focus:border-[#4682B4] focus:ring-4 focus:ring-[#4682B4]/10 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={submitting}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLocalError(null);
                  }}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 pl-11 pr-12 font-semibold text-sm outline-none transition-all focus:border-[#4682B4] focus:ring-4 focus:ring-[#4682B4]/10 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !emailInput.trim() || !passwordInput}
              className="w-full h-12 rounded-2xl bg-[#4682B4] text-white font-bold text-sm hover:bg-[#3b75a6] transition-all shadow-lg shadow-[#4682B4]/20 disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? 'Menghubungkan...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Aktivitas penting tercatat dalam audit sistem.
          </div>
        </div>
      </div>
    </div>
  );
};
