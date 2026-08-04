import { useState } from 'react';
import { ClipboardCheck, X } from 'lucide-react';

const nowDate = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default function ApontarProducao({ open, onClose, onConfirm, unit }) {
  const [qty, setQty] = useState('');
  const [date, setDate] = useState(nowDate());
  const [time, setTime] = useState(nowTime());

  if (!open) return null;

  const confirm = () => {
    if (!qty || Number(qty) <= 0) return;
    onConfirm({ produced_quantity: Number(qty), production_date: date, production_time: time });
    setQty('');
    setDate(nowDate());
    setTime(nowTime());
  };

  const close = () => {
    setQty('');
    setDate(nowDate());
    setTime(nowTime());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600"><ClipboardCheck size={20} /></span>
            <div>
              <h2 className="text-lg font-semibold text-[#1F2937]">Registrar Recebimento</h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">Registre a quantidade efetivamente produzida.</p>
            </div>
          </div>
          <button onClick={close} className="text-[#9CA3AF] hover:text-[#1F2937]"><X size={18} /></button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="form-label">Quantidade Produzida *</span>
            <div className="flex gap-2">
              <input required type="number" min="0" step="0.001" value={qty} onChange={(e) => setQty(e.target.value)} className="form-input" placeholder="0" />
              <span className="grid w-20 shrink-0 place-items-center rounded-xl bg-[#F7F7F8] text-sm text-[#6B7280]">{unit || 'kg'}</span>
            </div>
          </label>
          <label className="block">
            <span className="form-label">Data da Produção</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
          </label>
          <label className="block">
            <span className="form-label">Hora da Produção</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="form-input" />
          </label>
          <p className="text-xs text-[#9CA3AF]">Preenchido automaticamente com data e hora atuais. Altere caso seja um apontamento retroativo.</p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={close} className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280] hover:bg-[#F7F7F8]">Cancelar</button>
          <button disabled={!qty || Number(qty) <= 0} onClick={confirm} className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">Confirmar Recebimento</button>
        </div>
      </div>
    </div>
  );
}