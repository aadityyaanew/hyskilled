import { storage, STORAGE_KEYS } from "@/lib/storage";

/**
 * Order repository.
 *
 * MOCK IMPLEMENTATION backed by localStorage so the full checkout → success /
 * failure journey works without a backend. Replace the bodies with calls to
 * `backendApi` (GET/POST /orders …) – the signatures are the contract.
 */
export const ordersRepository = {
  list() {
    return storage.get(STORAGE_KEYS.orders, []);
  },

  listByEmail(email) {
    if (!email) return [];
    return this.list().filter(
      (o) => o.customer?.email?.toLowerCase() === email.toLowerCase()
    );
  },

  get(id) {
    return this.list().find((o) => o.id === id) ?? null;
  },

  save(order) {
    const others = this.list().filter((o) => o.id !== order.id);
    storage.set(STORAGE_KEYS.orders, [order, ...others]);
    return order;
  },

  update(id, patch) {
    const current = this.get(id);
    if (!current) return null;
    return this.save({ ...current, ...patch, updatedAt: new Date().toISOString() });
  },
};
