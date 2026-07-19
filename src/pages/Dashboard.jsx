import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/production/Sidebar';
import Topbar from '@/components/production/Topbar';
import KPIGrid from '@/components/production/KPIGrid';
import ChartsGrid from '@/components/production/ChartsGrid';
import QueueTable from '@/components/production/QueueTable';
import { useRole } from '@/lib/RoleContext';

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

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1500px] space-y-8 p-4 md:p-8">
          <Topbar />
          <KPIGrid rows={rows} profile={profile} area={area} />
          <ChartsGrid rows={rows} profile={profile} area={area} />
          <QueueTable rows={recent} compact />
        </div>
      </main>
    </div>
  );
}