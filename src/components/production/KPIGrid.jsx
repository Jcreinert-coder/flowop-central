import { CheckCircle2, Clock3, Inbox, Package, Siren, Wrench } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

export default function KPIGrid({ rows, profile, area }) {
  const scoped = profile === 'tecnico' ? rows.filter((r) => r.area === area) : rows;
  const hoje = scoped.filter((r) => (r.request_date || today()) === today());
  const ops = scoped.filter((r) => r.op_number);
  const pendentes = scoped.filter((r) => !['Finalizada', 'Cancelada'].includes(r.status));
  const urgentes = scoped.filter((r) => r.priority === 'Urgente' && !['Finalizada', 'Cancelada'].includes(r.status));
  const qtdTotal = scoped.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const concluidas = scoped.filter((r) => r.status === 'Finalizada');

  const cards = [
    ['Solicitações Hoje', hoje.length, Inbox, '#38bdf8'],
    ['OPs Criadas', ops.length, Wrench, '#34d399'],
    ['Pendentes', pendentes.length, Clock3, '#fbbf24'],
    ['Urgentes', urgentes.length, Siren, '#fb7185'],
    ['Produção Solicitada', qtdTotal.toLocaleString('pt-BR'), Package, '#a78bfa'],
    ['OPs Concluídas', concluidas.length, CheckCircle2, '#22d3ee'],
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(([label, value, Icon, color]) => (
        <article key={label} className="glass flex h-full min-h-[136px] flex-col justify-between p-5 transition hover:-translate-y-1">
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}1a`, color }}>
            <Icon size={19} />
          </span>
          <div className="mt-6">
            <strong className="block text-2xl font-semibold text-white">{value}</strong>
            <p className="mt-1 text-xs text-slate-400">{label}</p>
          </div>
        </article>
      ))}
    </section>
  );
}