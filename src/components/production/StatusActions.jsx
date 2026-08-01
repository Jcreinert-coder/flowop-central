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
      if (!op) { setShowOp(true); return; }
      const history = markMilestone(item.history, 'OP emitida', user);
      return save({ status: 'OP Emitida', op_number: op, supply_responsible: user?.full_name, supply_user_id: user?.id, history }, `OP emitida: ${op}`);
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
            <p className="text-xs text-slate-500">Atendimento · Supply</p>
            <h2 className="section-title mt-1">Status Final</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm ${item.status === 'Finalizada' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{item.status}</span>
        </div>
        <p className={`mt-4 text-sm ${item.status === 'Finalizada' ? 'text-emerald-300' : 'text-rose-300'}`}>{item.status === 'Finalizada' ? 'Solicitação concluída ✔' : 'Solicitação cancelada.'}</p>
      </section>
    );
  }

  return (
    <>
      <section className="glass mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Atendimento · Supply</p>
            <h2 className="section-title mt-1">Atualizar Status</h2>
          </div>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm text-violet-300">{item.status}</span>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {showOp && (
            <input autoFocus value={op} onChange={(e) => setOp(e.target.value)} placeholder="Nº da OP (ex: OP-025487)" className="form-input sm:max-w-xs" />
          )}
          {item.status === 'Aguardando Emissão da OP' && !showOp && item.op_number && (
            <input value={op} onChange={(e) => setOp(e.target.value)} placeholder="Nº da OP" className="form-input sm:max-w-xs" />
          )}
          <button disabled={busy} onClick={advance} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-white shadow-[0_0_24px_rgba(124,58,237,.25)] hover:brightness-110 disabled:opacity-60">
            {Icon && <Icon size={17} />}{STATUS_LABELS[item.status] || 'Avançar'}
          </button>
          <button disabled={busy} onClick={cancelar} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300 hover:text-rose-300">
            <Ban size={15} />Cancelar
          </button>
        </div>
        {showOp && <p className="mt-2 text-xs text-amber-300">Informe o número da OP emitida no ERP Senior para continuar.</p>}
      </section>
      <ApontarProducao open={showApontar} onClose={() => setShowApontar(false)} onConfirm={confirmApontar} unit={item.unit} />
    </>
  );
}