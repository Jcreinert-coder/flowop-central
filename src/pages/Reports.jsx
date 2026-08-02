import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Download, FileText, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';

const HEADERS = ['Solicitação', 'OP', 'Lote', 'Produto', 'Etapa', 'Área', 'Quantidade', 'Unidade', 'Status', 'Resp. Supply', 'Data Emissão OP'];

function toCSV(rows) {
  const lines = [HEADERS.join(';')];
  rows.forEach((r) => {
    lines.push(HEADERS.map((h, i) => {
      const map = [r.request_number, r.op_number, r.lot_number, r.product, r.etapa, r.area, r.quantity, r.unit, r.status, r.supply_responsible, r.op_emission_date];
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
  const [q, setQ] = useState('');

  useEffect(() => {
    base44.entities.ProductionRequest.list('-created_date', 500)
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const byPeriod = useMemo(() => {
    return rows.filter((r) => {
      const d = r.request_date || today;
      if (periodo === 'diario') return d === today;
      if (periodo === 'semanal') return d >= weekAgo && d <= today;
      if (periodo === 'mensal') return d >= monthAgo && d <= today;
      return true;
    });
  }, [rows, periodo]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return byPeriod;
    return byPeriod.filter((r) =>
      [r.request_number, r.op_number, r.lot_number, r.product, r.product_code]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t))
    );
  }, [byPeriod, q]);

  const exportCSV = () => download(`relatorio-csop-${periodo}.csv`, toCSV(filtered), 'text/csv;charset=utf-8;');
  const exportPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16); doc.text('Relatório CSOP - Solicitações de OP', 14, 16);
      doc.setFontSize(10); doc.text(`Período: ${periodo} · Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 24);
      let y = 32;
      doc.text(HEADERS.join(' | '), 14, y); y += 6;
      filtered.slice(0, 40).forEach((r) => {
        doc.text([r.request_number, r.op_number, r.lot_number, r.product, r.etapa, r.area, r.quantity + r.unit, r.status, r.supply_responsible, r.op_emission_date].join(' | '), 14, y);
        y += 5;
        if (y > 200) { doc.addPage(); y = 20; }
      });
      doc.save(`relatorio-csop-${periodo}.pdf`);
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937]"><ArrowLeft size={16} />Dashboard</Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-blue-600">Exportação</p>
              <h1 className="flex items-center gap-2 text-3xl font-semibold text-[#1F2937]"><FileText size={24} />Relatórios</h1>
              <p className="mt-1 text-xs text-[#9CA3AF]">{filtered.length} registros no período selecionado</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-11 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 shadow-sm">
                <Search size={16} className="text-[#9CA3AF]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar OP, lote, produto, código, solicitação..." className="w-72 bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9CA3AF]" />
              </label>
              <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs text-[#1F2937] shadow-sm outline-none">
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
              <button onClick={exportCSV} className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"><Download size={16} />Excel (CSV)</button>
              <button onClick={exportPDF} className="flex h-11 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#F7F7F8]"><Download size={16} />PDF</button>
            </div>
          </div>
          <section className="glass overflow-hidden">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full min-w-[1100px] text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#F7F7F8] text-[#6B7280] shadow-[0_1px_0_#E5E7EB]">
                  <tr className="border-b border-[#E5E7EB]">{HEADERS.map((h) => <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className={`border-b border-[#E5E7EB] text-[#374151] transition hover:bg-[#F7F7F8] ${i % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}>
                      <td className="px-4 py-3 font-mono text-[#1F2937] whitespace-nowrap">{r.request_number}</td>
                      <td className="px-4 font-mono whitespace-nowrap">{r.op_number || '—'}</td>
                      <td className="px-4 font-mono whitespace-nowrap">{r.lot_number || '—'}</td>
                      <td className="px-4 text-[#1F2937]">{r.product}</td>
                      <td className="px-4 whitespace-nowrap">{r.etapa || '—'}</td>
                      <td className="px-4 whitespace-nowrap">{r.area}</td>
                      <td className="px-4 whitespace-nowrap">{Number(r.quantity).toLocaleString('pt-BR')}</td>
                      <td className="px-4 whitespace-nowrap">{r.unit}</td>
                      <td className="px-4 whitespace-nowrap">{r.status}</td>
                      <td className="px-4 whitespace-nowrap">{r.supply_responsible || '—'}</td>
                      <td className="px-4 whitespace-nowrap">{r.op_emission_date ? new Date(r.op_emission_date + 'T00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="p-8 text-center text-sm text-[#9CA3AF]">Nenhum registro no período.</p>}
          </section>
        </div>
      </main>
    </div>
  );
}