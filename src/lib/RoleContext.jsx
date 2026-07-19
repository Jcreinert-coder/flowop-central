import { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const C = createContext(null);

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then((u) => setUser(u || {}))
      .catch(() => setUser({}))
      .finally(() => setLoading(false));
  }, []);

  const profile = user?.profile || 'supply';
  const area = user?.area || '';
  const cargo = user?.cargo || '';
  const name = user?.full_name || 'Usuário';
  const status = user?.status || 'Ativo';
  const isAdmin = profile === 'supply' || profile === 'lider';
  const canManage = isAdmin;
  const canDelete = isAdmin;
  const active = status !== 'Inativo';

  return (
    <C.Provider value={{ user, loading, profile, area, cargo, name, status, active, isAdmin, canManage, canDelete }}>
      {children}
    </C.Provider>
  );
}

export const useRole = () => useContext(C);