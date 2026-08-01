import { ArrowLeft, FileText, Layers, ListTree, Ruler, ScrollText, Settings as SettingsIcon, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';
import { useRole } from '@/lib/RoleContext';
import { AREAS, ETAPAS, PRODUTOS_POR_ETAPA } from '@/lib/areas';

const UNITS = ['kg', 'caixas', 'pacotes', 'unidades', 'litros'];

export default function Settings() {
  const { isAdmin } = useRole();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-300">
        <Sidebar />
        <main className="lg:ml-64">
          <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16} />Dashboard</Link>
            <div className="glass p-10 text-center">
              <h1 className="text-xl font-semibold text-white">Acesso restrito</h1>
              <p className="mt-2 text-sm text-slate-400">Apenas usuários Supply e Líderes podem acessar as configurações.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const cards = [
    { icon: UsersRound, title: 'Usuários', desc: 'Cadastrar, editar, ativar e desativar usuários', to: '/usuarios' },
    { icon: ScrollText, title: 'Logs de Auditoria', desc: 'Registro permanente de todas as ações', to: '/auditoria' },
    { icon: FileText, title: 'Relatórios', desc: 'Exportar solicitações em CSV e PDF', to: '/relatorios' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16} />Dashboard</Link>
          <div>
            <p className="text-sm text-violet-300">Administração</p>
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-white"><SettingsIcon size={24} />Configurações</h1>
            <p className="mt-1 text-xs text-slate-500">Parâmetros e módulos administrativos do CSOP</p>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link key={c.title} to={c.to} className="glass flex items-start gap-4 p-5 transition hover:-translate-y-1">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><c.icon size={20} /></span>
                <div>
                  <h2 className="text-sm font-semibold text-white">{c.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">{c.desc}</p>
                </div>
              </Link>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="glass p-5">
              <h2 className="flex items-center gap-2 section-title"><Layers size={16} />Áreas de Produção</h2>
              <ul className="mt-4 space-y-2">
                {AREAS.map((a) => (
                  <li key={a} className="flex items-center gap-3 rounded-xl bg-white/[.035] px-4 py-3 text-sm text-white">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />{a}
                  </li>
                ))}
              </ul>
            </section>
            <section className="glass p-5">
              <h2 className="flex items-center gap-2 section-title"><Ruler size={16} />Unidades de Medida</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {UNITS.map((u) => <span key={u} className="rounded-xl bg-white/[.035] px-4 py-3 text-sm text-white">{u}</span>)}
              </div>
            </section>
          </div>

          <section className="glass p-5">
            <h2 className="flex items-center gap-2 section-title"><ListTree size={16} />Etapas e Produtos</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {ETAPAS.map((etapa) => (
                <div key={etapa} className="rounded-xl bg-white/[.035] p-4">
                  <b className="text-sm text-white">{etapa}</b>
                  <ul className="mt-3 space-y-1.5">
                    {(PRODUTOS_POR_ETAPA[etapa] || []).map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="glass p-5">
            <h2 className="flex items-center gap-2 section-title"><ShieldCheck size={16} />Permissões por perfil</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3 text-xs text-slate-300">
              <div className="rounded-xl bg-white/[.035] p-4">
                <b className="text-white">Supply / Líder</b>
                <p className="mt-2 text-slate-400">Acesso total: visualizam todos os setores, criam OP, alteram status, excluem solicitações, geram relatórios e administram usuários.</p>
              </div>
              <div className="rounded-xl bg-white/[.035] p-4">
                <b className="text-white">Técnico</b>
                <p className="mt-2 text-slate-400">Acesso limitado à própria área: criam solicitações e acompanham o andamento, sem editar, excluir ou alterar status.</p>
              </div>
              <div className="rounded-xl bg-white/[.035] p-4">
                <b className="text-white">Auditoria</b>
                <p className="mt-2 text-slate-400">Toda ação é registrada permanentemente. Apenas Supply e Líderes visualizam os logs.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}