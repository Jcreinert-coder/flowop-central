import { CalendarDays, ClipboardList, Factory, FileText, LayoutDashboard, LogOut, PlusCircle, Repeat, ScrollText, Settings, UserRound, UsersRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/RoleContext';
import { profileLabel } from '@/lib/areas';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { profile, area, cargo, name, isAdmin } = useRole();
  const navigate = useNavigate();
  const handleLogout = () => base44.auth.logout();

  const items = [
    ['Dashboard', LayoutDashboard, '/'],
    ['Nova Solicitação', PlusCircle, '/nova-solicitacao'],
    ['Solicitações', ClipboardList, '/solicitacoes'],
    ...(isAdmin ? [['Planejamento', CalendarDays, '/planejamento']] : []),
    ...(isAdmin ? [['Auditoria', ScrollText, '/auditoria']] : []),
    ...(isAdmin ? [['Relatórios', FileText, '/relatorios']] : []),
    ...(isAdmin ? [['Usuários', UsersRound, '/usuarios']] : []),
    ...(isAdmin ? [['Configurações', Settings, '/configuracoes']] : []),
  ];

  const roleLabel = profile === 'tecnico' ? `Técnico · ${area || '—'}` : profileLabel(profile);
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#E5E7EB] bg-white px-4 py-6 lg:flex">
      <Link to="/" className="mb-8 flex items-center gap-3 px-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Factory size={20} />
        </span>
        <span>
          <b className="block text-[#1F2937]">CSOP</b>
          <small className="text-[#9CA3AF]">Central de OPs</small>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {items.map(([label, Icon, to]) => (
          <Link key={label} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${pathname === to ? 'bg-blue-50 text-blue-700 font-medium' : 'text-[#6B7280] hover:bg-[#F7F7F8] hover:text-[#1F2937]'}`}>
            <Icon size={17} />{label}
          </Link>
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-3 text-left transition hover:bg-[#F0F0F2]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-sm font-semibold text-blue-700">{initials}</span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-sm text-[#1F2937]">{name}</b>
              <small className="text-xs text-[#9CA3AF]">{roleLabel}{cargo ? ` · ${cargo}` : ''}</small>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-52">
          <DropdownMenuItem onClick={() => navigate('/meu-perfil')}><UserRound size={15} />Meu perfil</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}><Repeat size={15} />Trocar usuário</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:text-rose-600"><LogOut size={15} />Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}