import { useState } from 'react';
import { ArrowRight, Ban, Check, Factory, Play, Hammer, ClipboardCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/audit';

const flow = ['Recebida', 'Em Atendimento', 'OP Criada', 'Em Produção', 'Apontada', 'Finalizada'];
const labels = {
  'Recebida': 'Iniciar Atendimento',
  'Em Atendimento': 'Criar OP',
  'OP Criada': 'Iniciar Produção',
  'Em Produção': 'Apontar Produção',
  'Apontada': 'Finalizar',
};
const icons = { 'Recebida': Play, 'Em Atendimento': Factory, 'OP Criada': Hammer, 'Em Produção': ClipboardCheck, 'Apontada': Check };
const next = (s) => { const i = flow.indexOf(s); return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null; };

export default function StatusActions({ item, user, onUpdate, isDemo }) {
  const [op, setOp] = useState(item.op_number || '');
  const [busy, setBusy] = useState(false);
  const [showOp, setShowOp] = useState(false);
  const step = next(item.status);
  const Icon = step ? icons[item.status] || ArrowRight : null;

  const save = async (patch, action) => {
    setBusy(true);
    try {
      const updated = isDemo
        ? { ...item, ...patch }
        : await base44.entities.ProductionRequest.update(item.id, patch);
      onUpdate(updated);
      if (!isDemo) await logAudit({ user, action, entityId: item.id, requestNumber: item.request_number, details: `${action} · ${patch.status || ''}` });
    } finally { setBusy(false); setShowOp(false); }
  };

  const advance = async () => {
    const ns = step;
    if (!ns) return;
    const now = new Date().toISOString();
    const idx = flow.indexOf(ns);
    const history = (item.history || []).map((h, i) => i <= idx ? { ...h, completed: true, date: h.date || now, user: user?.full_name } : h);

    if (item.status === 'Em Atendimento') {
      if (!op) { setShowOp(true); return; }
      return save({ status: 'OP Criada', op_number: op, supply_responsible: user?.full_name, supply_user_id: user?.id, history }, 'OP criada no ERP Senior');
    }
    save({ status: ns, history }, `Status alterado para ${ns}`);
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
        {item.status === 'Em Atendimento' && !showOp && item.op_number && (
          <input value={op} onChange={(e) => setOp(e.target.value)} placeholder="Nº da OP" className="form-input sm:max-w-xs" />
        )}
        <button disabled={busy} onClick={advance} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-white shadow-[0_0_24px_rgba(124,58,237,.25)] hover:brightness-110 disabled:opacity-60">
          {Icon && <Icon size={17} />}{labels[item.status] || 'Avançar'}
        </button>
        <button disabled={busy} onClick={cancelar} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300 hover:text-rose-300">
          <Ban size={15} />Cancelar
        </button>
      </div>
      {showOp && <p className="mt-2 text-xs text-amber-300">Informe o número da OP criada no ERP Senior para continuar.</p>}
    </section>
  );
}