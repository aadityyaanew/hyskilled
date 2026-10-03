"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useStoredValue } from "@/hooks/use-stored-value";
import { calculateTotals } from "@/lib/pricing";
import { validateCouponClient } from "@/services/client/catalog.client";

const CartContext = createContext(null);

const EMPTY_CART = { items: [], coupon: null };

export function CartProvider({ children }) {
  const [cart, hydrated] = useStoredValue(STORAGE_KEYS.cart, EMPTY_CART);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const items = cart.items ?? [];
  const coupon = cart.coupon ?? null;

  const persist = useCallback((next) => storage.set(STORAGE_KEYS.cart, next), []);

  const addItem = useCallback(
    (item, { openDrawer = true, silent = false } = {}) => {
      const current = storage.get(STORAGE_KEYS.cart, EMPTY_CART);
      if (current.items.some((i) => i.id === item.id)) {
        if (!silent) toast.info("Already in your cart", { description: item.title });
        if (openDrawer) setDrawerOpen(true);
        return false;
      }
      persist({ ...current, items: [...current.items, item] });
      if (!silent) toast.success("Added to cart", { description: item.title });
      if (openDrawer) setDrawerOpen(true);
      return true;
    },
    [persist]
  );

  const removeItem = useCallback(
    (id) => {
      const current = storage.get(STORAGE_KEYS.cart, EMPTY_CART);
      const nextItems = current.items.filter((i) => i.id !== id);
      persist({ items: nextItems, coupon: nextItems.length ? current.coupon : null });
    },
    [persist]
  );

  const clear = useCallback(() => persist(EMPTY_CART), [persist]);

  const applyCoupon = useCallback(
    async (code) => {
      const subtotal = items.reduce((s, i) => s + i.price, 0);
      try {
        const result = await validateCouponClient(code, subtotal);
        if (result.valid) {
          const current = storage.get(STORAGE_KEYS.cart, EMPTY_CART);
          persist({ ...current, coupon: result.coupon });
        }
        return result;
      } catch {
        return { valid: false, message: "Couldn't validate the coupon. Please try again." };
      }
    },
    [items, persist]
  );

  const removeCoupon = useCallback(() => {
    const current = storage.get(STORAGE_KEYS.cart, EMPTY_CART);
    persist({ ...current, coupon: null });
  }, [persist]);

  const totals = useMemo(() => calculateTotals(items, coupon), [items, coupon]);

  const value = useMemo(
    () => ({
      items,
      coupon,
      totals,
      count: items.length,
      hydrated,
      has: (id) => items.some((i) => i.id === id),
      addItem,
      removeItem,
      clear,
      applyCoupon,
      removeCoupon,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      setDrawerOpen,
    }),
    [items, coupon, totals, hydrated, addItem, removeItem, clear, applyCoupon, removeCoupon, drawerOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
