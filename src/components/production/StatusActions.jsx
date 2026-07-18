import { useState } from 'react';
import { ArrowRight, Ban, Check, Factory } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const flow = ['Recebida', 'Em Atendimento', 'OP Criada', 'Apontada', 'Concluída'];
const labels = { 'Recebida': 'Iniciar Atendimento', 'Em Atendimento': 'Criar OP', 'OP Criada': 'Apontar Produção', 'Apontada': 'Concluir' };
const next = (s) => { const i = flow.indexOf(s); return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null; };

export default function StatusActions({ item, onUpdate, isDemo }) {
  const [op, setOp] = useState('');
  const [busy, setBusy] = useState(false);
  const [showOp, setShowOp] = useState(false);
  const step = next(item.status);

  const save = async (patch) => {
    setBusy(true);
    try {
      if (isDemo) { onUpdate({ ...item, ...patch }); }
      else { onUpdate(await base44.entities.ProductionRequest.update(item.id, patch)); }
    } finally { setBusy(false); setShowOp(false); }
  };

  const advance = async () => {
    if (item.status === 'Em Atendimento') {
      if (!op) { setShowOp(true); return; }
      return save({ status: 'OP Criada', op_number: op, history: (item.history || []).map((h, i) => i === 1 ? { ...h, completed: true, date: new Date().toISOString() } : h) });
    }
    const ns = step;
    if (!ns) return;
    const idx = flow.indexOf(ns);
    const hist = (item.history || []).map((h, i) => i <= idx ? { ...h, completed: true, date: new Date().toISOString() } : h);
    save({ status: ns, history: hist });
  };

  const retornar = () => save({ status: 'Retornada' });
  const Icon = step === 'OP Criada' ? Factory : step === 'Apontada' ? Check : ArrowRight;

  return (
    <section className="glass mt-5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Atendimento · Supply</p>
          <h2 className="section-title mt-1">Atualizar Status</h2>
        </div>
        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm text-violet-300">{item.status}</span>
      </div>

      {item.status !== 'Concluída' && item.status !== 'Retornada' && (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            {showOp && (
              <input autoFocus value={op} onChange={(e) => setOp(e.target.value)} placeholder="Nº da OP (ex: OP-9001)" className="form-input sm:max-w-xs" />
            )}
            <button disabled={busy} onClick={advance} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-white shadow-[0_0_24px_rgba(124,58,237,.25)] hover:brightness-110 disabled:opacity-60">
              <Icon size={17} />{labels[item.status] || 'Avançar'}
            </button>
            {flow.indexOf(item.status) < 3 && (
              <button disabled={busy} onClick={retornar} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300 hover:text-rose-300">
                <Ban size={15} />Retornar
              </button>
            )}
          </div>
          {showOp && <p className="mt-2 text-xs text-amber-300">Informe o número da OP para continuar.</p>}
        </>
      )}

      {item.status === 'Concluída' && <p className="mt-4 text-sm text-emerald-300">Solicitação concluída ✔</p>}
      {item.status === 'Retornada' && <p className="mt-4 text-sm text-violet-300">Solicitação retornada ao solicitante.</p>}
    </section>
  );
}