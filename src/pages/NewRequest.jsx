import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SignaturePad from '@/components/production/SignaturePad';
import Sidebar from '@/components/production/Sidebar';
import ProductSelect from '@/components/production/ProductSelect';
import { useRole } from '@/lib/RoleContext';
import { useProducts } from '@/lib/useProducts';
import { logAudit } from '@/lib/audit';
import { ETAPAS, UNIDADE_POR_ETAPA, REASONS, MILESTONES } from '@/lib/areas';
import { useAreas } from '@/lib/useAreas';
import { useUnits } from '@/lib/useUnits';

export default function NewRequest() {
  const nav = useNavigate();
  const { user, name, area, profile } = useRole();
  const { productsByEtapa, byName } = useProducts();
  const { names: areas } = useAreas();
  const { names: unitOptions } = useUnits();
  const [busy, setBusy] = useState(false);
  const [sig, setSig] = useState('');
  const [form, setForm] = useState({
    technician_name: name,
    area: profile === 'tecnico' ? area : '',
    etapa: '',
    product: '',
    product_code: '',
    quantity: '',
    unit: 'kg',
    op_count: 1,
    reason: '',
    priority: 'Normal',
    observations: '',
  });

  const set = (k, v) => setForm({ ...form, [k]: v });

  const onEtapa = (etapa) => setForm({ ...form, etapa, product: '', unit: UNIDADE_POR_ETAPA[etapa] || 'kg' });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const now = new Date();
    const request_number = `SOL-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const item = await base44.entities.ProductionRequest.create({
      ...form,
      quantity: Number(form.quantity),
      op_count: Number(form.op_count) || 1,
      tech_user_id: user?.id,
      request_number,
      status: 'Planejada',
      request_date: now.toISOString().slice(0, 10),
      request_time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      signature: sig,
      history: MILESTONES.map((label, i) => ({
        label,
        completed: i <= 0,
        date: i <= 0 ? now.toISOString() : undefined,
        user: i <= 0 ? name : undefined,
      })),
    });
    await logAudit({ user, action: 'Solicitação criada', entityId: item.id, requestNumber: request_number, details: `${form.product} · ${form.quantity} ${form.unit} · ${form.area} · ${form.etapa} · ${Number(form.op_count) || 1} OP(s)` });
    nav(`/solicitacoes/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937]"><ArrowLeft size={16} />Voltar ao dashboard</Link>
          <div className="glass p-5 md:p-8">
            <p className="text-sm text-blue-600">Nova Solicitação</p>
            <h1 className="mt-1 text-3xl font-semibold text-[#1F2937]">Solicitar Ordem de Produção</h1>
            <div className="mt-3 grid gap-2 text-xs text-[#9CA3AF] sm:grid-cols-3">
              <span>Nº: <b className="text-[#374151]">Automático</b></span>
              <span>Data: <b className="text-[#374151]">{new Date().toLocaleDateString('pt-BR')}</b></span>
              <span>Hora: <b className="text-[#374151]">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</b></span>
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
                    {areas.map((a) => <option key={a}>{a}</option>)}
                  </select>
                )}
              </label>
              <label>
                <span className="form-label">Etapa *</span>
                <select required value={form.etapa} onChange={(e) => onEtapa(e.target.value)} className="form-input">
                  <option value="">Selecione...</option>
                  {ETAPAS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Produto *</span>
                <ProductSelect
                  products={form.etapa ? productsByEtapa[form.etapa] || [] : []}
                  value={form.product}
                  onChange={(p) => setForm({ ...form, product: p, product_code: byName[p]?.code || '' })}
                  disabled={!form.etapa}
                  placeholder={form.etapa ? 'Selecione...' : 'Selecione a etapa primeiro'}
                />
              </label>
              <label>
                <span className="form-label">Código do Produto</span>
                <input readOnly value={form.product_code} placeholder="Preenchido automaticamente" className="form-input opacity-70" />
              </label>
              <label>
                <span className="form-label">Quantidade *</span>
                <input required type="number" min="1" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className="form-input" />
              </label>
              <label>
                <span className="form-label">Unidade de Medida</span>
                <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className="form-input">
                  {unitOptions.map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Quantidade de OPs *</span>
                <input required type="number" min="1" value={form.op_count} onChange={(e) => set('op_count', e.target.value)} className="form-input" />
              </label>
              <label>
                <span className="form-label">Prioridade</span>
                <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="form-input">
                  <option>Normal</option>
                  <option>Urgente</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="form-label">Motivo da Solicitação *</span>
                <select required value={form.reason} onChange={(e) => set('reason', e.target.value)} className="form-input">
                  <option value="">Selecione...</option>
                  {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="form-label">Observações</span>
                <textarea value={form.observations} onChange={(e) => set('observations', e.target.value)} className="form-input min-h-20" />
              </label>
              <div className="md:col-span-2"><SignaturePad onChange={setSig} /></div>
              <button disabled={busy} className="md:col-span-2 flex h-14 items-center justify-center gap-2 rounded-xl bg-blue-600 font-medium text-white shadow-sm hover:bg-blue-500 disabled:opacity-60">
                <Send size={18} />{busy ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}