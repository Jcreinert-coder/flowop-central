import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UNITS } from '@/lib/areas';

export function useUnits() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    base44.entities.MeasurementUnit.list('-created_date', 200)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const activeNames = items.filter((u) => u.active !== false).map((u) => u.name);
  const names = activeNames.length > 0 ? activeNames : UNITS;
  return { items, names, loading, reload };
}