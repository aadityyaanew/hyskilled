/** Safe localStorage wrapper (SSR-safe, JSON, quota-safe). */
export const storage = {
  get(key, fallback = null) {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent("hy:storage", { detail: { key } }));
    } catch {
      /* storage full or blocked – ignore */
    }
  },
  remove(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new CustomEvent("hy:storage", { detail: { key } }));
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  cart: "hy.cart.v1",
  session: "hy.session.v1",
  users: "hy.mock.users.v1",
  orders: "hy.mock.orders.v1",
};
