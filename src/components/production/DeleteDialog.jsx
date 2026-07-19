import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteDialog({ open, onClose, onConfirm, title, description }) {
  const [motivo, setMotivo] = useState('');
  if (!open) return null;

  const confirm = () => {
    if (!motivo.trim()) return;
    onConfirm(motivo.trim());
    setMotivo('');
  };
  const close = () => { setMotivo(''); onClose(); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-300"><AlertTriangle size={20} /></span>
            <div>
              <h2 className="text-lg font-semibold text-white">{title || 'Excluir'}</h2>
              <p className="mt-1 text-xs text-slate-400">{description || 'Esta ação não pode ser desfeita.'}</p>
            </div>
          </div>
          <button onClick={close} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <label className="mt-5 block">
          <span className="form-label">Motivo da exclusão *</span>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} className="form-input min-h-24" placeholder="Informe o motivo da exclusão..." />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={close} className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300 hover:text-white">Cancelar</button>
          <button disabled={!motivo.trim()} onClick={confirm} className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50">Excluir</button>
        </div>
      </div>
    </div>
  );
}