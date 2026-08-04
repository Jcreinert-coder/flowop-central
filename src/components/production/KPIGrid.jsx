import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock3, Inbox, Layers, Package, Siren, Wrench } from 'lucide-react';
import { ETAPAS } from '@/lib/areas';

const today = () => new Date().toISOString().slice(0, 10);

export default function KPIGrid({ rows, profile, area }) {
  const nav = useNavigate();
  const scoped = profile === 'tecnico' ? rows.filter((r) => r.area === area) : rows;
  const hoje = scoped.filter((r) => (r.request_date || today()) === today());
  const ops = scoped.filter((r) => r.op_number);
  const pendentes = scoped.filter((r) => !['Apontada', 'Cancelada'].includes(r.status));
  const urgentes = scoped.filter((r) => r.priority === 'Urgente' && !['Apontada', 'Cancelada'].includes(r.status));
  const qtdTotal = scoped.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const concluidas = scoped.filter((r) => r.status === 'Apontada');

  const porEtapa = ETAPAS.map((e) => ({ etapa: e, count: scoped.filter((r) => r.etapa === e).length }));

  const go = (prefilter, value) => nav(`/solicitacoes?prefilter=${prefilter}${value ? `&value=${encodeURIComponent(value)}` : ''}`);

  const cards = [
    { label: 'Solicitações Hoje', value: hoje.length, Icon: Inbox, color: '#0ea5e9', onClick: () => go('today') },
    { label: 'OPs Criadas', value: ops.length, Icon: Wrench, color: '#3b82f6', onClick: () => go('ops') },
    { label: 'Pendentes', value: pendentes.length, Icon: Clock3, color: '#f59e0b', onClick: () => go('pendentes') },
    { label: 'Urgentes', value: urgentes.length, Icon: Siren, color: '#ef4444', onClick: () => go('urgentes') },
    { label: 'Produção Solicitada', value: qtdTotal.toLocaleString('pt-BR'), Icon: Package, color: '#6366f1', onClick: () => nav('/solicitacoes') },
    { label: 'OPs Concluídas', value: concluidas.length, Icon: CheckCircle2, color: '#2563eb', onClick: () => go('concluidas') },
  ];

  const etapaCards = porEtapa.map((e) => ({
    label: e.etapa === 'Mistura Fina' ? 'Misturas Finas' : e.etapa === 'Semiacabado' ? 'Semiacabados' : 'Produtos Acabados',
    value: e.count,
    Icon: Layers,
    color: '#8b5cf6',
    onClick: () => go('etapa', e.etapa),
  }));

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <button key={c.label} onClick={c.onClick} className="flex h-full min-h-[120px] flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${c.color}12`, color: c.color }}>
              <c.Icon size={19} />
            </span>
            <div className="mt-4">
              <strong className="block text-2xl font-semibold text-[#1F2937]">{c.value}</strong>
              <p className="mt-1 text-xs text-[#6B7280]">{c.label}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {etapaCards.map((c) => (
          <button key={c.label} onClick={c.onClick} className="flex h-full min-h-[100px] items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${c.color}12`, color: c.color }}>
              <c.Icon size={19} />
            </span>
            <div>
              <strong className="block text-2xl font-semibold text-[#1F2937]">{c.value}</strong>
              <p className="mt-1 text-xs text-[#6B7280]">{c.label}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}