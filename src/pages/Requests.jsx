import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';
import QueueTable, { demo } from '@/components/production/QueueTable';
import { useRole } from '@/lib/RoleContext';

export default function Requests() {
  const { profile, sector } = useRole();
  const [rows, setRows] = useState(demo);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    base44.entities.ProductionRequest.list('-created_date', 500)
      .then((x) => setRows([...x, ...demo]))
      .catch(() => setRows(demo));
  }, []);

  const scoped = profile === 'tecnico' ? rows.filter((r) => r.sector === sector) : rows;

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return scoped.filter((r) => {
      const matchQ = !t || [r.request_number, r.op_number, r.product, r.product_code, r.technician_name, r.sector, r.status, r.request_date].filter(Boolean).some((v) => String(v).toLowerCase().includes(t));
      const matchS = !status || r.status === status;
      return matchQ && matchS;
    });
  }, [scoped, q, status]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16} />Dashboard</Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-violet-300">Operação</p>
              <h1 className="text-3xl font-semibold text-white">Solicitações</h1>
              <p className="mt-1 text-xs text-slate-500">{profile === 'tecnico' ? `Apenas setor ${sector}` : 'Todas as solicitações'} · {filtered.length} registros</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="glass flex h-11 items-center gap-2 px-3">
                <Search size={16} className="text-slate-500" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nº, OP, produto, técnico..." className="w-64 bg-transparent text-sm outline-none placeholder:text-slate-600" />
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass h-11 bg-[#111b31] px-3 text-xs outline-none">
                <option value="">Todos os status</option>
                {['Recebida', 'Em Atendimento', 'OP Criada', 'Em Produção', 'Apontada', 'Finalizada', 'Cancelada'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <QueueTable rows={filtered} />
        </div>
      </main>
    </div>
  );
}