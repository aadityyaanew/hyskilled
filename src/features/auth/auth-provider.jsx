"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { STORAGE_KEYS } from "@/lib/storage";
import { useStoredValue } from "@/hooks/use-stored-value";
import { authService } from "@/services/client/auth.client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, hydrated] = useStoredValue(STORAGE_KEYS.session, null);

  const login = useCallback((credentials) => authService.login(credentials), []);
  const register = useCallback((data) => authService.register(data), []);
  const logout = useCallback(() => authService.logout(), []);
  const updateProfile = useCallback((patch) => authService.updateProfile(patch), []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      hydrated,
      login,
      register,
      logout,
      updateProfile,
    }),
    [session, hydrated, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
