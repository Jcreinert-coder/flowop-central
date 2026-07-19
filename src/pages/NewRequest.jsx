import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SignaturePad from '@/components/production/SignaturePad';
import Sidebar from '@/components/production/Sidebar';
import { useRole } from '@/lib/RoleContext';
import { logAudit } from '@/lib/audit';
import { AREAS } from '@/lib/areas';

const UNITS = ['kg', 'caixas', 'pacotes', 'unidades', 'litros'];

export default function NewRequest() {
  const nav = useNavigate();
  const { user, name, area, profile } = useRole();
  const [busy, setBusy] = useState(false);
  const [sig, setSig] = useState('');
  const [form, setForm] = useState({
    technician_name: name,
    area: profile === 'tecnico' ? area : '',
    product: '',
    product_code: '',
    quantity: '',
    unit: 'kg',
    reason: '',
    priority: 'Normal',
    observations: '',
  });

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const now = new Date();
    const request_number = `SOL-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const item = await base44.entities.ProductionRequest.create({
      ...form,
      quantity: Number(form.quantity),
      tech_user_id: user?.id,
      request_number,
      status: 'Recebida',
      request_date: now.toISOString().slice(0, 10),
      request_time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      signature: sig,
      history: [
        { label: 'Solicitação criada', date: now.toISOString(), completed: true, user: name },
        { label: 'Recebida pelo Supply', completed: false },
        { label: 'OP criada', completed: false },
        { label: 'Em Produção', completed: false },
        { label: 'Apontada', completed: false },
        { label: 'Finalizada', completed: false },
      ],
    });
    await logAudit({ user, action: 'Solicitação criada', entityId: item.id, requestNumber: request_number, details: `${form.product} · ${form.quantity} ${form.unit} · ${form.area}` });
    nav(`/solicitacoes/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16} />Voltar ao dashboard</Link>
          <div className="glass p-5 md:p-8">
            <p className="text-sm text-violet-300">Nova Solicitação</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Solicitar Ordem de Produção</h1>
            <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
              <span>Nº: <b className="text-slate-300">Automático</b></span>
              <span>Data: <b className="text-slate-300">{new Date().toLocaleDateString('pt-BR')}</b></span>
              <span>Hora: <b className="text-slate-300">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</b></span>
            </div>

            <form onSubmit={submit} className="mt-8 grid gap-5 md:grid-cols-2">
              <label>
                <span className="form-label">Nome do Técnico</span>
                <input required value={form.technician_name} onChange={(e) => set('technician_name', e.target.value)} className="form-input" />
              </label>
              <label>
                <span className="form-label">Área de Produção</span>
                {profile === 'tecnico' ? (
                  <input readOnly value={form.area} className="form-input opacity-70" />
                ) : (
                  <select required value={form.area} onChange={(e) => set('area', e.target.value)} className="form-input">
                    <option value="">Selecione...</option>
                    {AREAS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                )}
              </label>
              <label>
                <span className="form-label">Produto</span>
                <input required value={form.product} onChange={(e) => set('product', e.target.value)} className="form-input" />
              </label>
              <label>
                <span className="form-label">Código do Produto (opcional)</span>
                <input value={form.product_code} onChange={(e) => set('product_code', e.target.value)} className="form-input" />
              </label>
              <label>
                <span className="form-label">Quantidade</span>
                <input required type="number" min="1" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className="form-input" />
              </label>
              <label>
                <span className="form-label">Unidade de Medida</span>
                <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className="form-input">
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Prioridade</span>
                <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="form-input">
                  <option>Normal</option>
                  <option>Urgente</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="form-label">Motivo da Solicitação</span>
                <textarea required value={form.reason} onChange={(e) => set('reason', e.target.value)} className="form-input min-h-24" />
              </label>
              <label className="md:col-span-2">
                <span className="form-label">Observações</span>
                <textarea value={form.observations} onChange={(e) => set('observations', e.target.value)} className="form-input min-h-20" />
              </label>
              <div className="md:col-span-2"><SignaturePad onChange={setSig} /></div>
              <button disabled={busy} className="md:col-span-2 flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-white hover:brightness-110 disabled:opacity-60">
                <Send size={18} />{busy ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}