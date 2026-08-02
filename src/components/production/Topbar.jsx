import { Bell, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRole } from '@/lib/RoleContext';

export default function Topbar() {
  const { name, profile, area } = useRole();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const scope = profile === 'tecnico' ? `Área ${area}` : 'Toda a operação';

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-blue-600">{greet}, {name.split(' ')[0]}</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#1F2937] md:text-3xl">Central de Solicitações de OP</h1>
        <p className="mt-1 text-xs text-[#9CA3AF]">{scope}</p>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notificações" className="grid h-11 w-11 place-items-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F7F7F8]"><Bell size={17} /></button>
        <Link to="/nova-solicitacao" className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"><Plus size={17} />Nova Solicitação</Link>
      </div>
    </header>
  );
}