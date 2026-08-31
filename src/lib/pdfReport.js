import { jsPDF } from 'jspdf';

const BLUE = [37, 99, 235];
const DARK = [31, 41, 55];
const GRAY = [107, 114, 128];
const LIGHT = [229, 231, 235];
const SOFT = [247, 247, 248];

const PERIODO_LABEL = { diario: 'Diário', semanal: 'Semanal', mensal: 'Mensal', custom: 'Personalizado' };

const STATUS_STYLE = {
  'Planejada': { fill: [241, 245, 249], text: [71, 85, 105] },
  'Aguardando Emissão da OP': { fill: [254, 249, 195], text: [133, 77, 14] },
  'OP Emitida': { fill: [219, 234, 254], text: [29, 78, 216] },
  'Entregue': { fill: [232, 233, 255], text: [67, 56, 202] },
  'Recebida': { fill: [207, 250, 254], text: [8, 145, 178] },
  'Apontada': { fill: [219, 234, 254], text: [29, 78, 216] },
  'Cancelada': { fill: [254, 226, 226], text: [159, 18, 57] },
};

const COLS = [
  { key: 'request_number', label: 'Solicitação', w: 30, align: 'C' },
  { key: 'op_number', label: 'OP', w: 18, align: 'C' },
  { key: 'lot_number', label: 'Lote', w: 18, align: 'C' },
  { key: 'product', label: 'Produto', w: 50, align: 'L' },
  { key: 'etapa', label: 'Etapa', w: 24, align: 'L' },
  { key: 'area', label: 'Área', w: 20, align: 'L' },
  { key: 'quantity', label: 'Qtd.', w: 16, align: 'C' },
  { key: 'unit', label: 'Unidade', w: 14, align: 'C' },
  { key: 'status', label: 'Status', w: 26, align: 'C' },
  { key: 'supply_responsible', label: 'Resp. Supply', w: 30, align: 'L' },
  { key: 'op_emission_date', label: 'Data Emissão', w: 23, align: 'C' },
];

const PAGE_W = 297;
const PAGE_H = 210;
const MARGIN_X = 14;
const MARGIN_TOP = 15;
const FOOTER_Y = 198;
const CONTENT_BOTTOM = 192;
const USABLE_W = PAGE_W - MARGIN_X * 2;

const alignX = (cx, c) => (c.align === 'C' ? cx + c.w / 2 : c.align === 'R' ? cx + c.w - 2 : cx + 2);
const align = (c) => (c.align === 'C' ? 'center' : c.align === 'R' ? 'right' : 'left');

function fitText(doc, text, maxWidth, minSize = 7, maxSize = 10) {
  let size = maxSize;
  doc.setFontSize(size);
  let lines = doc.splitTextToSize(text, maxWidth);
  while (lines.length > 1 && size > minSize) {
    size -= 0.5;
    doc.setFontSize(size);
    lines = doc.splitTextToSize(text, maxWidth);
  }
  let line = lines[0];
  if (doc.getTextWidth(line) > maxWidth) {
    while (line.length && doc.getTextWidth(line + '…') > maxWidth) line = line.slice(0, -1);
    line += '…';
  }
  return { size, line };
}

function drawReportHeader(doc) {
  let y = MARGIN_TOP;
  const x = MARGIN_X;
  doc.setFillColor(...BLUE);
  doc.roundedRect(x, y, 7, 7, 1.2, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('F', x + 3.5, y + 5.1, { align: 'center' });

  doc.setTextColor(...BLUE);
  doc.setFontSize(15);
  doc.text('FLOWOP', x + 10, y + 3.4);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Controle de Operações e Produção', x + 10, y + 7.6);

  const rx = PAGE_W - MARGIN_X;
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Relatório CSOP', rx, y + 3.4, { align: 'right' });
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Solicitações de OP', rx, y + 7.6, { align: 'right' });

  y += 11;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.6);
  doc.line(x, y, PAGE_W - MARGIN_X, y);
  return y + 5;
}

function drawSummary(doc, y, stats) {
  const x = MARGIN_X;
  const gap = 3;
  const cardW = (USABLE_W - gap * (stats.length - 1)) / stats.length;
  const cardH = 14;
  stats.forEach((s, i) => {
    const cx = x + i * (cardW + gap);
    doc.setDrawColor(...LIGHT);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, 'S');
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(s.label.toUpperCase(), cx + 3, y + 4.5);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    const fit = fitText(doc, String(s.value), cardW - 6, 7, 10.5);
    doc.setFontSize(fit.size);
    doc.text(fit.line, cx + 3, y + 10.8);
  });
  return y + cardH + 4;
}

