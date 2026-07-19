export const AREAS = ['Pasta', 'Pó', 'Sachê', 'Líquido'];

export const PROFILES = [
  { value: 'tecnico', label: 'Técnico' },
  { value: 'supply', label: 'Supply' },
  { value: 'lider', label: 'Líder' },
];

export const profileLabel = (p) => PROFILES.find((x) => x.value === p)?.label || p;

export const roleForInvite = (profile) => (profile === 'tecnico' ? 'user' : 'admin');