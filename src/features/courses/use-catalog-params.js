"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * URL <-> filter state for the catalogue. The URL is the single source of
 * truth so results are shareable, crawlable and server-rendered.
 */
export function useCatalogParams({ basePath } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const target = basePath ?? pathname;

  const push = useCallback(
    (mutate) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      next.delete("page"); // any filter change resets pagination
      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${target}?${qs}` : target, { scroll: false });
      });
    },
    [router, searchParams, target]
  );

  const get = (key) => searchParams.get(key) ?? "";
  const getAll = (key) => (searchParams.get(key) ?? "").split(",").filter(Boolean);

  return {
    isPending,
    get,
    getAll,
    set: (key, value) =>
      push((p) => {
        if (value) p.set(key, value);
        else p.delete(key);
      }),
    toggle: (key, value) =>
      push((p) => {
        const current = (p.get(key) ?? "").split(",").filter(Boolean);
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        if (next.length) p.set(key, next.join(","));
        else p.delete(key);
      }),
    clear: (keys = ["q", "category", "level", "price"]) =>
      push((p) => keys.forEach((k) => p.delete(k))),
    activeCount: ["category", "level", "price"].reduce(
      (n, k) => n + (k === "category" || k === "level" ? getAll(k).length : get(k) ? 1 : 0),
      0
    ),
  };
}
