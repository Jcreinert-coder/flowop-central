import { Bell, Menu, Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '@/lib/RoleContext';

export default function Topbar({ search, onSearch }) {
  const { name, profile, sector } = useRole();
  const nav = useNavigate();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const scope = profile === 'tecnico' ? `Setor ${sector}` : 'Toda a operação';

  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-violet-300">{greet}, {name.split(' ')[0]} 👋</p>
        <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">Central de Solicitações de OP</h1>
        <p className="mt-1 text-xs text-slate-500">{scope}</p>
      </div>
      <div className="flex items-center gap-2">
        {onSearch && (
          <label className="glass hidden h-11 items-center gap-2 px-3 md:flex">
            <Search size={16} className="text-slate-500" />
            <input aria-label="Pesquisar" value={search || ''} onChange={(e) => onSearch(e.target.value)} className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-600" placeholder="Pesquisar..." />
          </label>
        )}
        {!onSearch && (
          <label className="glass hidden h-11 items-center gap-2 px-3 md:flex">
            <Search size={16} className="text-slate-500" />
            <input aria-label="Pesquisar" onKeyDown={(e) => e.key === 'Enter' && nav('/solicitacoes')} className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-600" placeholder="Pesquisar..." />
          </label>
        )}
        <button aria-label="Notificações" className="glass grid h-11 w-11 place-items-center"><Bell size={17} /></button>
        <button aria-label="Menu" className="glass grid h-11 w-11 place-items-center lg:hidden"><Menu size={18} /></button>
        <Link to="/nova-solicitacao" className="flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-medium text-white shadow-[0_0_24px_rgba(124,58,237,.3)] transition hover:bg-violet-500"><Plus size={17} />Nova Solicitação</Link>
      </div>
    </header>
  );
}