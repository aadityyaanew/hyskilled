"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/shared/price-display";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { courseToLineItem } from "@/lib/line-items";

/** Mobile-only sticky purchase bar – keeps the CTA in reach while reading. */
export function MobilePurchaseBar({ course }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "glass fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 px-4 pt-3 backdrop-blur-xl shadow-[0_-8px_30px_-12px_oklch(0.2_0.03_20/0.25)] transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <PriceDisplay price={course.price} originalPrice={course.originalPrice} size="sm" showDiscount={false} />
        {course.isClosed ? (
          <span className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-bold text-destructive">
            Enrollment Closed
          </span>
        ) : (
          <AddToCartButton item={courseToLineItem(course)} buyNow size="lg" className="flex-1 sm:flex-none sm:px-8">
            Start Learning
          </AddToCartButton>
        )}
      </div>
    </div>
  );
}
