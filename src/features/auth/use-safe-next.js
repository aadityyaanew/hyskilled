"use client";

import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/routes";

/**
 * Reads `?next=` and only accepts same-origin relative paths to prevent
 * open-redirect abuse. Falls back to the account page.
 */
export function useSafeNext(fallback = ROUTES.account) {
  const params = useSearchParams();
  const next = params.get("next");
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  return { next: safe, target: safe ?? fallback };
}
