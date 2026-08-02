import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';
import QueueTable from '@/components/production/QueueTable';
import DeleteDialog from '@/components/production/DeleteDialog';
import { useRole } from '@/lib/RoleContext';
import { logAudit } from '@/lib/audit';
import { AREAS, STATUS_ALL } from '@/lib/areas';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Requests() {
  const { user, name, profile, area, canDelete } = useRole();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [target, setTarget] = useState(null);
  const [params] = useSearchParams();
  const prefilter = params.get('prefilter');
  const prefilterValue = params.get('value');

  const load = () => {
    base44.entities.ProductionRequest.list('-created_date', 500)
      .then(setRows)
      .catch(() => setRows([]));
  };
  useEffect(load, []);

  const scoped = profile === 'tecnico'
    ? rows.filter((r) => r.area === area)
    : (areaFilter ? rows.filter((r) => r.area === areaFilter) : rows);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return scoped.filter((r) => {
      const matchQ = !t || [r.request_number, r.op_number, r.lot_number, r.product, r.product_code, r.technician_name, r.area, r.status, r.request_date].filter(Boolean).some((v) => String(v).toLowerCase().includes(t));
      const matchS = !status || r.status === status;
      return matchQ && matchS;
    });
  }, [scoped, q, status]);

  const prefilters = useMemo(() => {
    if (!prefilter) return null;
    const today = todayStr();
    switch (prefilter) {
      case 'today': return (r) => (r.request_date || today) === today;
      case 'ops': return (r) => !!r.op_number;
      case 'pendentes': return (r) => !['Finalizada', 'Cancelada'].includes(r.status);
      case 'urgentes': return (r) => r.priority === 'Urgente' && !['Finalizada', 'Cancelada'].includes(r.status);
      case 'concluidas': return (r) => r.status === 'Finalizada';
      case 'etapa': return (r) => r.etapa === prefilterValue;
      case 'area': return (r) => r.area === prefilterValue;
      case 'product': return (r) => r.product === prefilterValue;
      case 'status': return (r) => r.status === prefilterValue;
      default: return null;
    }
  }, [prefilter, prefilterValue]);

  const visible = prefilter ? filtered.filter(prefilters || (() => true)) : filtered;
  const prefilterLabel = prefilter ? (() => {
    const labels = { today: 'Hoje', ops: 'OPs Criadas', pendentes: 'Pendentes', urgentes: 'Urgentes', concluidas: 'Concluídas', etapa: prefilterValue, area: prefilterValue, product: prefilterValue, status: prefilterValue };
    return labels[prefilter] || '';
  })() : '';

  const confirmDelete = async (motivo) => {
    const r = target;
    setTarget(null);
    await base44.entities.ProductionRequest.delete(r.id);
    setRows((prev) => prev.filter((x) => x.id !== r.id));
    const now = new Date();
    await logAudit({
      user, action: 'Solicitação excluída',
      entityId: r.id, requestNumber: r.request_number,
      details: `Solicitação excluída por ${name} em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Motivo: ${motivo}`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937]"><ArrowLeft size={16} />Dashboard</Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-emerald-600">Operação</p>
              <h1 className="text-3xl font-semibold text-[#1F2937]">Solicitações{prefilterLabel ? ` · ${prefilterLabel}` : ''}</h1>
              <p className="mt-1 text-xs text-[#9CA3AF]">{profile === 'tecnico' ? `Apenas área ${area}` : 'Todas as solicitações'} · {visible.length} registros</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-11 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 shadow-sm">
                <Search size={16} className="text-[#9CA3AF]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nº, OP, lote, produto, técnico..." className="w-72 bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9CA3AF]" />
              </label>
              {profile !== 'tecnico' && (
                <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs text-[#1F2937] shadow-sm outline-none">
                  <option value="">Todas as áreas</option>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              )}
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs text-[#1F2937] shadow-sm outline-none">
                <option value="">Todos os status</option>
                {STATUS_ALL.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <QueueTable rows={visible} canDelete={canDelete} onDelete={setTarget} />
        </div>
      </main>
      <DeleteDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={confirmDelete}
        title="Excluir solicitação"
        description={target ? `${target.request_number} · ${target.product}` : ''}
      />
    </div>
  );
}