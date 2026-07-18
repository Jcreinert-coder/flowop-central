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
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16} />Dashboard</Link>
          <div>
            <p className="text-sm text-violet-300">Governança</p>
            <h1 className="flex items-center gap-2 text-3xl font-semibold text-white"><ScrollText size={24} />Auditoria</h1>
            <p className="mt-1 text-xs text-slate-500">Registro permanente de todas as ações · {rows.length} eventos</p>
          </div>
          <section className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="border-y border-white/5 bg-white/[.02] text-slate-500">
                  <tr>{['Data', 'Hora', 'Usuário', 'Ação', 'Solicitação', 'Detalhes'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const d = new Date(r.created_date);
                    return (
                      <tr key={r.id} className="border-b border-white/5 text-slate-300 hover:bg-white/[.025]">
                        <td className="px-4 py-3">{d.toLocaleDateString('pt-BR')}</td>
                        <td className="px-4">{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-4 text-white">{r.user_name}</td>
                        <td className="px-4">{r.action}</td>
                        <td className="px-4 font-mono">{r.request_number || '—'}</td>
                        <td className="px-4 text-slate-400">{r.details || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-600">Nenhum evento de auditoria registrado ainda.</p>}
          </section>
        </div>
      </main>
    </div>
  );
}