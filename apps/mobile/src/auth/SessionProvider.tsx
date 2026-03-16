import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe } from "@smart/api";
import { createApiClient } from "../lib/api";
import {
  buildSession,
  clearRoleMode,
  clearToken,
  getMobileRoles,
  getStoredRoleMode,
  getStoredToken,
  storeRoleMode,
  type MobileSession,
  type RoleMode,
} from "./session";

type SessionContextValue = {
  loading: boolean;
  session: MobileSession | null;
  roleMode: RoleMode | null;
  availableRoles: RoleMode[];
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  pickRole: (mode: RoleMode) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MobileSession | null>(null);
  const [roleMode, setRoleMode] = useState<RoleMode | null>(null);
  const [availableRoles, setAvailableRoles] = useState<RoleMode[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const token = await getStoredToken();
      if (!token) {
        setSession(null);
        setAvailableRoles([]);
        setRoleMode(null);
        return;
      }

      const api = createApiClient();
      const me = await getMe(api);
      const nextSession = buildSession(token, me);
      setSession(nextSession);

      const mobileRoles = getMobileRoles(nextSession.roles);
      setAvailableRoles(mobileRoles);

      if (mobileRoles.length === 0) {
        setRoleMode(null);
        return;
      }

      if (mobileRoles.length === 1) {
        setRoleMode(mobileRoles[0]);
        return;
      }

      const stored = await getStoredRoleMode();
      if (stored && mobileRoles.includes(stored)) {
        setRoleMode(stored);
      } else {
        setRoleMode(null);
      }
    } catch {
      await clearToken();
      await clearRoleMode();
      setSession(null);
      setAvailableRoles([]);
      setRoleMode(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await clearToken();
    await clearRoleMode();
    await refresh();
  }

  async function pickRole(mode: RoleMode) {
    await storeRoleMode(mode);
    setRoleMode(mode);
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      loading,
      session,
      roleMode,
      availableRoles,
      refresh,
      logout,
      pickRole,
    }),
    [loading, session, roleMode, availableRoles]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return ctx;
}