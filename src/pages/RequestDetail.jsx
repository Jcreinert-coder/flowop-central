import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Check, Clock3, FileText, Send, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';
import StatusActions from '@/components/production/StatusActions';
import DeleteDialog from '@/components/production/DeleteDialog';
import { useRole } from '@/lib/RoleContext';
import { logAudit } from '@/lib/audit';

const timeline = ['Solicitação criada', 'Recebida pelo Supply', 'OP criada', 'Em Produção', 'Apontada', 'Finalizada'];

export default function RequestDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, name, profile, canManage, canDelete } = useRole();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => {
    base44.entities.ProductionRequest.get(id)
      .then((x) => setItem(x))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#0F172A] text-violet-300">Carregando solicitação...</div>;
  if (!item) return <div className="grid min-h-screen place-items-center bg-[#0F172A] text-white">Solicitação não encontrada.</div>;

  const details = [
    ['Número da Solicitação', item.request_number],
    ['Número da OP', item.op_number || 'Aguardando'],
    ['Data', item.request_date ? new Date(item.request_date + 'T00:00').toLocaleDateString('pt-BR') : '—'],
    ['Hora', item.request_time || '—'],
    ['Técnico Solicitante', item.technician_name],
    ['Área de Produção', item.area],
    ['Produto', item.product],
    ['Código do Produto', item.product_code || '—'],
    ['Quantidade', `${Number(item.quantity).toLocaleString('pt-BR')} ${item.unit}`],
    ['Prioridade', item.priority],
    ['Status', item.status],
    ['Responsável Supply', item.supply_responsible || '—'],
  ];
  const done = item.history?.filter((x) => x.completed).length || 0;

  const addNote = async () => {
    if (!note.trim()) return;
    const stamp = `${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ${name}: ${note.trim()}`;
    const updated = await base44.entities.ProductionRequest.update(item.id, { supply_notes: item.supply_notes ? `${item.supply_notes}\n${stamp}` : stamp });
    setItem(updated);
    await logAudit({ user, action: 'Observação adicionada', entityId: item.id, requestNumber: item.request_number, details: note.trim() });
    setNote('');
  };

  const confirmDelete = async (motivo) => {
    setDelOpen(false);
    await base44.entities.ProductionRequest.delete(item.id);
    const now = new Date();
    await logAudit({
      user, action: 'Solicitação excluída',
      entityId: item.id, requestNumber: item.request_number,
      details: `Solicitação excluída por ${name} em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Motivo: ${motivo}`,
    });
    nav('/solicitacoes');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
          <div className="flex items-center justify-between">
            <Link to="/solicitacoes" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16} />Voltar às solicitações</Link>
            {canDelete && (
              <button onClick={() => setDelOpen(true)} className="flex h-10 items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm text-rose-300 hover:bg-rose-500/20"><Trash2 size={16} />Excluir</button>
            )}
          </div>
          <div className="glass p-6 md:p-8">
            <div className="flex justify-between border-b border-white/10 pb-6">
              <div>
                <p className="text-sm text-violet-300">Detalhes da Solicitação</p>
                <h1 className="text-3xl font-semibold text-white">{item.request_number}</h1>
              </div>
              <span className="h-fit rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">{item.status}</span>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {details.map(([l, v]) => (
                <div key={l} className="rounded-xl bg-white/[.035] p-4">
                  <small className="text-slate-500">{l}</small>
                  <p className="mt-1 text-sm font-medium text-white">{v}</p>
                </div>
              ))}
            </div>

            {item.reason && (
              <div className="mt-4 rounded-xl bg-white/[.035] p-4">
                <small className="text-slate-500">Motivo da Solicitação</small>
                <p className="mt-1 text-sm text-white">{item.reason}</p>
              </div>
            )}
            {item.observations && (
              <div className="mt-4 rounded-xl bg-white/[.035] p-4">
                <small className="text-slate-500">Observações do Técnico</small>
                <p className="mt-1 text-sm text-white">{item.observations}</p>
              </div>
            )}

            {canManage ? (
              <StatusActions item={item} user={user} onUpdate={setItem} />
            ) : (
              <section className="glass mt-5 p-5">
                <p className="text-sm text-slate-400">Você está acompanhando esta solicitação. Alterações de status são realizadas pelo Supply.</p>
              </section>
            )}

            {canManage && (
              <section className="glass mt-5 p-5">
                <h2 className="section-title">Observações do Supply</h2>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Adicionar observação para o técnico..." className="form-input mt-3 min-h-20" />
                <button onClick={addNote} className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-violet-600/80 px-4 text-sm text-white hover:bg-violet-600"><Send size={15} />Adicionar observação</button>
                {item.supply_notes && (
                  <div className="mt-4 whitespace-pre-line rounded-xl bg-white/[.035] p-4 text-sm text-slate-300">{item.supply_notes}</div>
                )}
              </section>
            )}

            {!canManage && item.supply_notes && (
              <section className="glass mt-5 p-5">
                <h2 className="section-title">Observações do Supply</h2>
                <div className="mt-3 whitespace-pre-line rounded-xl bg-white/[.035] p-4 text-sm text-slate-300">{item.supply_notes}</div>
              </section>
            )}

            <h2 className="section-title mt-8">Histórico completo</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-6">
              {timeline.map((t, i) => (
                <div key={t}>
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${i < done ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-600'}`}>
                    {i < done ? <Check size={16} /> : <Clock3 size={15} />}
                  </span>
                  <p className="mt-3 text-xs">{t}</p>
                  <small className="text-[10px] text-slate-600">{i < done ? 'Concluído' : 'Pendente'}</small>
                </div>
              ))}
            </div>

            {item.history?.some((h) => h.user && h.date) && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[.02] p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><FileText size={15} />Linha do tempo</h3>
                <ol className="space-y-3">
                  {item.history.filter((h) => h.date).map((h, i) => (
                    <li key={i} className="flex gap-3 text-xs">
                      <span className="text-slate-600">{new Date(h.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-slate-300">{h.label}{h.user ? ` · ${h.user}` : ''}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="section-title">Assinatura Digital do Técnico</h2>
              {item.signature ? <img src={item.signature} alt="Assinatura digital" className="mt-3 h-28 rounded-xl bg-white p-3" /> : <p className="mt-3 text-sm italic text-slate-600">Assinatura registrada eletronicamente</p>}
            </div>
          </div>
        </div>
      </main>
      <DeleteDialog
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir solicitação"
        description={`${item.request_number} · ${item.product}`}
      />
    </div>
  );
}