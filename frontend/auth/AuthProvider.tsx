import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { AuthSession, RegistrationAccountType, User } from "../api/types";
import { readJson, removeKey, writeJson } from "../lib/storage";

// The session lives in sessionStorage, so it ends when the tab closes. When a real backend
// exists, the token should move to an httpOnly cookie set by the server.
const SESSION_KEY = "of_session";

interface AuthValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, accountType: RegistrationAccountType, organizationName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    readJson<AuthSession | null>(SESSION_KEY, null, true),
  );

  const store = useCallback((next: AuthSession | null) => {
    setSession(next);
    if (next) writeJson(SESSION_KEY, next, true);
    else removeKey(SESSION_KEY, true);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      login: async (email, password) => store(await api.login({ email, password })),
      register: async (name, email, password, accountType, organizationName) =>
        store(await api.register({ name, email, password, account_type: accountType, organization_name: organizationName })),
      logout: () => store(null),
    }),
    [session, store],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
