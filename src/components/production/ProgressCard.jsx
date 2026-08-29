import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Clock, ListChecks, X } from 'lucide-react';
import { statusColor } from '@/lib/areas';

const PERIODOS = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
  { value: 'custom', label: 'Personalizado' },
];

const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function periodRange(periodo, custom) {
  const now = new Date();
  if (periodo === 'hoje') return { from: fmt(now), to: fmt(now) };
  if (periodo === 'semana') {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: fmt(monday), to: fmt(sunday) };
  }
  if (periodo === 'mes') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: fmt(first), to: fmt(last) };
  }
  return { from: custom.from || '', to: custom.to || '' };
}

function dataConclusao(r) {
  const entry = (r.history || []).find((h) => h.label === 'Apontada' && h.completed && h.date);
  if (entry?.date) return new Date(entry.date).toLocaleDateString('pt-BR');
  if (r.status === 'Apontada' && r.production_date) return new Date(r.production_date + 'T00:00').toLocaleDateString('pt-BR');
  return '—';
}

export default function ProgressCard({ rows, profile, area }) {
  const [periodo, setPeriodo] = useState('semana');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [open, setOpen] = useState(false);

  const scoped = useMemo(() => (profile === 'tecnico' ? rows.filter((r) => r.area === area) : rows), [rows, profile, area]);

  const noPeriodo = useMemo(() => {
    const { from, to } = periodRange(periodo, custom);
    if (periodo === 'custom' && (!from || !to)) return [];
    return scoped.filter((r) => {
      const d = r.request_date || '';
      return d >= from && d <= to;
    }).filter((r) => r.status !== 'Cancelada');
  }, [scoped, periodo, custom]);

  const total = noPeriodo.length;
  const concluidas = noPeriodo.filter((r) => r.status === 'Apontada').length;
  const pendentes = total - concluidas;
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <>
      <section
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <ListChecks size={20} />
            </span>
            <div>
              <p className="text-[11px] text-[#6B7280]">Acompanhamento de atendimentos</p>
              <h3 className="text-sm font-semibold text-[#1F2937]">Solicitações concluídas</h3>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F7F7F8] p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriodo(p.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${periodo === p.value ? 'bg-white text-blue-700 shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {periodo === 'custom' && (
          <div onClick={(e) => e.stopPropagation()} className="mt-4 flex flex-wrap items-center gap-2">
            <Calendar size={14} className="text-[#9CA3AF]" />
            <input type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs text-[#1F2937] outline-none" />
            <span className="text-xs text-[#9CA3AF]">até</span>
            <input type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs text-[#1F2937] outline-none" />
          </div>
        )}

        <div className="mt-5 flex items-end gap-3">
          <strong className="text-3xl font-semibold text-[#1F2937]">{concluidas}</strong>
          <span className="pb-1 text-lg text-[#9CA3AF]">/ {total}</span>
          <span className="ml-auto pb-1 text-sm font-medium text-blue-600">{pct}% concluído</span>
        </div>

        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#F0F0F2]">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{concluidas} Concluídas</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />{pendentes} Pendentes</span>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="flex max-h-[85vh] w-full max-w-5xl flex-col rounded-xl border border-[#E5E7EB] bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#1F2937]">Solicitações do período</h2>
                <p className="text-xs text-[#9CA3AF]">{concluidas} concluídas · {pendentes} pendentes · {total} total</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#9CA3AF] hover:text-[#1F2937]"><X size={18} /></button>
            </div>
            <div className="overflow-auto">
              <table className="w-full min-w-[860px] text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#F7F7F8] text-[#6B7280] shadow-[0_1px_0_#E5E7EB]">
                  <tr className="border-b border-[#E5E7EB]">
                    {['Solicitação', 'Produto', 'Qtd.', 'Área', 'Solicitante', 'Data solic.', 'Status', 'Conclusão', 'Responsável'].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {noPeriodo.map((r, i) => (
                    <tr key={r.id} className={`border-b border-[#E5E7EB] text-[#374151] transition hover:bg-[#F7F7F8] ${i % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}>
                      <td className="px-4 py-3 font-mono text-[#1F2937] whitespace-nowrap">{r.request_number}</td>
                      <td className="px-4 py-3 text-[#1F2937]">{r.product || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{Number(r.quantity || 0).toLocaleString('pt-BR')} {r.unit}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.area || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.technician_name || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.request_date ? new Date(r.request_date + 'T00:00').toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 leading-none ${statusColor(r.status)}`}>{r.status}</span></td>
                      <td className="px-4 py-3 whitespace-nowrap">{dataConclusao(r)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.supply_responsible || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {noPeriodo.length === 0 && <p className="p-8 text-center text-sm text-[#9CA3AF]">Nenhuma solicitação no período selecionado.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}