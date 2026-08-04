import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, CalendarDays, Plus, Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';
import ProductSelect from '@/components/production/ProductSelect';
import { useRole } from '@/lib/RoleContext';
import { useProducts } from '@/lib/useProducts';
import { logAudit } from '@/lib/audit';
import { ETAPAS, UNIDADE_POR_ETAPA, REASONS, STATUS_COLORS } from '@/lib/areas';
import { useAreas } from '@/lib/useAreas';
import { useUnits } from '@/lib/useUnits';

const monthLabel = () => new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

export default function Planejamento() {
  const { user, name, isAdmin } = useRole();
  const { productsByEtapa } = useProducts();
  const { names: areas } = useAreas();
  const { names: unitOptions } = useUnits();
  const [items, setItems] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ area: '', etapa: '', product: '', quantity: '', unit: 'kg', reason: 'Alinhamento Semanal', priority: 'Normal' });

  const set = (k, v) => setDraft({ ...draft, [k]: v });

  const onEtapa = (etapa) => setDraft({ ...draft, etapa, product: '', unit: UNIDADE_POR_ETAPA[etapa] || 'kg' });

  const load = () => {
    base44.entities.ProductionRequest.filter({ status: 'Planejada' }, '-created_date', 200)
      .then(setPlanned)
      .catch(() => setPlanned([]));
  };
  useEffect(load, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
        <Sidebar />
        <main className="lg:ml-64">
          <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937]"><ArrowLeft size={16} />Dashboard</Link>
            <div className="glass p-10 text-center">
              <h1 className="text-xl font-semibold text-[#1F2937]">Acesso restrito</h1>
              <p className="mt-2 text-sm text-[#6B7280]">Apenas usuários Supply e Líderes podem realizar o planejamento mensal.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const canAdd = draft.area && draft.etapa && draft.product && draft.quantity;

  const add = (e) => {
    e.preventDefault();
    if (!canAdd) return;
    setItems([...items, { ...draft, quantity: Number(draft.quantity), id: Date.now() }]);
    setDraft({ area: '', etapa: '', product: '', quantity: '', unit: 'kg', reason: 'Alinhamento Semanal', priority: 'Normal' });
  };

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  const saveAll = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      const now = new Date();
      const request_date = now.toISOString().slice(0, 10);
      const request_time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const prefix = `SOL-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const created = await base44.entities.ProductionRequest.bulkCreate(
        items.map((it, i) => ({
          ...it,
          request_number: `${prefix}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes() + i).padStart(2, '0')}`,
          technician_name: name,
          tech_user_id: user?.id,
          status: 'Planejada',
          request_date,
          request_time,
          op_count: it.op_count || 1,
          history: [
            { label: 'Solicitação criada', date: now.toISOString(), completed: true, user: name },
            { label: 'Planejada', date: now.toISOString(), completed: true, user: name },
            { label: 'OP emitida', completed: false },
            { label: 'Entregue', completed: false },
            { label: 'Produção apontada', completed: false },
            { label: 'Apontada', completed: false },
          ],
        }))
      );
      await logAudit({ user, action: 'Planejamento mensal realizado', details: `${created.length} solicitações planejadas para ${monthLabel()}` });
      setItems([]);
      load();
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937]"><ArrowLeft size={16} />Dashboard</Link>
          <div>
            <p className="text-sm text-blue-600">Planejamento</p>
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-[#1F2937]"><CalendarDays size={24} />Planejamento Mensal</h1>
            <p className="mt-1 text-xs text-[#9CA3AF]">Cadastre as solicitações previstas para {monthLabel()} · status inicial: Planejada</p>
          </div>

          <form onSubmit={add} className="glass p-5">
            <h2 className="section-title">Adicionar item ao planejamento</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className="form-label">Área de Produção *</span>
                <select required value={draft.area} onChange={(e) => set('area', e.target.value)} className="form-input">
                  <option value="">Selecione...</option>
                  {areas.map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Etapa *</span>
                <select required value={draft.etapa} onChange={(e) => onEtapa(e.target.value)} className="form-input">
                  <option value="">Selecione...</option>
                  {ETAPAS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Produto *</span>
                <ProductSelect
                  products={draft.etapa ? productsByEtapa[draft.etapa] || [] : []}
                  value={draft.product}
                  onChange={(p) => set('product', p)}
                  disabled={!draft.etapa}
                  placeholder={draft.etapa ? 'Selecione...' : 'Selecione a etapa primeiro'}
                />
              </label>
              <label>
                <span className="form-label">Quantidade *</span>
                <input required type="number" min="1" value={draft.quantity} onChange={(e) => set('quantity', e.target.value)} className="form-input" />
              </label>
              <label>
                <span className="form-label">Unidade</span>
                <select value={draft.unit} onChange={(e) => set('unit', e.target.value)} className="form-input">
                  {unitOptions.map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Motivo</span>
                <select value={draft.reason} onChange={(e) => set('reason', e.target.value)} className="form-input">
                  {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Prioridade</span>
                <select value={draft.priority} onChange={(e) => set('priority', e.target.value)} className="form-input">
                  <option>Normal</option>
                  <option>Urgente</option>
                </select>
              </label>
              <div className="flex items-end">
                <button type="submit" disabled={!canAdd} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F7F7F8] text-sm text-[#1F2937] hover:bg-[#F0F0F1] disabled:opacity-40"><Plus size={17} />Adicionar</button>
              </div>
            </div>
          </form>

          {items.length > 0 && (
            <section className="glass overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div>
                  <h2 className="section-title">Itens do planejamento</h2>
                  <p className="text-xs text-[#9CA3AF]">{items.length} solicitação(ões) prontas para salvar</p>
                </div>
                <button disabled={busy} onClick={saveAll} className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"><Save size={17} />{busy ? 'Salvando...' : 'Salvar Planejamento'}</button>
              </div>
              <div className="max-h-[500px] overflow-auto">
                <table className="w-full min-w-[800px] text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-[#F7F7F8] text-[#6B7280] shadow-[0_1px_0_#E5E7EB]">
                    <tr className="border-b border-[#E5E7EB]">{['Área', 'Etapa', 'Produto', 'Qtd.', 'Un.', 'Motivo', 'Prioridade', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={it.id} className={`border-b border-[#E5E7EB] text-[#374151] ${i % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}>
                        <td className="px-4 py-3">{it.area}</td>
                        <td className="px-4">{it.etapa}</td>
                        <td className="px-4 text-[#1F2937]">{it.product}</td>
                        <td className="px-4">{Number(it.quantity).toLocaleString('pt-BR')}</td>
                        <td className="px-4">{it.unit}</td>
                        <td className="px-4">{it.reason}</td>
                        <td className="px-4">{it.priority}</td>
                        <td className="px-4"><button onClick={() => remove(it.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] text-[#6B7280] hover:bg-rose-50 hover:text-rose-600"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="glass overflow-hidden">
            <div className="p-5">
              <h2 className="section-title">Solicitações planejadas · {monthLabel()}</h2>
              <p className="text-xs text-[#9CA3AF]">{planned.length} no aguardo de emissão de OP</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead className="bg-[#F7F7F8] text-[#6B7280]">
                  <tr className="border-b border-[#E5E7EB]">{['Solicitação', 'Data', 'Área', 'Etapa', 'Produto', 'Qtd.', 'Prioridade', 'Status', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {planned.map((r, i) => (
                    <tr key={r.id} className={`border-b border-[#E5E7EB] text-[#374151] transition hover:bg-[#F7F7F8] ${i % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}>
                      <td className="px-4 py-3 font-mono text-[#1F2937]">{r.request_number}</td>
                      <td className="px-4">{r.request_date ? new Date(r.request_date + 'T00:00').toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-4">{r.area}</td>
                      <td className="px-4">{r.etapa || '—'}</td>
                      <td className="px-4 text-[#1F2937]">{r.product}</td>
                      <td className="px-4">{Number(r.quantity).toLocaleString('pt-BR')} {r.unit}</td>
                      <td className="px-4">{r.priority}</td>
                      <td className="px-4"><span className={`rounded-full px-2.5 py-1 ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span></td>
                      <td className="px-4"><Link to={`/solicitacoes/${r.id}`} className="text-blue-600 hover:underline">Abrir</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {planned.length === 0 && <p className="p-8 text-center text-sm text-[#9CA3AF]">Nenhuma solicitação planejada ainda.</p>}
          </section>
        </div>
      </main>
    </div>
  );
}