import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';

export default function Audit() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    base44.entities.AuditLog.list('-created_date', 300)
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937]"><ArrowLeft size={16} />Dashboard</Link>
          <div>
            <p className="text-sm text-blue-600">Governança</p>
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-[#1F2937]"><ScrollText size={24} />Auditoria</h1>
            <p className="mt-1 text-xs text-[#9CA3AF]">Registro permanente de todas as ações · {rows.length} eventos</p>
          </div>
          <section className="glass overflow-hidden">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full min-w-[960px] text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#F7F7F8] text-[#6B7280] shadow-[0_1px_0_#E5E7EB]">
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Data</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Hora</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Usuário</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Ação</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Solicitação</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Afetado</th>
                    <th className="px-4 py-3 font-medium">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const d = new Date(r.created_date);
                    return (
                      <tr key={r.id} className={`border-b border-[#E5E7EB] text-[#374151] transition hover:bg-[#F7F7F8] ${i % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap">{d.toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 whitespace-nowrap">{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-4 text-[#1F2937] whitespace-nowrap">{r.user_name}</td>
                        <td className="px-4 whitespace-nowrap">{r.action}</td>
                        <td className="px-4 font-mono whitespace-nowrap">{r.request_number || '—'}</td>
                        <td className="px-4 whitespace-nowrap">{r.affected_user || '—'}</td>
                        <td className="px-4 text-[#6B7280]">{r.details || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && <p className="p-8 text-center text-sm text-[#9CA3AF]">Nenhum evento de auditoria registrado ainda.</p>}
          </section>
        </div>
      </main>
    </div>
  );
}