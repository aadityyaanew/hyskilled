"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, ShoppingBag, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CartItem } from "@/features/cart/cart-item";
import { CouponForm } from "@/features/cart/coupon-form";
import { TotalsBreakdown } from "@/features/cart/totals-breakdown";
import { useCart } from "@/features/cart/cart-provider";
import { ROUTES } from "@/config/routes";
import { siteConfig } from "@/config/site";

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton-shimmer h-32 rounded-3xl" />
        ))}
      </div>
      <div className="skeleton-shimmer h-96 rounded-3xl" />
    </div>
  );
}

export function CartView() {
  const { items, totals, coupon, removeItem, hydrated } = useCart();

  if (!hydrated) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your learning list is empty"
        description="Looks like you haven't added any courses yet. Explore the catalogue and find your next skill."
        action={
          <Button asChild size="lg" variant="brand">
            <Link href={ROUTES.courses}>
              Browse courses <ArrowRight />
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
      <section aria-label="Selected Courses" className="rounded-3xl border bg-card">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-ink">
            {items.length} {items.length === 1 ? "course" : "courses"} selected
          </h2>
        </header>
        <ul className="divide-y">
          {items.map((item) => (
            <CartItem key={item.id} item={item} onRemove={removeItem} className="p-6" />
          ))}
        </ul>
        <div className="flex items-start gap-3 rounded-b-3xl border-t bg-brand-50/50 px-6 py-4 text-sm text-ink-soft">
          <Smartphone className="mt-0.5 size-4 shrink-0 text-primary" />
          After purchase, log in to the {siteConfig.app.name} with the email you use to enroll.
        </div>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-28">
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h2 className="mb-5 font-heading text-lg font-bold text-ink">Order summary</h2>
          <CouponForm />
          <div className="my-6 border-t" />
          <TotalsBreakdown totals={totals} couponCode={coupon?.code} />
          <Button asChild size="xl" variant="brand" className="mt-6 w-full">
            <Link href={ROUTES.checkout}>
              Continue to Enrollment <ArrowRight />
            </Link>
          </Button>
          <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Lock className="size-3.5 text-emerald-600" /> Secure, encrypted enrollment
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-emerald-600" /> {siteConfig.guarantee.label}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
