import { useState } from 'react';
import { ArrowRight, Ban, Check, ClipboardCheck, FileEdit, Hammer, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/audit';
import { STATUS_LABELS, STATUS_TO_MILESTONE, nextStatus } from '@/lib/areas';
import ApontarProducao from './ApontarProducao';

const icons = {
  'Planejada': Play,
  'Aguardando Emissão da OP': FileEdit,
  'OP Emitida': Hammer,
  'Em Produção': ClipboardCheck,
  'Apontada': Check,
};

function markMilestone(history, label, user, detail) {
  return (history || []).map((h) =>
    h.label === label
      ? { ...h, completed: true, date: new Date().toISOString(), user: user?.full_name, detail: detail || h.detail }
      : h
  );
}

export default function StatusActions({ item, user, onUpdate, isDemo }) {
  const [op, setOp] = useState(item.op_number || '');
  const [lote, setLote] = useState(item.lot_number || '');
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

  const advance = async () => {
    const ns = step;
    if (!ns) return;

    if (item.status === 'Aguardando Emissão da OP') {
      if (!op || !lote) { setShowOp(true); return; }
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

    if (item.status === 'Em Produção') {
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
    save({ status: 'Apontada', produced_quantity, production_date, production_time, history }, `Produção apontada: ${produced_quantity} ${item.unit}`);
  };

  const cancelar = () => save({ status: 'Cancelada', history: (item.history || []).map((h) => ({ ...h, completed: true })) }, 'Solicitação cancelada');

  if (item.status === 'Finalizada' || item.status === 'Cancelada') {
    return (
      <section className="glass mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF]">Atendimento · Supply</p>
            <h2 className="section-title mt-1">Status Final</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm ${item.status === 'Finalizada' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{item.status}</span>
        </div>
        <p className={`mt-4 text-sm ${item.status === 'Finalizada' ? 'text-green-600' : 'text-rose-600'}`}>{item.status === 'Finalizada' ? 'Solicitação concluída ✔' : 'Solicitação cancelada.'}</p>
      </section>
    );
  }

  const needsOpFields = item.status === 'Aguardando Emissão da OP';

  return (
    <>
      <section className="glass mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF]">Atendimento · Supply</p>
            <h2 className="section-title mt-1">Atualizar Status</h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">{item.status}</span>
        </div>

        <div className="mt-5 space-y-3">
          {(showOp || (needsOpFields && !item.op_number)) && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="form-label">Número da OP *</span>
                <input autoFocus value={op} onChange={(e) => setOp(e.target.value)} placeholder="Nº da OP (ex: OP-025487)" className="form-input" />
              </div>
              <div>
                <span className="form-label">Número do Lote *</span>
                <input value={lote} onChange={(e) => setLote(e.target.value)} placeholder="Nº do Lote (ex: L-2024-001)" className="form-input" />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button disabled={busy} onClick={advance} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60">
              {Icon && <Icon size={17} />}{STATUS_LABELS[item.status] || 'Avançar'}
            </button>
            <button disabled={busy} onClick={cancelar} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280] hover:bg-[#F7F7F8] hover:text-rose-600">
              <Ban size={15} />Cancelar
            </button>
          </div>
        </div>
        {showOp && <p className="mt-2 text-xs text-amber-600">Informe o número da OP e do Lote no ERP Senior para continuar.</p>}
      </section>
      <ApontarProducao open={showApontar} onClose={() => setShowApontar(false)} onConfirm={confirmApontar} unit={item.unit} />
    </>
  );
}