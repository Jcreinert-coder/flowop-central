import { ArrowUpRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const colors = {
  'Recebida': 'bg-amber-400/10 text-amber-300',
  'Em Atendimento': 'bg-sky-400/10 text-sky-300',
  'OP Criada': 'bg-emerald-400/10 text-emerald-300',
  'Em Produção': 'bg-indigo-400/10 text-indigo-300',
  'Apontada': 'bg-cyan-400/10 text-cyan-300',
  'Finalizada': 'bg-green-400/10 text-green-300',
  'Cancelada': 'bg-rose-400/10 text-rose-300',
};
const prioColors = { 'Urgente': 'bg-rose-500/15 text-rose-300', 'Normal': 'bg-slate-500/15 text-slate-300' };

const COLUMNS = ['Solicitação', 'Data', 'Hora', 'Área', 'Técnico', 'Produto', 'Qtd.', 'Un.', 'Prioridade', 'Status', 'OP', 'Resp. Supply'];

export default function QueueTable({ rows = [], compact = false, onDelete, canDelete = false }) {
  const cols = compact ? ['Status', 'Solicitante', 'Área', 'Produto', 'Quantidade', 'Prioridade', 'Hora', 'Solicitação', 'OP', ''] : COLUMNS;

  return (
    <section id="fila" className="glass overflow-hidden">
      {!compact && (
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="section-title mb-1">Fila de Atendimento</h2>
            <p className="text-xs text-slate-500">Acompanhamento em tempo real</p>
          </div>
          <Link to="/solicitacoes" className="text-xs text-violet-300">Ver todas</Link>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="border-y border-white/5 bg-white/[.02] text-slate-500">
            <tr>{cols.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}{!compact && <th></th>}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-white/5 text-slate-300 transition hover:bg-white/[.025]">
                {compact ? (
                  <>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 ${colors[r.status] || colors.Recebida}`}>{r.status}</span></td>
                    <td className="px-4 text-white">{r.technician_name}</td>
                    <td className="px-4">{r.area}</td>
                    <td className="px-4">{r.product}</td>
                    <td className="px-4">{Number(r.quantity).toLocaleString('pt-BR')} {r.unit}</td>
                    <td className="px-4"><span className={`rounded-full px-2 py-0.5 ${prioColors[r.priority]}`}>{r.priority}</span></td>
                    <td className="px-4">{r.request_time}</td>
                    <td className="px-4 font-mono">{r.request_number}</td>
                    <td className="px-4 font-mono">{r.op_number || '—'}</td>
                    <td className="px-4"><Link aria-label="Ver detalhes" to={`/solicitacoes/${r.id}`} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-violet-500/20"><ArrowUpRight size={15} /></Link></td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-mono text-white">{r.request_number}</td>
                    <td className="px-4">{r.request_date ? new Date(r.request_date + 'T00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4">{r.request_time}</td>
                    <td className="px-4">{r.area}</td>
                    <td className="px-4 text-white">{r.technician_name}</td>
                    <td className="px-4">{r.product}{r.product_code ? <span className="ml-1 text-slate-600">#{r.product_code}</span> : ''}</td>
                    <td className="px-4">{Number(r.quantity).toLocaleString('pt-BR')}</td>
                    <td className="px-4">{r.unit}</td>
                    <td className="px-4"><span className={`rounded-full px-2 py-0.5 ${prioColors[r.priority]}`}>{r.priority}</span></td>
                    <td className="px-4"><span className={`rounded-full px-2.5 py-1 ${colors[r.status] || colors.Recebida}`}>{r.status}</span></td>
                    <td className="px-4 font-mono">{r.op_number || '—'}</td>
                    <td className="px-4">{r.supply_responsible || '—'}</td>
                    <td className="px-4">
                      <div className="flex items-center gap-1">
                        <Link aria-label="Ver detalhes" to={`/solicitacoes/${r.id}`} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-violet-500/20"><ArrowUpRight size={15} /></Link>
                        {canDelete && onDelete && (
                          <button aria-label="Excluir solicitação" onClick={() => onDelete(r)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-600">Nenhuma solicitação encontrada.</p>}
    </section>
  );
}