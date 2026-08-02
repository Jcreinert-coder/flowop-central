import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AREAS } from '@/lib/areas';

export function useAreas() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    base44.entities.ProductionArea.list('-created_date', 200)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const activeNames = items.filter((a) => a.active !== false).map((a) => a.name);
  const names = activeNames.length > 0 ? activeNames : AREAS;
  return { items, names, loading, reload };
}