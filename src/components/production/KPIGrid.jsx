import { CheckCircle2, Clock3, Inbox, Package, Siren, Wrench, Timer } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

export default function KPIGrid({ rows, profile, sector }) {
  const scoped = profile === 'tecnico' ? rows.filter((r) => r.sector === sector) : rows;
  const hoje = scoped.filter((r) => (r.request_date || today()) === today());
  const ops = scoped.filter((r) => r.op_number);
  const pendentes = scoped.filter((r) => !['Finalizada', 'Cancelada'].includes(r.status));
  const urgentes = scoped.filter((r) => r.priority === 'Urgente' && !['Finalizada', 'Cancelada'].includes(r.status));
  const finalizadas = scoped.filter((r) => r.status === 'Finalizada');
  const qtdTotal = scoped.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const qtdUnidades = scoped.reduce((s, r) => s + (r.unit === 'kg' || r.unit === 'litros' ? Number(r.quantity) || 0 : 0), 0);

  const cards = profile === 'tecnico'
    ? [
        ['Solicitações do setor hoje', String(hoje.length), Inbox, '#38bdf8'],
        ['OPs Criadas', String(ops.length), Wrench, '#34d399'],
        ['Pendentes', String(pendentes.length), Clock3, '#fbbf24'],
        ['Urgentes', String(urgentes.length), Siren, '#fb7185'],
        ['Quantidade Solicitada', `${qtdTotal.toLocaleString('pt-BR')}`, Package, '#a78bfa'],
        ['Finalizadas', String(finalizadas.length), CheckCircle2, '#22d3ee'],
      ]
    : [
        ['Solicitações Hoje', String(hoje.length), Inbox, '#38bdf8'],
        ['OPs Criadas', String(ops.length), Wrench, '#34d399'],
        ['Pendentes', String(pendentes.length), Clock3, '#fbbf24'],
        ['Urgentes', String(urgentes.length), Siren, '#fb7185'],
        ['Produção Solicitada', `${qtdTotal.toLocaleString('pt-BR')}`, Package, '#a78bfa'],
        ['Concluídas', String(finalizadas.length), CheckCircle2, '#22d3ee'],
        ['Tempo médio atendimento', '18 min', Timer, '#f472b6'],
      ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {cards.map(([label, value, Icon, color]) => (
        <article key={label} className="glass min-w-0 p-4 transition hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${color}18`, color }}>
              <Icon size={18} />
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400">{label}</p>
          <strong className="mt-1 block truncate text-xl text-white">{value}</strong>
        </article>
      ))}
    </section>
  );
}