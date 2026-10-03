"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Clock, CreditCard, LifeBuoy, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/features/orders/use-order";
import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/config/routes";

const reasons = {
  payment_declined: {
    title: "Your payment was declined",
    text: "Your bank or payment provider didn't approve the transaction. Please try again or use a different payment method.",
  },
  verification_failed: {
    title: "We couldn't confirm your payment",
    text: "We weren't able to verify the transaction with the payment provider. If money was debited, it will be reversed automatically.",
  },
  cancelled: {
    title: "Payment cancelled",
    text: "You closed the payment window before it finished. No charge was made.",
  },
  payment_failed: {
    title: "Something went wrong with your payment",
    text: "The transaction couldn't be completed. You haven't been charged for this order.",
  },
};

export function OrderFailedView() {
  const params = useSearchParams();
  const id = params.get("order");
  const reason = params.get("reason") ?? "payment_failed";
  const { order } = useOrder(id);
  const copy = reasons[reason] ?? reasons.payment_failed;

  const tips = [
    { icon: CreditCard, text: "Check your card details, UPI PIN or net-banking credentials." },
    { icon: RotateCcw, text: "Try a different payment method — UPI usually succeeds fastest." },
    { icon: Clock, text: "If money was debited, it's auto-reversed in 5–7 working days." },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border bg-white px-6 py-12 text-center shadow-soft sm:px-12">
        <div aria-hidden className="absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="relative">
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-600/30">
            <XCircle className="size-12" strokeWidth={2.2} />
          </div>
          <h1 className="mt-7 text-3xl font-extrabold text-ink sm:text-4xl">{copy.title}</h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">{copy.text}</p>

          {order && (
            <p className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-muted px-4 py-2.5 text-sm text-ink-soft">
              <span>
                Order <span className="font-mono font-bold text-ink">{order.id}</span>
              </span>
              <span className="hidden text-border sm:inline">|</span>
              <span>
                Amount{" "}
                <span className="font-bold text-ink">
                  {formatPrice(order.totals.total, { precise: !Number.isInteger(order.totals.total) })}
                </span>
              </span>
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="brand">
              <Link href={ROUTES.checkout}>
                <RotateCcw /> Try again
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href={ROUTES.cart}>
                Back to cart <ArrowRight />
              </Link>
            </Button>
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" /> Your cart is saved — nothing is lost.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-white p-6 sm:p-8" aria-labelledby="tips">
        <h2 id="tips" className="font-heading text-lg font-bold text-ink">
          What you can do
        </h2>
        <ul className="mt-4 space-y-3">
          {tips.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-ink-soft">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-primary">
                <Icon className="size-4" />
              </span>
              <span className="pt-1">{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <LifeBuoy className="size-5 text-primary" /> Still stuck? We're happy to help.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.contact}>Contact support</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
