import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const C = createContext(null);

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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

  // Usuário autenticado sem perfil definido precisa concluir o cadastro (boas-vindas)
  const needsOnboarding = !loading && !!user?.id && !user?.profile;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (needsOnboarding && location.pathname !== '/bem-vindo') {
    return <Navigate to="/bem-vindo" replace />;
  }

  return (
    <C.Provider value={{ user, loading, profile, area, cargo, name, status, active, isAdmin, canManage, canDelete }}>
      {children}
    </C.Provider>
  );
}

export const useRole = () => useContext(C);