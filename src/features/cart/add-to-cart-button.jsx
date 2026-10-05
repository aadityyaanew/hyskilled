"use client";

import { useRouter } from "next/navigation";
import { Check, ShoppingCart, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

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

  if (item?.isClosed) {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("opacity-75 cursor-not-allowed border-dashed bg-muted/60 text-muted-foreground", className)}
        disabled
        title="Enrollment is closed for this course"
      >
        <Lock className="size-3.5 mr-1" />
        {!iconOnly && "Closed"}
      </Button>
    );
  }

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
        {children ?? "Start Learning"}
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
        aria-label={iconOnly ? "Selected – view selected courses" : undefined}
      >
        <Check className="text-emerald-600" />
        {!iconOnly && "Selected"}
      </Button>
    );
  }

  return (
    <Button
      variant={variant ?? "default"}
      size={size}
      className={className}
      onClick={() => addItem(item)}
      aria-label={iconOnly ? `Enroll in ${item.title}` : undefined}
    >
      <ShoppingCart />
      {!iconOnly && (children ?? "Enroll Now")}
    </Button>
  );
}
