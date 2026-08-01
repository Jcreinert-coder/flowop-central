import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useRole } from '@/lib/RoleContext';
import { logAudit } from '@/lib/audit';
import { ETAPAS } from '@/lib/areas';

export default function ProductManager() {
  const { user, name } = useRole();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ name: '', code: '', etapa: '' });
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.Product.list('-created_date', 500)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.etapa) return;
    setBusy(true);
    try {
      const item = await base44.entities.Product.create({ name: draft.name.trim(), code: draft.code.trim(), etapa: draft.etapa, active: true });
      setProducts((prev) => [item, ...prev]);
      await logAudit({ user, action: 'Produto cadastrado', entityId: item.id, details: `${draft.name} · ${draft.etapa}` });
      setDraft({ name: '', code: '', etapa: '' });
    } finally { setBusy(false); }
  };

  const startEdit = (p) => setEditing({ id: p.id, name: p.name, code: p.code || '', etapa: p.etapa, active: p.active !== false });

  const saveEdit = async () => {
    if (!editing.name.trim() || !editing.etapa) return;
    setBusy(true);
    try {
      await base44.entities.Product.update(editing.id, { name: editing.name.trim(), code: editing.code.trim(), etapa: editing.etapa, active: editing.active });
      setProducts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...editing } : p));
      await logAudit({ user, action: 'Produto atualizado', entityId: editing.id, details: `${editing.name} · ${editing.etapa}` });
      setEditing(null);
    } finally { setBusy(false); }
  };

  const toggleActive = async (p) => {
    const next = !p.active;
    await base44.entities.Product.update(p.id, { active: next });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, active: next } : x));
  };

  const remove = async (p) => {
    await base44.entities.Product.delete(p.id);
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    await logAudit({ user, action: 'Produto excluído', entityId: p.id, details: `${p.name} · ${p.etapa}` });
  };

  const inputCls = 'form-input';

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 section-title"><Plus size={16} />Cadastro de Produtos</h2>
          <p className="mt-1 text-xs text-slate-500">Produtos disponíveis nas solicitações, organizados por etapa</p>
        </div>
      </div>

      <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input required placeholder="Nome do produto *" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
        <input placeholder="Código (opcional)" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} className={inputCls} />
        <select required value={draft.etapa} onChange={(e) => setDraft({ ...draft, etapa: e.target.value })} className={inputCls}>
          <option value="">Etapa *</option>
          {ETAPAS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button disabled={busy} className="flex h-[46px] items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"><Plus size={17} />Adicionar</button>
      </form>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="border-y border-white/5 bg-white/[.02] text-slate-500">
            <tr>{['Produto', 'Código', 'Etapa', 'Ativo', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-600">Carregando...</td></tr>}
            {!loading && products.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-600">Nenhum produto cadastrado.</td></tr>}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 text-slate-300">
                {editing?.id === p.id ? (
                  <>
                    <td className="px-4 py-2"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></td>
                    <td className="px-4 py-2"><input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} className={inputCls} /></td>
                    <td className="px-4 py-2">
                      <select value={editing.etapa} onChange={(e) => setEditing({ ...editing, etapa: e.target.value })} className={inputCls}>
                        {ETAPAS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => setEditing({ ...editing, active: !editing.active })} className={`rounded-full px-3 py-1 text-xs ${editing.active ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-400/10 text-slate-400'}`}>{editing.active ? 'Ativo' : 'Inativo'}</button>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button disabled={busy} onClick={saveEdit} className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"><Check size={15} /></button>
                        <button onClick={() => setEditing(null)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10"><X size={15} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-white">{p.name}</td>
                    <td className="px-4 font-mono text-slate-500">{p.code || '—'}</td>
                    <td className="px-4">{p.etapa}</td>
                    <td className="px-4">
                      <button onClick={() => toggleActive(p)} className={`rounded-full px-3 py-1 text-xs ${p.active !== false ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-400/10 text-slate-500'}`}>{p.active !== false ? 'Ativo' : 'Inativo'}</button>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(p)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400 hover:bg-violet-500/20"><Pencil size={15} /></button>
                        <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}