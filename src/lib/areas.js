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
];

export const profileLabel = (p) => PROFILES.find((x) => x.value === p)?.label || p;

export const roleForInvite = (profile) => (profile === 'tecnico' ? 'user' : 'admin');

export const STATUS_FLOW = ['Planejada', 'Aguardando Emissão da OP', 'OP Emitida', 'Em Produção', 'Apontada', 'Finalizada'];

export const STATUS_ALL = [...STATUS_FLOW, 'Cancelada'];

export const STATUS_LABELS = {
  'Planejada': 'Enviar para Emissão',
  'Aguardando Emissão da OP': 'Emitir OP',
  'OP Emitida': 'Iniciar Produção',
  'Em Produção': 'Apontar Produção',
  'Apontada': 'Finalizar',
};

export const STATUS_COLORS = {
  'Planejada': 'bg-slate-100 text-slate-600',
  'Aguardando Emissão da OP': 'bg-amber-100 text-amber-700',
  'OP Emitida': 'bg-emerald-100 text-emerald-700',
  'Em Produção': 'bg-indigo-100 text-indigo-700',
  'Apontada': 'bg-cyan-100 text-cyan-700',
  'Finalizada': 'bg-green-100 text-green-700',
  'Cancelada': 'bg-rose-100 text-rose-700',
};

export const MILESTONES = ['Solicitação criada', 'Planejada', 'OP emitida', 'Em Produção', 'Produção apontada', 'Finalizada'];

export const STATUS_TO_MILESTONE = {
  'Planejada': 'Planejada',
  'OP Emitida': 'OP emitida',
  'Em Produção': 'Em Produção',
  'Apontada': 'Produção apontada',
  'Finalizada': 'Finalizada',
};

export const nextStatus = (s) => {
  const i = STATUS_FLOW.indexOf(s);
  return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
};

export const statusColor = (s) => STATUS_COLORS[s] || 'bg-slate-100 text-slate-600';