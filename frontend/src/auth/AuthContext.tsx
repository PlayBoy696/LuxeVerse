import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, me as apiMe } from '../api/auth.js';
import { getAccessToken, setAccessToken, clearAccessToken } from './token.js';
import type { User } from '../types/auth.js';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; name: string; username: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(() => getAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restore = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiMe();
        if (!mounted) return;
        setUser(res.data.user);
        setToken(token);
      } catch (err) {
        // failed to restore; clear token
        clearAccessToken();
        setToken(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restore();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res?.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        setToken(res.data.accessToken);
      }
      setUser(res.data.user ?? null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (input: { email: string; password: string; name: string; username: string }) => {
    setLoading(true);
    try {
      const res = await apiRegister(input);
      if (res?.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        setToken(res.data.accessToken);
      }
      setUser(res.data.user ?? null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      clearAccessToken();
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user && user.role === 'ADMIN'),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
