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

  const profile = user?.profile || (user?.role === 'admin' ? 'gestor' : 'supply');
  const sector = user?.sector || 'Supply';
  const name = user?.full_name || 'Usuário';
  const canManage = profile === 'supply' || profile === 'gestor';
  const isGestor = profile === 'gestor';

  const setProfile = async (p, s) => {
    const u = await base44.auth.updateMe({ profile: p, sector: s });
    setUser((prev) => ({ ...prev, ...u, profile: p, sector: s }));
  };

  return (
    <C.Provider value={{ user, loading, profile, sector, name, canManage, isGestor, setProfile }}>
      {children}
    </C.Provider>
  );
}

export const useRole = () => useContext(C);