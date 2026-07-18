import { BarChart3, ClipboardList, Factory, FileText, Gauge, LayoutDashboard, PlusCircle, ScrollText, UsersRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '@/lib/RoleContext';
import { useState } from 'react';

const SECTORS = ['Produção', 'Expedição', 'Qualidade', 'Almoxarifado', 'Mistura', 'PCP', 'Envase'];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { profile, sector, name, canManage, setProfile } = useRole();
  const [open, setOpen] = useState(false);

  const items = [
    ['Dashboard', LayoutDashboard, '/'],
    ['Nova Solicitação', PlusCircle, '/nova-solicitacao'],
    ['Solicitações', ClipboardList, '/solicitacoes'],
    ...(canManage ? [['Auditoria', ScrollText, '/auditoria']] : []),
    ...(canManage ? [['Relatórios', FileText, '/relatorios']] : []),
  ];

  const roleLabel = profile === 'tecnico' ? `Técnico · ${sector}` : profile === 'supply' ? 'Supply' : 'Gestor';
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#0b1224]/95 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link to="/" className="mb-8 flex items-center gap-3 px-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_28px_rgba(139,92,246,.35)]">
          <Factory size={20} />
        </span>
        <span>
          <b className="block text-white">CSOP</b>
          <small className="text-slate-500">Central de OPs</small>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {items.map(([label, Icon, to]) => (
          <Link key={label} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${pathname === to ? 'bg-violet-500/15 text-violet-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Icon size={17} />{label}
          </Link>
        ))}
      </nav>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.04] p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/20 text-sm font-semibold text-violet-300">{initials}</span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-sm text-white">{name}</b>
            <small className="text-xs text-slate-500">{roleLabel}</small>
          </span>
          <button onClick={() => setOpen((o) => !o)} className="text-xs text-slate-500 hover:text-white" aria-label="Trocar perfil">⇅</button>
        </div>
        {open && (
          <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-600">Trocar perfil (demo)</p>
            <div className="grid grid-cols-3 gap-1">
              {['tecnico', 'supply', 'gestor'].map((p) => (
                <button key={p} onClick={() => setProfile(p, p === 'tecnico' ? (sector !== 'Supply' ? sector : 'Produção') : sector)} className={`rounded-lg px-2 py-1.5 text-xs ${profile === p ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400'}`}>{p}</button>
              ))}
            </div>
            {profile === 'tecnico' && (
              <select value={sector === 'Supply' ? 'Produção' : sector} onChange={(e) => setProfile('tecnico', e.target.value)} className="form-input mt-1 py-2 text-xs">
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}