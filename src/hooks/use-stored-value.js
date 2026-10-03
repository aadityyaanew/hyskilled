"use client";

import { useMemo, useSyncExternalStore } from "react";

function subscribeTo(key) {
  return (cb) => {
    const handler = (e) => {
      if (!e.detail || e.detail.key === key) cb();
    };
    window.addEventListener("hy:storage", handler);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener("hy:storage", handler);
      window.removeEventListener("storage", cb);
    };
  };
}

/**
 * Hydration-safe localStorage-backed store. The server snapshot is always
 * `null` so SSR markup matches the first client render, then the real value
 * is picked up right after hydration. Returns `[value, hydrated]`.
 */
export function useStoredValue(key, fallback) {
  const raw = useSyncExternalStore(
    useMemo(() => subscribeTo(key), [key]),
    () => window.localStorage.getItem(key) ?? "__empty__",
    () => null
  );

  const hydrated = raw !== null;
  const value = useMemo(() => {
    if (raw === null || raw === "__empty__") return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  return [value, hydrated];
}
