import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowDown, ArrowLeft, ArrowUp, Check, ChevronDown, Download, FileText, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { sortRows } from '@/lib/sort';

const HEADERS = ['Solicitação', 'OP', 'Lote', 'Produto', 'Etapa', 'Área', 'Quantidade', 'Unidade', 'Status', 'Resp. Supply', 'Data Emissão OP'];

const STATUS_OPTIONS = ['Planejada', 'Aguardando Emissão da OP', 'OP Emitida', 'Entregue', 'Recebida', 'Apontada', 'Cancelada'];

const SORT_OPTIONS = [
  { key: 'request_number', label: 'Nº da Solicitação' },
  { key: 'op_number', label: 'Número da OP' },
  { key: 'lot_number', label: 'Número do Lote' },
  { key: 'product', label: 'Produto' },
  { key: 'area', label: 'Área' },
  { key: 'etapa', label: 'Etapa' },
  { key: 'quantity', label: 'Quantidade' },
  { key: 'request_date', label: 'Data' },
  { key: 'status', label: 'Status' },
];

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
  const [statusSel, setStatusSel] = useState([]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');

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
    return byPeriod.filter((r) => {
      const matchQ = !t || [r.request_number, r.op_number, r.lot_number, r.product, r.product_code]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t));
      const matchStatus = statusSel.length === 0 || statusSel.includes(r.status);
      return matchQ && matchStatus;
    });
  }, [byPeriod, q, statusSel]);

  const sorted = useMemo(() => sortKey ? sortRows(filtered, sortKey, sortDir) : filtered, [filtered, sortKey, sortDir]);

  const toggleStatus = (s) =>
    setStatusSel((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const exportCSV = () => download(`relatorio-csop-${periodo}.csv`, toCSV(filtered), 'text/csv;charset=utf-8;');
  const exportPDF = () => {
    import('@/lib/pdfReport').then(({ generatePdfReport }) => {
      generatePdfReport({ rows: filtered, periodo });
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
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className="flex h-11 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#1F2937] shadow-sm outline-none hover:bg-[#F7F7F8]">
                    <Filter size={16} className="text-[#9CA3AF]" />
                    Status
                    {statusSel.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">{statusSel.length}</span>}
                    <ChevronDown size={14} className="text-[#9CA3AF]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-0.5">
                    <button type="button" onClick={() => setStatusSel([])} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition hover:bg-[#F7F7F8] ${statusSel.length === 0 ? 'font-medium text-blue-700' : 'text-[#374151]'}`}>
                      Todos
                      {statusSel.length === 0 && <Check size={14} className="text-blue-600" />}
                    </button>
                    <div className="my-1 h-px bg-[#E5E7EB]" />
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => toggleStatus(s)} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition hover:bg-[#F7F7F8] ${statusSel.includes(s) ? 'font-medium text-blue-700' : 'text-[#374151]'}`}>
                        {s}
                        {statusSel.includes(s) && <Check size={14} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex h-11 items-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="h-11 border-r border-[#E5E7EB] bg-transparent px-3 text-xs text-[#1F2937] outline-none">
                  <option value="">Ordenar por</option>
                  {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
                <button type="button" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} disabled={!sortKey} className="grid h-11 w-10 place-items-center text-[#6B7280] hover:bg-[#F7F7F8] disabled:opacity-40">
                  {sortDir === 'asc' ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
                </button>
              </div>
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
                  {sorted.map((r, i) => (
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