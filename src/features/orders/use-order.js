"use client";

import { STORAGE_KEYS } from "@/lib/storage";
import { useStoredValue } from "@/hooks/use-stored-value";

/** Reactive lookup of a single order from the (mock) order repository. */
export function useOrder(id) {
  const [orders, hydrated] = useStoredValue(STORAGE_KEYS.orders, []);
  return { order: orders.find((o) => o.id === id) ?? null, hydrated };
}

export function useOrders() {
  const [orders, hydrated] = useStoredValue(STORAGE_KEYS.orders, []);
  return { orders, hydrated };
}
