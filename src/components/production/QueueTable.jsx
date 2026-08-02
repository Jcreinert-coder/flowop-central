import { ArrowUpRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { statusColor } from '@/lib/areas';

const prioColors = { 'Urgente': 'bg-rose-100 text-rose-700', 'Normal': 'bg-slate-100 text-slate-600' };

const COLUMNS = ['Solicitação', 'Data', 'Hora', 'Área', 'Etapa', 'Técnico', 'Produto', 'Qtd.', 'Un.', 'Prioridade', 'Status', 'OP', 'Lote', 'Resp. Supply'];

export default function QueueTable({ rows = [], compact = false, onDelete, canDelete = false }) {
  const cols = compact ? ['Status', 'Solicitante', 'Área', 'Produto', 'Quantidade', 'Prioridade', 'Hora', 'Solicitação', 'OP', 'Lote', ''] : COLUMNS;

  return (
    <section id="fila" className="glass overflow-hidden">
      {!compact && (
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="section-title mb-1">Fila de Atendimento</h2>
            <p className="text-xs text-[#9CA3AF]">Acompanhamento em tempo real</p>
          </div>
          <Link to="/solicitacoes" className="text-xs text-emerald-600 hover:underline">Ver todas</Link>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-xs">
          <thead className="bg-[#F7F7F8] text-[#6B7280]">
            <tr className="border-b border-[#E5E7EB]">{cols.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}{!compact && <th></th>}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={`border-b border-[#E5E7EB] text-[#374151] transition hover:bg-[#F7F7F8] ${i % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}>
                {compact ? (
                  <>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 ${statusColor(r.status)}`}>{r.status}</span></td>
                    <td className="px-4 text-[#1F2937]">{r.technician_name}</td>
                    <td className="px-4">{r.area}</td>
                    <td className="px-4">{r.product}</td>
                    <td className="px-4">{Number(r.quantity).toLocaleString('pt-BR')} {r.unit}</td>
                    <td className="px-4"><span className={`rounded-full px-2 py-0.5 ${prioColors[r.priority]}`}>{r.priority}</span></td>
                    <td className="px-4">{r.request_time}</td>
                    <td className="px-4 font-mono">{r.request_number}</td>
                    <td className="px-4 font-mono">{r.op_number || '—'}</td>
                    <td className="px-4 font-mono">{r.lot_number || '—'}</td>
                    <td className="px-4"><Link aria-label="Ver detalhes" to={`/solicitacoes/${r.id}`} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] hover:bg-emerald-50"><ArrowUpRight size={15} /></Link></td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-mono text-[#1F2937]">{r.request_number}</td>
                    <td className="px-4">{r.request_date ? new Date(r.request_date + 'T00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4">{r.request_time}</td>
                    <td className="px-4">{r.area}</td>
                    <td className="px-4">{r.etapa || '—'}</td>
                    <td className="px-4 text-[#1F2937]">{r.technician_name}</td>
                    <td className="px-4">{r.product}{r.product_code ? <span className="ml-1 text-[#9CA3AF]">#{r.product_code}</span> : ''}</td>
                    <td className="px-4">{Number(r.quantity).toLocaleString('pt-BR')}</td>
                    <td className="px-4">{r.unit}</td>
                    <td className="px-4"><span className={`rounded-full px-2 py-0.5 ${prioColors[r.priority]}`}>{r.priority}</span></td>
                    <td className="px-4"><span className={`rounded-full px-2.5 py-1 ${statusColor(r.status)}`}>{r.status}</span></td>
                    <td className="px-4 font-mono">{r.op_number || '—'}</td>
                    <td className="px-4 font-mono">{r.lot_number || '—'}</td>
                    <td className="px-4">{r.supply_responsible || '—'}</td>
                    <td className="px-4">
                      <div className="flex items-center gap-1">
                        <Link aria-label="Ver detalhes" to={`/solicitacoes/${r.id}`} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] hover:bg-emerald-50"><ArrowUpRight size={15} /></Link>
                        {canDelete && onDelete && (
                          <button aria-label="Excluir solicitação" onClick={() => onDelete(r)} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] text-[#6B7280] hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
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
      {rows.length === 0 && <p className="p-8 text-center text-sm text-[#9CA3AF]">Nenhuma solicitação encontrada.</p>}
    </section>
  );
}