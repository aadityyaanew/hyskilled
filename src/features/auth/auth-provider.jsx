"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, storage } from "@/lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          storage.set(STORAGE_KEYS.session, { user: data.user });
          return data.user;
        }
      }
    } catch {
      // ignore network errors
    }

    // fallback to storage if offline
    const cached = storage.get(STORAGE_KEYS.session, null);
    if (cached?.user) {
      setUser(cached.user);
      return cached.user;
    }

    setUser(null);
    return null;
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setHydrated(true));
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    storage.remove(STORAGE_KEYS.session);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...patch } : patch;
      storage.set(STORAGE_KEYS.session, { user: next });
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      hydrated,
      logout,
      updateProfile,
      refreshSession,
    }),
    [user, hydrated, logout, updateProfile, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
