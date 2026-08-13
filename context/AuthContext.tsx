"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearToken, getToken, unwrap } from "@/lib/api";
import type { User } from "@/lib/types/admin";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(
    () => typeof window === "undefined" || getToken() !== null,
  );

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api<{ data: User }>("/api/me")
      .then((payload) => setUser(payload.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await api<{ data: User }>("/api/login", {
      method: "POST",
      body: { email, password },
    });
    const loggedUser = unwrap(payload);
    if (loggedUser.token) {
      window.localStorage.setItem("techne_token", loggedUser.token);
    }
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
