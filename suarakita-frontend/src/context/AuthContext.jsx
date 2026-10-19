import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const refreshUser = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const result = await api.me();
      setUser(result?.data || null);
    } catch {
      setToken(null);
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);
  useEffect(() => {
    const onUnauthorized = () => { setUser(null); setToken(null); };
    window.addEventListener('suarakita:unauthorized', onUnauthorized);
    return () => window.removeEventListener('suarakita:unauthorized', onUnauthorized);
  }, []);

  const login = async (credentials) => {
    const result = await api.login(credentials);
    const data = result?.data;
    if (!data?.token) throw new Error('Server tidak mengembalikan token autentikasi.');
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };
  const register = async (input) => {
    const result = await api.register(input);
    const data = result?.data;
    if (!data?.token) throw new Error('Server tidak mengembalikan token autentikasi.');
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = async () => {
    try { if (getToken()) await api.logout(); } catch { /* Token tetap dihapus pada sisi klien. */ }
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, refreshUser }), [user, loading, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return value;
}
