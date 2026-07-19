import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';

const HEADERS = ['Solicitação', 'Data', 'Hora', 'Área', 'Técnico', 'Produto', 'Código', 'Quantidade', 'Unidade', 'Prioridade', 'Status', 'OP', 'Resp. Supply'];

function toCSV(rows) {
  const lines = [HEADERS.join(';')];
  rows.forEach((r) => {
    lines.push(HEADERS.map((h, i) => {
      const map = [r.request_number, r.request_date, r.request_time, r.area, r.technician_name, r.product, r.product_code, r.quantity, r.unit, r.priority, r.status, r.op_number, r.supply_responsible];
      const v = String(map[i] ?? '');
      return `"${v.replace(/"/g, '""')}"`;
    }).join(';'));
  });
  return '\uFEFF' + lines.join('\n');
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [periodo, setPeriodo] = useState('diario');

  useEffect(() => {
    base44.entities.ProductionRequest.list('-created_date', 500)
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const filtered = rows.filter((r) => {
    const d = r.request_date || today;
    if (periodo === 'diario') return d === today;
    if (periodo === 'semanal') return d >= weekAgo && d <= today;
    if (periodo === 'mensal') return d >= monthAgo && d <= today;
    return true;
  });

  const exportCSV = () => download(`relatorio-csop-${periodo}.csv`, toCSV(filtered), 'text/csv;charset=utf-8;');
  const exportPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16); doc.text('Relatório CSOP - Solicitações de OP', 14, 16);
      doc.setFontSize(10); doc.text(`Período: ${periodo} · Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 24);
      let y = 32;
      doc.text(HEADERS.join(' | '), 14, y); y += 6;
      filtered.slice(0, 40).forEach((r) => {
        doc.text([r.request_number, r.request_date, r.area, r.technician_name, r.product, r.quantity + r.unit, r.priority, r.status, r.op_number].join(' | '), 14, y);
        y += 5;
        if (y > 200) { doc.addPage(); y = 20; }
      });
      doc.save(`relatorio-csop-${periodo}.pdf`);
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16} />Dashboard</Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-violet-300">Exportação</p>
              <h1 className="flex items-center gap-2 text-3xl font-semibold text-white"><FileText size={24} />Relatórios</h1>
              <p className="mt-1 text-xs text-slate-500">{filtered.length} registros no período selecionado</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="glass h-11 bg-[#111b31] px-3 text-xs outline-none">
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
              <button onClick={exportCSV} className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500"><Download size={16} />Excel (CSV)</button>
              <button onClick={exportPDF} className="flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500"><Download size={16} />PDF</button>
            </div>
          </div>
          <section className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-xs">
                <thead className="border-y border-white/5 bg-white/[.02] text-slate-500">
                  <tr>{HEADERS.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 text-slate-300 hover:bg-white/[.025]">
                      <td className="px-4 py-3 font-mono text-white">{r.request_number}</td>
                      <td className="px-4">{r.request_date || '—'}</td>
                      <td className="px-4">{r.request_time || '—'}</td>
                      <td className="px-4">{r.area}</td>
                      <td className="px-4 text-white">{r.technician_name}</td>
                      <td className="px-4">{r.product}</td>
                      <td className="px-4">{r.product_code || '—'}</td>
                      <td className="px-4">{Number(r.quantity).toLocaleString('pt-BR')}</td>
                      <td className="px-4">{r.unit}</td>
                      <td className="px-4">{r.priority}</td>
                      <td className="px-4">{r.status}</td>
                      <td className="px-4 font-mono">{r.op_number || '—'}</td>
                      <td className="px-4">{r.supply_responsible || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="p-8 text-center text-sm text-slate-600">Nenhum registro no período.</p>}
          </section>
        </div>
      </main>
    </div>
  );
}