function drawTableHeader(doc, y) {
  const x = MARGIN_X;
  doc.setFillColor(...SOFT);
  doc.rect(x, y, USABLE_W, 8, 'F');
  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.3);
  doc.line(x, y + 8, x + USABLE_W, y + 8);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  let cx = x;
  COLS.forEach((c) => {
    doc.text(c.label, alignX(cx, c), y + 5.3, { align: align(c) });
    cx += c.w;
  });
  return y + 8;
}

function drawStatusChip(doc, cx, y, w, rowH, status) {
  const style = STATUS_STYLE[status] || { fill: SOFT, text: GRAY };
  const maxChipW = w - 3;
  let fs = 6.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fs);
  let tw = doc.getTextWidth(status);
  while (tw > maxChipW - 3 && fs > 4.5) {
    fs -= 0.3;
    doc.setFontSize(fs);
    tw = doc.getTextWidth(status);
  }
  const chipW = Math.min(maxChipW, tw + 3);
  const chipH = 4.6;
  const chipX = cx + (w - chipW) / 2;
  const chipY = y + (rowH - chipH) / 2;
  doc.setFillColor(...style.fill);
  doc.setDrawColor(...style.text);
  doc.setLineWidth(0.2);
  doc.roundedRect(chipX, chipY, chipW, chipH, 1, 1, 'FD');
  doc.setTextColor(...style.text);
  doc.text(status, chipX + chipW / 2, chipY + 3.2, { align: 'center' });
}

function drawRow(doc, y, r) {
  const x = MARGIN_X;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const productLines = doc.splitTextToSize(r.product || '—', COLS[3].w - 4);
  const lineH = 3.6;
  const rowH = Math.max(8, productLines.length * lineH + 4);

  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.2);
  doc.line(x, y + rowH, x + USABLE_W, y + rowH);

  let cx = x;
  COLS.forEach((c) => {
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    if (c.key === 'product') {
      doc.text(productLines, cx + 2, y + 4.6, { lineHeightFactor: 1.15 });
    } else if (c.key === 'status') {
      drawStatusChip(doc, cx, y, c.w, rowH, r.status || '—');
    } else {
      let val = r[c.key];
      if (c.key === 'quantity') val = Number(val || 0).toLocaleString('pt-BR');
      if (c.key === 'op_emission_date') val = val ? new Date(val + 'T00:00').toLocaleDateString('pt-BR') : '—';
      val = val === undefined || val === null || val === '' ? '—' : String(val);
      doc.text(val, alignX(cx, c), y + rowH / 2 + 1.2, { align: align(c) });
    }
    cx += c.w;
  });
  return y + rowH;
}

function drawFooter(doc, pageNum, totalPages) {
  const y = FOOTER_Y;
  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, y - 3, PAGE_W - MARGIN_X, y - 3);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('FlowOP - Controle de Operações e Produção', MARGIN_X, y);
  doc.text(`Página ${pageNum} de ${totalPages}`, PAGE_W - MARGIN_X, y, { align: 'right' });
}

export function generatePdfReport({ rows, periodo }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const total = rows.length;
  const opsEmitidas = rows.filter((r) => r.op_number).length;
  const produtos = new Set(rows.map((r) => r.product).filter(Boolean)).size;
  const qtdTotal = rows.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const responsaveis = [...new Set(rows.map((r) => r.supply_responsible).filter(Boolean))];
  const stats = [
    { label: 'Total de solicitações', value: total },
    { label: 'OPs emitidas', value: opsEmitidas },
    { label: 'Produtos', value: produtos },
    { label: 'Quantidade total', value: qtdTotal.toLocaleString('pt-BR') },
    { label: 'Responsável Supply', value: responsaveis.length ? responsaveis.join(', ') : '—' },
  ];

  const periodoLabel = PERIODO_LABEL[periodo] || periodo;
  const now = new Date();
  const gerado = `${now.toLocaleDateString('pt-BR')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let y = drawReportHeader(doc);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Período: ${periodoLabel}`, MARGIN_X, y);
  doc.text(`Gerado em: ${gerado}`, PAGE_W - MARGIN_X, y, { align: 'right' });
  y += 5;

  y = drawSummary(doc, y, stats);
  y = drawTableHeader(doc, y);

  if (rows.length === 0) {
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Nenhuma solicitação no período selecionado.', MARGIN_X + USABLE_W / 2, y + 10, { align: 'center' });
  }

  rows.forEach((r) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const productLines = doc.splitTextToSize(r.product || '—', COLS[3].w - 4);
    const rowH = Math.max(8, productLines.length * 3.6 + 4);
    if (y + rowH > CONTENT_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
      y = drawTableHeader(doc, y);
    }
    y = drawRow(doc, y, r);
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  doc.save(`relatorio-csop-${periodo}.pdf`);
}