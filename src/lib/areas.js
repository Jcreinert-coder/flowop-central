export const AREAS = ['Pasta', 'Pó', 'Sachê', 'Líquido', 'Mistura Fina', 'Envase Especiais'];

export const ETAPAS = ['Mistura Fina', 'Semiacabado', 'Produto Acabado'];

export const PRODUTOS_POR_ETAPA = {
  'Mistura Fina': ['Mistura A', 'Mistura B', 'Mistura C'],
  'Semiacabado': ['Produto Semi A', 'Produto Semi B'],
  'Produto Acabado': ['Produto Acabado A', 'Produto Acabado B'],
};

export const UNIDADE_POR_ETAPA = {
  'Mistura Fina': 'kg',
  'Semiacabado': 'kg',
  'Produto Acabado': 'caixas',
};

export const REASONS = ['Alinhamento Semanal', 'Alteração de Programação'];

export const UNITS = ['kg', 'caixas', 'pacotes', 'unidades', 'litros'];

export const PROFILES = [
  { value: 'tecnico', label: 'Técnico' },
  { value: 'supply', label: 'Supply' },
  { value: 'lider', label: 'Líder' },
  { value: 'geral', label: 'Geral' },
];

export const profileLabel = (p) => PROFILES.find((x) => x.value === p)?.label || p;

export const roleForInvite = (profile) => (profile === 'supply' || profile === 'lider' ? 'admin' : 'user');

export const STATUS_FLOW = ['Planejada', 'Aguardando Emissão da OP', 'OP Emitida', 'Entregue', 'Recebida', 'Apontada'];

export const STATUS_ALL = [...STATUS_FLOW, 'Cancelada'];

export const STATUS_LABELS = {
  'Planejada': 'Enviar para Emissão',
  'Aguardando Emissão da OP': 'Emitir OP',
  'OP Emitida': 'Entregue',
  'Entregue': 'Atualizar para Recebida',
  'Recebida': 'Finalizar',
};

export const STATUS_COLORS = {
  'Planejada': 'bg-slate-100 text-slate-600',
  'Aguardando Emissão da OP': 'bg-amber-100 text-amber-700',
  'OP Emitida': 'bg-blue-100 text-blue-700',
  'Entregue': 'bg-indigo-100 text-indigo-700',
  'Recebida': 'bg-cyan-100 text-cyan-700',
  'Apontada': 'bg-blue-100 text-blue-700',
  'Cancelada': 'bg-rose-100 text-rose-700',
};

export const MILESTONES = ['Planejada', 'OP Emitida', 'Entregue', 'Recebida', 'Apontada'];

export const STATUS_TO_MILESTONE = {
  'Planejada': 'Planejada',
  'OP Emitida': 'OP Emitida',
  'Entregue': 'Entregue',
  'Recebida': 'Recebida',
  'Apontada': 'Apontada',
};

export const nextStatus = (s) => {
  const i = STATUS_FLOW.indexOf(s);
  return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
};

export const statusColor = (s) => STATUS_COLORS[s] || 'bg-slate-100 text-slate-600';

// Gera o próximo número sequencial de OP incrementando os dígitos finais (preserva prefixo e zeros à esquerda)
export const nextOpSeq = (op) => {
  const m = String(op || '').match(/^(.*?)(\d+)$/);
  if (!m) return op;
  const pad = m[2].length;
  return m[1] + String(parseInt(m[2], 10) + 1).padStart(pad, '0');
};

// Gera o próximo número de lote incrementando a parte numérica antes da barra (ex: 050/26 -> 051/26)
export const nextLoteSeq = (lote) => {
  const s = String(lote || '');
  const parts = s.split('/');
  const head = parts[0] || '';
  const m = head.match(/^(.*?)(\d+)$/);
  if (!m) return lote;
  const pad = m[2].length;
  return m[1] + String(parseInt(m[2], 10) + 1).padStart(pad, '0') + (parts.length > 1 ? '/' + parts.slice(1).join('/') : '');
};