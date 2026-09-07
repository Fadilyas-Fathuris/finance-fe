import React, { useState, useEffect } from 'react';
import { Laptop, Plus, Trash2, AlertCircle, DollarSign, Briefcase } from 'lucide-react';
import type { Project } from '../Types';
import { cn, FormGroup } from './Common';
import { useAuth } from '../context/AuthContext';

interface ProjectsViewProps {
  projects: Project[];
  addProject: (p: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, addProject, deleteProject, formatCurrency }) => {
  const { activeWorkspace } = useAuth();
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '', client: '', type: 'Website', status: 'ongoing', value: 0, paid: 0,
    start: new Date().toISOString().split('T')[0], deadline: '',
    businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    }));
  }, [activeWorkspace]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addProject(formData);
    setFormData({
      name: '',
      client: '',
      type: 'Website',
      status: 'ongoing',
      value: 0,
      paid: 0,
      start: new Date().toISOString().split('T')[0],
      deadline: '',
      businessLine: activeWorkspace === 'global' ? 'niskala' : activeWorkspace,
    });
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in-up">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Form */}
        <div className="xl:col-span-7 app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 lg:gap-4 pb-4 mb-6 lg:mb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
              <Laptop size={22} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Project Management</h2>
              <p className="text-xs text-slate-400 mt-0.5">Lacak & Kelola Proyek Client / Inhouse</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="sm:col-span-2">
                <FormGroup label="Nama Proyek">
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="neo-input pl-10" placeholder="E-Commerce API Integration" />
                  </div>
                </FormGroup>
              </div>
              <FormGroup label="Klien">
                <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="neo-input" placeholder="PT. Nama Klien" />
              </FormGroup>
              <FormGroup label="Jenis Layanan">
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="neo-input font-semibold py-[11px] text-xs">
                  <option>Website</option><option>Mobile App</option><option>UI/UX Design</option><option>Maintenance</option>
                </select>
              </FormGroup>
              {activeWorkspace === 'global' && (
                <FormGroup label="Lini Bisnis">
                  <select
                    value={formData.businessLine}
                    onChange={e => setFormData({ ...formData, businessLine: e.target.value })}
                    className="neo-input font-semibold py-[11px] text-xs uppercase"
                  >
                    <option value="niskala">Niskala (Dev)</option>
                    <option value="aksalab">Aksalab (SaaS)</option>
                    <option value="snapcala">Snapcala (Photobooth)</option>
                  </select>
                </FormGroup>
              )}
              <FormGroup label="Nilai Kontrak">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400 text-xs">RP</span>
                  <input type="number" value={formData.value || ''} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="neo-input pl-12 font-bold font-mono tabular-nums" />
                </div>
              </FormGroup>
              <FormGroup label="Sudah Terbayar">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400 text-xs">RP</span>
                  <input type="number" value={formData.paid || ''} onChange={e => setFormData({...formData, paid: Number(e.target.value)})} className="neo-input pl-12 font-bold font-mono tabular-nums" />
                </div>
              </FormGroup>
              <FormGroup label="Tanggal Mulai">
                <input type="date" value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} className="neo-input" />
              </FormGroup>
              <FormGroup label="Deadline">
                <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="neo-input" />
              </FormGroup>
            </div>

            <button type="submit" className="w-full bg-[#4682B4] hover:bg-[#2F6F9F] text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <Plus size={18} strokeWidth={2.5} /> SIMPAN KE DAFTAR PROYEK
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-5 space-y-4 lg:space-y-6">
           <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <DollarSign size={16} className="text-[#4682B4]" /> Monitoring Piutang Proyek
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-3">
                   <span className="text-xs text-slate-400 font-medium">Total Nilai Kontrak</span>
                   <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{formatCurrency(projects.reduce((a, p) => a + p.value, 0))}</span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-3">
                   <span className="text-xs text-slate-400 font-medium">Total Terbayar</span>
                   <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(projects.reduce((a, p) => a + p.paid, 0))}</span>
                </div>
                <div className="pt-2">
                   <span className="text-xs text-slate-400 font-medium block mb-1">Total Outstanding (Sisa Piutang)</span>
                   <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 tracking-tight">
                     {formatCurrency(projects.reduce((a, p) => a + (p.value - p.paid), 0))}
                   </span>
                </div>
              </div>
           </div>
           
           <div className="app-card bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 lg:p-5 rounded-2xl relative overflow-hidden group">
              <div className="relative z-10 flex gap-3 lg:gap-4 items-start">
                <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <div className="text-[11px] font-semibold leading-relaxed text-amber-700 dark:text-amber-300">
                  Selalu update status 'Terbayar' setiap kali invoice masuk untuk menjaga akurasi laporan laba rugi per-proyek.
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 lg:p-6 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 bg-[#4682B4]/10 text-[#4682B4] dark:text-sky-400 border border-[#4682B4]/20 flex items-center justify-center rounded-xl shrink-0">
              <Laptop size={18} />
            </div>
            <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100">Monitoring Proyek</h2>
          </div>
        </div>

        <div className="table-responsive">
          <table className="neo-table">
            <thead>
              <tr>
                <th>PROYEK</th>
                {activeWorkspace === 'global' && <th className="text-center">LINI BISNIS</th>}
                <th>KLIEN</th>
                <th className="text-right">KONTRAK</th>
                <th className="text-right">TERBAYAR</th>
                <th className="text-center">STATUS</th>
                <th className="text-right">SISA</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map(p => (
                  <tr key={p.id} className="group">
                    <td style={{ borderRight: '2px solid var(--border-color)' }}>
                      <div className="font-black uppercase italic text-[10px] lg:text-xs leading-none tracking-tight">{p.name}</div>
                      <div className="text-[8px] font-bold mt-1.5 uppercase italic tracking-widest leading-none" style={{ color: 'var(--text-faint)' }}>{p.type}</div>
                    </td>
                    {activeWorkspace === 'global' && (
                      <td className="text-center" style={{ borderRight: '2px solid var(--border-color)' }}>
                        <span className="neo-badge bg-[#A3E635]/20 text-[#8ec32d] px-2 py-1 text-[8px] uppercase" style={{ borderColor: 'var(--border-color)' }}>
                          {p.businessLine || 'niskala'}
                        </span>
                      </td>
                    )}
                    <td className="font-black uppercase italic text-[9px] lg:text-[10px] tracking-tight whitespace-nowrap" style={{ borderRight: '2px solid var(--border-color)', color: 'var(--text-faint)' }}>{p.client}</td>
                    <td className="font-black italic tabular-nums text-[10px] lg:text-xs text-right whitespace-nowrap" style={{ borderRight: '2px solid var(--border-color)' }}>{formatCurrency(p.value)}</td>
                    <td className="font-black italic tabular-nums text-[10px] lg:text-xs text-right text-green-600 whitespace-nowrap" style={{ borderRight: '2px solid var(--border-color)' }}>+{formatCurrency(p.paid)}</td>
                    <td className="text-center" style={{ borderRight: '2px solid var(--border-color)' }}>
                      <span className={cn(
                        "neo-badge border-2 border-black py-1 px-2 lg:px-3 text-[8px] lg:text-[9px] italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                        p.status === 'done' ? 'bg-[#A3E635] text-black' : p.status === 'ongoing' ? 'bg-blue-600 text-white' : 'bg-yellow-300 text-black'
                      )}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right py-3 lg:py-4 px-3 lg:px-4">
                      <div className="flex items-center justify-end gap-2 lg:gap-4">
                        <span className="font-black italic text-red-500 tabular-nums text-[10px] lg:text-xs whitespace-nowrap">-{formatCurrency(p.value - p.paid)}</span>
                        <button onClick={() => deleteProject(p.id)} className="p-1 lg:p-1.5 hover:text-red-500 hover:bg-red-50 rounded-md transition-all" style={{ color: 'var(--text-faint)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeWorkspace === 'global' ? 7 : 6} className="text-center py-16 lg:py-20">
                    <div className="flex flex-col items-center gap-3">
                      <Laptop size={40} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
                      <div className="font-black text-base lg:text-xl uppercase italic tracking-widest" style={{ color: 'var(--text-faint)' }}>Belum Ada Proyek</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;
