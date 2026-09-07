import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { decodeRoleIdFromToken, decodeUserIdFromToken } from '../utils/jwt';

type AuthContextType = {
  token: string | null;
  userId: number | null;
  roleId: number | null;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );

  const userId = useMemo(() => decodeUserIdFromToken(token), [token]);
  const roleId = useMemo(() => decodeRoleIdFromToken(token), [token]);
  const isAdmin = roleId === 1;

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, roleId, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}