import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, KeyRound, Pencil, PlusCircle, Trash2, UserCheck, UserX, UsersRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';
import DeleteDialog from '@/components/production/DeleteDialog';
import { useRole } from '@/lib/RoleContext';
import { logAudit } from '@/lib/audit';
import { PROFILES, profileLabel, roleForInvite } from '@/lib/areas';
import { useAreas } from '@/lib/useAreas';

const blank = { full_name: '', email: '', cargo: '', area: '', profile: 'tecnico', status: 'Ativo' };

export default function Users() {
  const { user, isAdmin } = useRole();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const { names: areas } = useAreas();

  const load = () => {
    setLoading(true);
    base44.entities.User.list('-created_date', 200)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
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
              <p className="mt-2 text-sm text-[#6B7280]">Apenas usuários Supply e Líderes podem administrar usuários.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const save = async (data) => {
    setBusy(true);
    try {
      if (editing.id) {
        await base44.entities.User.update(editing.id, {
          full_name: data.full_name, cargo: data.cargo, area: data.area, profile: data.profile, status: data.status,
        });
        await logAudit({ user, action: 'Usuário atualizado', entityId: editing.id, affectedUser: data.full_name, details: `Perfil: ${profileLabel(data.profile)} · Área: ${data.area} · Status: ${data.status}` });
      } else {
        await base44.users.inviteUser(data.email, roleForInvite(data.profile));
        const fresh = await base44.entities.User.list('-created_date', 200);
        const created = fresh.find((u) => u.email === data.email);
        if (created) {
          await base44.entities.User.update(created.id, { full_name: data.full_name, cargo: data.cargo, area: data.area, profile: data.profile, status: data.status });
        }
        await logAudit({ user, action: 'Usuário criado', affectedUser: data.full_name, details: `${data.email} · ${profileLabel(data.profile)} · ${data.area}` });
      }
      setEditing(null);
      load();
    } finally { setBusy(false); }
  };

  const toggleStatus = async (u) => {
    const ns = u.status === 'Ativo' ? 'Inativo' : 'Ativo';
    await base44.entities.User.update(u.id, { status: ns });
    await logAudit({ user, action: ns === 'Inativo' ? 'Usuário desativado' : 'Usuário ativado', affectedUser: u.full_name, details: `${u.email} · ${ns}` });
    load();
  };

  const reenviar = async (u) => {
    await base44.users.inviteUser(u.email, roleForInvite(u.profile));
    await logAudit({ user, action: 'Convite reenviado (redefinição de senha)', affectedUser: u.full_name, details: u.email });
  };

  const confirmDelete = async (motivo) => {
    const u = del;
    setDel(null);
    await base44.entities.User.delete(u.id);
    setRows((prev) => prev.filter((x) => x.id !== u.id));
    await logAudit({ user, action: 'Usuário excluído', affectedUser: u.full_name, details: `${u.email} · Motivo: ${motivo}` });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937]"><ArrowLeft size={16} />Dashboard</Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-blue-600">Administração</p>
              <h1 className="flex items-center gap-2 text-3xl font-semibold text-[#1F2937]"><UsersRound size={24} />Usuários</h1>
              <p className="mt-1 text-xs text-[#9CA3AF]">{rows.length} usuários cadastrados</p>
            </div>
            <button onClick={() => setEditing({ ...blank })} className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"><PlusCircle size={17} />Novo Usuário</button>
          </div>

          <section className="glass overflow-hidden">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full min-w-[960px] text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#F7F7F8] text-[#6B7280] shadow-[0_1px_0_#E5E7EB]">
                  <tr className="border-b border-[#E5E7EB]">{['Nome', 'Usuário (e-mail)', 'Cargo', 'Área', 'Perfil', 'Status', 'Último acesso', 'Ações'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((u, i) => (
                    <tr key={u.id} className={`border-b border-[#E5E7EB] text-[#374151] transition hover:bg-[#F7F7F8] ${i % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}>
                      <td className="px-4 py-3 text-[#1F2937] whitespace-nowrap">{u.full_name || '—'}</td>
                      <td className="px-4 whitespace-nowrap">{u.email}</td>
                      <td className="px-4 whitespace-nowrap">{u.cargo || '—'}</td>
                      <td className="px-4 whitespace-nowrap">{u.area || '—'}</td>
                      <td className="px-4 whitespace-nowrap">{profileLabel(u.profile)}</td>
                      <td className="px-4 whitespace-nowrap"><span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 leading-none ${u.status === 'Ativo' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{u.status || 'Ativo'}</span></td>
                      <td className="px-4 whitespace-nowrap">{u.updated_date ? new Date(u.updated_date).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditing(u)} title="Editar" className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] hover:bg-blue-50 hover:text-blue-600"><Pencil size={14} /></button>
                          <button onClick={() => reenviar(u)} title="Redefinir senha (reenviar convite)" className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] hover:bg-sky-50 hover:text-sky-600"><KeyRound size={14} /></button>
                          <button onClick={() => toggleStatus(u)} title={u.status === 'Ativo' ? 'Desativar' : 'Ativar'} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] hover:bg-amber-50 hover:text-amber-600">{u.status === 'Ativo' ? <UserX size={14} /> : <UserCheck size={14} />}</button>
                          <button onClick={() => setDel(u)} title="Excluir" className="grid h-8 w-8 place-items-center rounded-lg bg-[#F7F7F8] text-[#6B7280] hover:bg-rose-50 hover:text-rose-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loading && <p className="p-6 text-center text-sm text-[#9CA3AF]">Carregando usuários...</p>}
            {!loading && rows.length === 0 && <p className="p-8 text-center text-sm text-[#9CA3AF]">Nenhum usuário cadastrado.</p>}
          </section>
        </div>
      </main>

      {editing && <UserForm initial={editing} busy={busy} areas={areas} onClose={() => setEditing(null)} onSave={save} />}
      <DeleteDialog open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete} title="Excluir usuário" description={del ? `${del.full_name} · ${del.email}` : ''} />
    </div>
  );
}

function UserForm({ initial, busy, areas, onClose, onSave }) {
  const [f, setF] = useState({ full_name: initial.full_name || '', email: initial.email || '', cargo: initial.cargo || '', area: initial.area || '', profile: initial.profile || 'tecnico', status: initial.status || 'Ativo' });
  const isNew = !initial.id;
  const set = (k, v) => setF({ ...f, [k]: v, ...(k === 'profile' && v !== 'tecnico' ? { area: '' } : {}) });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1F2937]">{isNew ? 'Novo Usuário' : 'Editar Usuário'}</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1F2937]"><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="form-label">Nome completo *</span>
            <input required value={f.full_name} onChange={(e) => set('full_name', e.target.value)} className="form-input" />
          </label>
          <label className="sm:col-span-2">
            <span className="form-label">E-mail (login) *</span>
            <input required type="email" readOnly={!isNew} value={f.email} onChange={(e) => set('email', e.target.value)} className={`form-input ${!isNew ? 'opacity-70' : ''}`} />
          </label>
          <label>
            <span className="form-label">Cargo</span>
            <input value={f.cargo} onChange={(e) => set('cargo', e.target.value)} className="form-input" />
          </label>
          <label>
            <span className="form-label">Área de Produção</span>
            {f.profile === 'tecnico' ? (
              <select required value={f.area} onChange={(e) => set('area', e.target.value)} className="form-input">
                <option value="">Selecione...</option>
                {areas.map((a) => <option key={a}>{a}</option>)}
              </select>
            ) : (
              <input readOnly value="Não aplicável ao perfil" className="form-input opacity-50" />
            )}
          </label>
          <label>
            <span className="form-label">Perfil de acesso</span>
            <select value={f.profile} onChange={(e) => set('profile', e.target.value)} className="form-input">
              {PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select value={f.status} onChange={(e) => set('status', e.target.value)} className="form-input">
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </label>
          {isNew && <p className="sm:col-span-2 text-xs text-[#9CA3AF]">O sistema enviará um convite por e-mail para o usuário definir sua senha de acesso.</p>}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280] hover:bg-[#F7F7F8]">Cancelar</button>
            <button disabled={busy} className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60">{busy ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}