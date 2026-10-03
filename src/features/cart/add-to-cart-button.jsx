"use client";

import { useRouter } from "next/navigation";
import { Check, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { ROUTES } from "@/config/routes";

/**
 * Add-to-cart / Buy-now control for any line item (course or bundle).
 * - default: adds to cart and opens the mini-cart
 * - buyNow : adds and jumps straight to checkout (conversion shortcut)
 */
export function AddToCartButton({
  item,
  buyNow = false,
  variant,
  size,
  className,
  children,
  iconOnly = false,
}) {
  const router = useRouter();
  const { addItem, has, hydrated } = useCart();
  const inCart = hydrated && has(item.id);

  if (buyNow) {
    return (
      <Button
        variant={variant ?? "brand"}
        size={size}
        className={className}
        onClick={() => {
          addItem(item, { openDrawer: false, silent: true });
          router.push(ROUTES.checkout);
        }}
      >
        <Zap />
        {children ?? "Buy now"}
      </Button>
    );
  }

  if (inCart) {
    return (
      <Button
        variant={variant === "brand" ? "outline" : (variant ?? "outline")}
        size={size}
        className={className}
        onClick={() => router.push(ROUTES.cart)}
        aria-label={iconOnly ? "In cart – view cart" : undefined}
      >
        <Check className="text-emerald-600" />
        {!iconOnly && "In cart"}
      </Button>
    );
  }

  return (
    <Button
      variant={variant ?? "default"}
      size={size}
      className={className}
      onClick={() => addItem(item)}
      aria-label={iconOnly ? `Add ${item.title} to cart` : undefined}
    >
      <ShoppingCart />
      {!iconOnly && (children ?? "Add to cart")}
    </Button>
  );
}
