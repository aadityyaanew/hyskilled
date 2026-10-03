"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";

export function CartButton() {
  const { count, hydrated, openDrawer } = useCart();
  const shown = hydrated && count > 0;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={openDrawer}
      aria-label={shown ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"}
    >
      <ShoppingBag className="size-5" />
      {shown && (
        <span
          key={count}
          className="absolute -top-0.5 -right-0.5 grid size-5 animate-in zoom-in-50 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-white"
        >
          {count}
        </span>
      )}
    </Button>
  );
}
