import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, tokenStore } from '../lib/api';

interface AuthState {
  isAuthed: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
const Ctx = createContext<AuthState>({ isAuthed: false, email: null, login: async () => {}, logout: () => {} });
const EMAIL_KEY = 'dtv-admin-email';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(tokenStore.get());
  const [email, setEmail] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(EMAIL_KEY);
    } catch {
      return null;
    }
  });

  const logout = () => {
    tokenStore.clear();
    try {
      sessionStorage.removeItem(EMAIL_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setEmail(null);
  };

  useEffect(() => {
    // The API layer fires this when the server answers 401 (expired or invalid token).
    const onExpired = () => logout();
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = async (e: string, password: string) => {
    const res = await apiLogin(e, password);
    tokenStore.set(res.token);
    try {
      sessionStorage.setItem(EMAIL_KEY, res.email);
    } catch {
      /* ignore */
    }
    setToken(res.token);
    setEmail(res.email);
  };

  return <Ctx.Provider value={{ isAuthed: !!token, email, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
