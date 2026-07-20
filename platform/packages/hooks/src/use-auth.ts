"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { User, TokenResponse } from "@cervical-lens/shared";
import type { ApiClient } from "@cervical-lens/shared/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    institution?: string;
    license_number?: string;
    clinic_name?: string;
    clinic_region?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function createAuthProvider(apiClient: ApiClient) {
  function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
      user: null,
      loading: true,
      error: null,
    });

    const loadProfile = useCallback(async () => {
      const token = await apiClient.getToken();
      if (!token) {
        setState({ user: null, loading: false, error: null });
        return;
      }

      try {
        const user = await apiClient.get<User>("/auth/me");
        setState({ user, loading: false, error: null });
      } catch {
        await apiClient.clearToken();
        setState({ user: null, loading: false, error: null });
      }
    }, []);

    useEffect(() => {
      loadProfile();
    }, [loadProfile]);

    const login = useCallback(async (email: string, password: string) => {
      setState((s) => ({ ...s, error: null }));
      try {
        const res = await apiClient.post<TokenResponse>("/auth/login", { email, password });
        await apiClient.setToken(res.access_token);
        setState({ user: res.user, loading: false, error: null });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Login failed";
        setState((s) => ({ ...s, error: msg }));
        throw err;
      }
    }, []);

    const register = useCallback(async (data: Parameters<AuthContextValue["register"]>[0]) => {
      setState((s) => ({ ...s, error: null }));
      try {
        const res = await apiClient.post<TokenResponse>("/auth/register", data);
        await apiClient.setToken(res.access_token);
        setState({ user: res.user, loading: false, error: null });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Registration failed";
        setState((s) => ({ ...s, error: msg }));
        throw err;
      }
    }, []);

    const logout = useCallback(() => {
      apiClient.clearToken();
      setState({ user: null, loading: false, error: null });
    }, []);

    return (
      <AuthContext.Provider value={{ ...state, login, register, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return { AuthProvider, useAuth };
}
