// Ordenação natural: trata sequências numéricas corretamente (ex: "010/26" < "011/26", "4550" < "4551")
const naturalCompare = (a, b) => {
  const sa = String(a ?? '');
  const sb = String(b ?? '');
  return sa.localeCompare(sb, 'pt-BR', { numeric: true, sensitivity: 'base' });
};

export const sortRows = (rows, key, dir = 'asc') => {
  if (!key) return rows;
  const sorted = [...rows].sort((a, b) => {
    let cmp;
    if (key === 'quantity') {
      cmp = (Number(a[key]) || 0) - (Number(b[key]) || 0);
    } else if (key === 'request_date' || key === 'op_emission_date') {
      cmp = String(a[key] || '').localeCompare(String(b[key] || ''));
    } else {
      cmp = naturalCompare(a[key], b[key]);
    }
    return dir === 'desc' ? -cmp : cmp;
  });
  return sorted;
};