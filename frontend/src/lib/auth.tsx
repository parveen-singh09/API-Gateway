import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, setToken } from "./api";
import type { Role } from "./types";

interface Session {
  role: Role;
  organizationId: number | null;
  username: string;
}

interface AuthState {
  session: Session | null;
  login: (username: string, password: string) => Promise<Role>;
  logout: () => void;
}

const SESSION_KEY = "gw.session";

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null): void {
  try {
    if (session === null) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* non-persistent fallback */
  }
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);

  const login = useCallback(async (username: string, password: string): Promise<Role> => {
    const res = await api.login({ username, password });
    setToken(res.token);
    const next: Session = {
      role: res.role,
      organizationId: res.organizationId,
      username,
    };
    writeSession(next);
    setSession(next);
    return res.role;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    writeSession(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthState>(() => ({ session, login, logout }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
