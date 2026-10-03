"use client";

import Link from "next/link";
import { ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/features/cart/cart-provider";
import { CartItem } from "@/features/cart/cart-item";
import { TotalsBreakdown } from "@/features/cart/totals-breakdown";
import { ROUTES } from "@/config/routes";
import { siteConfig } from "@/config/site";

/** Slide-over mini cart opened from the header or after "Add to cart". */
export function CartDrawer() {
  const { items, totals, coupon, removeItem, drawerOpen, setDrawerOpen, count } = useCart();

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 pr-14">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="size-5 text-primary" />
            My Learning
            {count > 0 && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-800">
                {count}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>Review your selection before completing enrollment.</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-20 place-items-center rounded-3xl bg-brand-50 text-primary">
              <ShoppingBag className="size-9" />
            </div>
            <div>
              <p className="text-lg font-bold text-ink">Your learning list is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore our courses and start building in-demand skills.
              </p>
            </div>
            <Button asChild onClick={() => setDrawerOpen(false)}>
              <Link href={ROUTES.courses}>Browse courses</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="min-h-0 flex-1">
              <ul className="space-y-5 p-5">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} onRemove={removeItem} compact />
                ))}
              </ul>
            </ScrollArea>
            <SheetFooter className="gap-4 border-t bg-muted/40 p-5">
              <TotalsBreakdown totals={totals} couponCode={coupon?.code} emphasize={false} />
              <Button asChild size="lg" variant="brand" onClick={() => setDrawerOpen(false)}>
                <Link href={ROUTES.checkout}>Complete Enrollment securely</Link>
              </Button>
              <Button asChild variant="outline" onClick={() => setDrawerOpen(false)}>
                <Link href={ROUTES.cart}>View Selected Courses</Link>
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                {siteConfig.guarantee.label}
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
