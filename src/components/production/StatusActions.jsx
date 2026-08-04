import { useMemo, useState } from 'react';
import { ArrowRight, Ban, Check, ClipboardCheck, FileEdit, Hammer, Layers, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/audit';
import { nextLoteSeq, nextOpSeq, STATUS_LABELS, STATUS_TO_MILESTONE, nextStatus } from '@/lib/areas';
import ApontarProducao from './ApontarProducao';

const icons = {
  'Planejada': Play,
  'Aguardando Emissão da OP': FileEdit,
  'OP Emitida': Hammer,
  'Entregue': ClipboardCheck,
  'Recebida': Check,
};

function markMilestone(history, label, user, detail) {
  return (history || []).map((h) =>
    h.label === label
      ? { ...h, completed: true, date: new Date().toISOString(), user: user?.full_name, detail: detail || h.detail }
      : h
  );
}

export default function StatusActions({ item, user, onUpdate, isDemo }) {
  const multi = (Number(item.op_count) || 1) > 1;
  const [op, setOp] = useState(item.op_number || '');
  const [lote, setLote] = useState(item.lot_number || '');
  const [entries, setEntries] = useState(item.op_entries || []);
  const [busy, setBusy] = useState(false);
  const [showOp, setShowOp] = useState(false);
  const [showApontar, setShowApontar] = useState(false);
  const step = nextStatus(item.status);
  const Icon = step ? icons[item.status] || ArrowRight : null;

  const save = async (patch, action) => {
    setBusy(true);
    try {
      const updated = isDemo
        ? { ...item, ...patch }
        : await base44.entities.ProductionRequest.update(item.id, patch);
      onUpdate(updated);
      if (!isDemo) await logAudit({ user, action, entityId: item.id, requestNumber: item.request_number, details: action });
    } finally { setBusy(false); setShowOp(false); }
  };

  // Gera a sequência de OPs e lotes a partir dos valores iniciais informados
  const generate = (firstOp, firstLote, count) => {
    const list = [];
    let curOp = firstOp;
    let curLote = firstLote;
    for (let i = 0; i < count; i += 1) {
      list.push({ op_number: curOp, lot_number: curLote });
      curOp = nextOpSeq(curOp);
      curLote = nextLoteSeq(curLote);
    }
    return list;
  };

  const preview = useMemo(() => {
    if (!multi || !op || !lote) return [];
    return generate(op, lote, Number(item.op_count) || 1);
  }, [multi, op, lote, item.op_count]);

  const updateEntry = (idx, field, value) =>
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));

  const advance = async () => {
    const ns = step;
    if (!ns) return;

    if (item.status === 'Aguardando Emissão da OP') {
      if (!op || !lote) { setShowOp(true); return; }

      if (multi) {
        const list = preview.length ? preview : generate(op, lote, Number(item.op_count) || 1);
        const history = markMilestone(item.history, 'OP emitida', user, `${list.length} OPs geradas`);
        const resumo = list.map((e) => `OP ${e.op_number} — Lote ${e.lot_number}`).join('\n');
        const emissionDate = new Date().toISOString().slice(0, 10);
        return save({
          status: 'OP Emitida',
          op_number: list[0].op_number,
          lot_number: list[0].lot_number,
          op_entries: list,
          op_emission_date: emissionDate,
          supply_responsible: user?.full_name,
          supply_user_id: user?.id,
          history,
        }, `Cadastro de ${list.length} OPs realizado\n${resumo}`);
      }

      const history = markMilestone(item.history, 'OP emitida', user, `OP: ${op} · Lote: ${lote}`);
      return save({
        status: 'OP Emitida',
        op_number: op,
        lot_number: lote,
        op_emission_date: new Date().toISOString().slice(0, 10),
        supply_responsible: user?.full_name,
        supply_user_id: user?.id,
        history,
      }, `OP emitida: ${op} · Lote: ${lote}`);
    }

    if (item.status === 'Entregue') {
      setShowApontar(true);
      return;
    }

    const milestone = STATUS_TO_MILESTONE[ns];
    const history = milestone ? markMilestone(item.history, milestone, user) : item.history;
    save({ status: ns, history }, `Status alterado para ${ns}`);
  };

  const confirmApontar = async ({ produced_quantity, production_date, production_time }) => {
    setShowApontar(false);
    const history = markMilestone(item.history, 'Produção apontada', user, `${produced_quantity.toLocaleString('pt-BR')} ${item.unit}`);
    save({ status: 'Recebida', produced_quantity, production_date, production_time, history }, `Produção apontada: ${produced_quantity} ${item.unit}`);
  };

  const cancelar = () => save({ status: 'Cancelada', history: (item.history || []).map((h) => ({ ...h, completed: true })) }, 'Solicitação cancelada');

  if (item.status === 'Apontada' || item.status === 'Cancelada') {
    return (
      <section className="glass mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF]">Atendimento · Supply</p>
            <h2 className="section-title mt-1">Status Final</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm ${item.status === 'Apontada' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{item.status}</span>
        </div>
        <p className={`mt-4 text-sm ${item.status === 'Apontada' ? 'text-blue-600' : 'text-rose-600'}`}>{item.status === 'Apontada' ? 'Solicitação concluída ✔' : 'Solicitação cancelada.'}</p>
      </section>
    );
  }

  const needsOpFields = item.status === 'Aguardando Emissão da OP';
  const showOpForm = showOp || (needsOpFields && !item.op_number);

  return (
    <>
      <section className="glass mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF]">Atendimento · Supply</p>
            <h2 className="section-title mt-1">Atualizar Status</h2>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">{item.status}</span>
        </div>

        <div className="mt-5 space-y-3">
          {showOpForm && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="form-label">Número da OP inicial *</span>
                  <input autoFocus value={op} onChange={(e) => setOp(e.target.value)} placeholder="Nº da OP (ex: 4550)" className="form-input" />
                </div>
                <div>
                  <span className="form-label">Número do Lote inicial *</span>
                  <input value={lote} onChange={(e) => setLote(e.target.value)} placeholder="Nº do Lote (ex: 050/26)" className="form-input" />
                </div>
              </div>
              {multi && op && lote && (
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-blue-600" />
                    <h3 className="text-sm font-semibold text-[#1F2937]">Pré-visualização · {item.op_count} OPs geradas automaticamente</h3>
                  </div>
                  <p className="mt-1 text-xs text-[#9CA3AF]">Revise os números antes de salvar. Você pode editar qualquer valor diretamente na tabela.</p>
                  <div className="mt-3 max-h-64 overflow-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[#F7F7F8] text-[#6B7280]">
                        <tr className="border-b border-[#E5E7EB]">
                          <th className="px-2 py-2 font-medium">#</th>
                          <th className="px-2 py-2 font-medium">Número da OP</th>
                          <th className="px-2 py-2 font-medium">Número do Lote</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((e, i) => (
                          <tr key={i} className="border-b border-[#E5E7EB]">
                            <td className="px-2 py-1.5 text-[#9CA3AF]">{i + 1}</td>
                            <td className="px-2 py-1.5 font-mono text-[#1F2937]">{e.op_number}</td>
                            <td className="px-2 py-1.5 font-mono text-[#1F2937]">{e.lot_number}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {multi && item.op_entries?.length > 0 && item.status !== 'Aguardando Emissão da OP' && (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
              <h3 className="text-sm font-semibold text-[#1F2937]">OPs cadastradas · {item.op_entries.length}</h3>
              <div className="mt-3 max-h-64 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#F7F7F8] text-[#6B7280]">
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="px-2 py-2 font-medium">#</th>
                      <th className="px-2 py-2 font-medium">Número da OP</th>
                      <th className="px-2 py-2 font-medium">Número do Lote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.op_entries.map((e, i) => (
                      <tr key={i} className="border-b border-[#E5E7EB]">
                        <td className="px-2 py-1.5 text-[#9CA3AF]">{i + 1}</td>
                        <td className="px-2 py-1.5 font-mono text-[#1F2937]">{e.op_number}</td>
                        <td className="px-2 py-1.5 font-mono text-[#1F2937]">{e.lot_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button disabled={busy} onClick={advance} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 font-medium text-white shadow-sm hover:bg-blue-500 disabled:opacity-60">
              {Icon && <Icon size={17} />}{STATUS_LABELS[item.status] || 'Avançar'}
            </button>
            <button disabled={busy} onClick={cancelar} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280] hover:bg-[#F7F7F8] hover:text-rose-600">
              <Ban size={15} />Cancelar
            </button>
          </div>
        </div>
        {showOp && (!op || !lote) && <p className="mt-2 text-xs text-amber-600">Informe o número da OP e do Lote no ERP Senior para continuar.</p>}
      </section>
      <ApontarProducao open={showApontar} onClose={() => setShowApontar(false)} onConfirm={confirmApontar} unit={item.unit} />
    </>
  );
}