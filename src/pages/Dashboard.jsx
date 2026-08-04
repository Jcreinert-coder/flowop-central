import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/production/Sidebar';
import Topbar from '@/components/production/Topbar';
import KPIGrid from '@/components/production/KPIGrid';
import ChartsGrid from '@/components/production/ChartsGrid';
import QueueTable from '@/components/production/QueueTable';
import { useRole } from '@/lib/RoleContext';
import { Package, Hash, Clock, Timer } from 'lucide-react';

function avgHours(rows, fromKey, toKey) {
  const diffs = rows
    .filter((r) => r[fromKey] && r[toKey])
    .map((r) => (new Date(r[toKey]) - new Date(r[fromKey])) / 3600000);
  if (!diffs.length) return '—';
  return `${(diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1)}h`;
}

export default function Dashboard() {
  const { profile, area } = useRole();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    base44.entities.ProductionRequest.list('-created_date', 200)
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  const scoped = profile === 'tecnico' ? rows.filter((r) => r.area === area) : rows;
  const recent = [...scoped].slice(0, 6);
  const lotes = scoped.filter((r) => r.lot_number).length;
  const total = scoped.length;
  const produzido = scoped.reduce((s, r) => s + (Number(r.produced_quantity) || 0), 0);

  const opEmitidas = scoped.filter((r) => r.op_number);
  const apontadas = scoped.filter((r) => r.status === 'Recebida' || r.status === 'Apontada');

  const stats = [
    { label: 'Total de Solicitações', value: total, Icon: Package, color: '#3b82f6' },
    { label: 'Lotes Emitidos', value: lotes, Icon: Hash, color: '#0ea5e9' },
    { label: 'OPs Emitidas', value: opEmitidas.length, Icon: Clock, color: '#8b5cf6' },
    { label: 'OPs Apontadas', value: apontadas.length, Icon: Timer, color: '#f59e0b' },
    { label: 'Qtd. Produzida', value: produzido.toLocaleString('pt-BR'), Icon: Package, color: '#2563eb' },
    { label: 'Tempo Médio Sol→OP', value: avgHours(scoped, 'created_date', 'op_emission_date'), Icon: Timer, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1500px] space-y-8 p-4 md:p-8">
          <Topbar />
          <KPIGrid rows={rows} profile={profile} area={area} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${s.color}12`, color: s.color }}>
                  <s.Icon size={17} />
                </span>
                <div className="min-w-0">
                  <strong className="block text-lg font-semibold text-[#1F2937]">{s.value}</strong>
                  <p className="truncate text-[11px] text-[#6B7280]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <ChartsGrid rows={rows} profile={profile} area={area} />
          <QueueTable rows={recent} compact />
        </div>
      </main>
    </div>
  );
}