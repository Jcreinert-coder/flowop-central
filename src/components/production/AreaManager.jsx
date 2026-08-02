import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useRole } from '@/lib/RoleContext';
import { logAudit } from '@/lib/audit';

export default function AreaManager() {
  const { user } = useRole();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    base44.entities.ProductionArea.list('-created_date', 200)
      .then(setAreas)
      .catch(() => setAreas([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setBusy(true); setError('');
    try {
      const item = await base44.entities.ProductionArea.create({ name: draft.trim(), active: true });
      await logAudit({ user, action: 'Área cadastrada', entityId: item.id, details: draft.trim() });
      setDraft(''); load();
    } finally { setBusy(false); }
  };

  const saveEdit = async () => {
    if (!editing.name.trim()) return;
    setBusy(true); setError('');
    try {
      await base44.entities.ProductionArea.update(editing.id, { name: editing.name.trim(), active: editing.active });
      await logAudit({ user, action: 'Área atualizada', entityId: editing.id, details: editing.name.trim() });
      setEditing(null); load();
    } finally { setBusy(false); }
  };

  const toggleActive = async (a) => {
    await base44.entities.ProductionArea.update(a.id, { active: !a.active });
    load();
  };

  const remove = async (a) => {
    setError('');
    try {
      const reqs = await base44.entities.ProductionRequest.list('-created_date', 500);
      const users = await base44.entities.User.list('-created_date', 200);
      if (reqs.some((r) => r.area === a.name) || users.some((u) => u.area === a.name)) {
        setError(`"${a.name}" está em uso e não pode ser excluída.`);
        return;
      }
      await base44.entities.ProductionArea.delete(a.id);
      await logAudit({ user, action: 'Área excluída', entityId: a.id, details: a.name });
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="glass p-5">
      <h2 className="flex items-center gap-2 section-title"><Plus size={16} />Áreas de Produção</h2>
      <p className="mt-1 text-xs text-[#9CA3AF]">Gerencie as áreas disponíveis nas solicitações</p>
      {error && <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-xs text-rose-600">{error}</p>}
      <form onSubmit={add} className="mt-4 flex gap-2">
        <input required placeholder="Nova área de produção" value={draft} onChange={(e) => setDraft(e.target.value)} className="form-input" />
        <button disabled={busy} className="flex h-[46px] shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"><Plus size={17} />Adicionar</button>
      </form>
      <div className="mt-4 max-h-[280px] overflow-auto rounded-xl border border-[#E5E7EB]">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#F7F7F8] text-[#6B7280] shadow-[0_1px_0_#E5E7EB]">
            <tr className="border-b border-[#E5E7EB]">
              <th className="px-4 py-3 font-medium" style={{ width: '50%' }}>Área</th>
              <th className="px-4 py-3 font-medium" style={{ width: '25%' }}>Status</th>
              <th className="px-4 py-3 font-medium text-right" style={{ width: '25%' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={3} className="px-4 py-6 text-center text-[#9CA3AF]">Carregando...</td></tr>}
            {!loading && areas.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-[#9CA3AF]">Nenhuma área cadastrada.</td></tr>}
            {areas.map((a, i) => (
              <tr key={a.id} className={`border-b border-[#E5E7EB] text-[#374151] transition hover:bg-[#F7F7F8] ${i % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}>
                {editing?.id === a.id ? (
                  <>
                    <td className="px-4 py-2"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="form-input" /></td>
                    <td className="px-4 py-2"><button onClick={() => setEditing({ ...editing, active: !editing.active })} className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs leading-none ${editing.active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{editing.active ? 'Ativo' : 'Inativo'}</button></td>
                    <td className="px-4 py-2"><div className="flex items-center justify-end gap-1"><button disabled={busy} onClick={saveEdit} className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Check size={15} /></button><button onClick={() => setEditing(null)} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] text-[#6B7280] hover:bg-[#F0F0F1]"><X size={15} /></button></div></td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-[#1F2937] whitespace-nowrap">{a.name}</td>
                    <td className="px-4 py-3"><button onClick={() => toggleActive(a)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs leading-none ${a.active !== false ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{a.active !== false ? 'Ativo' : 'Inativo'}</button></td>
                    <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button onClick={() => setEditing({ id: a.id, name: a.name, active: a.active !== false })} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] text-[#6B7280] hover:bg-blue-50 hover:text-blue-600"><Pencil size={15} /></button><button onClick={() => remove(a)} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] text-[#6B7280] hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></div></td>
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