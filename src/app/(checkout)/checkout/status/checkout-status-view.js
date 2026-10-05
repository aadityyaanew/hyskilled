"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import { verifyPayment } from "@/services/client/payments.client";
import { ordersRepository } from "@/services/client/orders.client";
import { ROUTES } from "@/config/routes";

/**
 * Client component for the Cashfree return_url landing.
 * Cashfree redirects the user here after payment completes.
 * Calls /api/payments/verify, then redirects to success or failed.
 */
export function CheckoutStatusView() {
  const router = useRouter();
  const params = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const orderId = params.get("order_id");
    if (!orderId) {
      router.replace(ROUTES.courses);
      return;
    }

    verifyPayment({ orderId, provider: "cashfree" })
      .then((data) => {
        ordersRepository.update(orderId, {
          status: "paid",
          paymentId: data.paymentId,
          paidAt: new Date().toISOString(),
        });
        router.replace(ROUTES.orderSuccess(orderId));
      })
      .catch(() => {
        ordersRepository.update(orderId, {
          status: "failed",
          failureReason: "payment_failed",
        });
        router.replace(ROUTES.orderFailed(orderId, "payment_failed"));
      });
  }, [params, router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-background">
      <div className="relative">
        <div className="size-20 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="size-7 text-primary" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-ink">Confirming your payment…</p>
        <p className="mt-1 text-sm text-muted-foreground">Please don&apos;t close this tab.</p>
      </div>
      <p className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-emerald-500" />
        Secured by Cashfree Payments
      </p>
    </div>
  );
}
