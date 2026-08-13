import { useEffect, useState, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { ETAPAS } from '@/lib/areas';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    base44.entities.Product.list('-created_date', 500)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const productsByEtapa = useMemo(() => {
    const map = {};
    ETAPAS.forEach((e) => { map[e] = []; });
    products
      .filter((p) => p.active !== false)
      .forEach((p) => {
        if (!map[p.etapa]) map[p.etapa] = [];
        map[p.etapa].push(p.name);
      });
    return map;
  }, [products]);

  const byName = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p.name] = p; });
    return map;
  }, [products]);

  return { productsByEtapa, products, byName, loading, reload: load };
}