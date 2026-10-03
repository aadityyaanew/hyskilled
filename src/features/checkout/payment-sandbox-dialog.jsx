"use client";

import { useState } from "react";
import { CheckCircle2, FlaskConical, Loader2, Lock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import { paymentMethods } from "@/config/payments";

/**
 * Stand-in for a real payment gateway window (Razorpay / Stripe).
 * Lets you rehearse the success and failure journeys end to end.
 * It is only rendered while NEXT_PUBLIC_PAYMENT_PROVIDER === "sandbox".
 */
export function PaymentSandboxDialog({ order, open, onResult, onCancel }) {
  const [busy, setBusy] = useState(null); // "success" | "failure" | null

  if (!order) return null;
  const method = paymentMethods.find((m) => m.id === order.paymentMethod);

  async function choose(outcome) {
    setBusy(outcome);
    await new Promise((r) => setTimeout(r, 1100)); // simulate gateway latency
    await onResult(outcome === "success" ? { status: "paid" } : { status: "failed", reason: "payment_declined" });
    setBusy(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && onCancel()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md">
        <div className="bg-gradient-to-br from-brand-700 to-brand-950 p-6 text-white">
          <DialogHeader className="text-left">
            <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase">
              <FlaskConical className="size-3.5" /> Sandbox payment
            </span>
            <DialogTitle className="font-heading text-2xl font-bold text-white">
              Pay {formatPrice(order.totals.total, { precise: !Number.isInteger(order.totals.total) })}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Order {order.id} · {method?.label}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-6">
          <p className="rounded-xl bg-amber-50 p-3.5 text-sm text-amber-900">
            This is a simulated gateway — no real money moves. Choose an outcome to test the order
            confirmation and failure screens. Connect Razorpay or Stripe in{" "}
            <code className="rounded bg-amber-100 px-1 text-xs">payments.client.js</code> to go live.
          </p>

          <div className="grid gap-3">
            <Button
              size="lg"
              variant="brand"
              disabled={Boolean(busy)}
              onClick={() => choose("success")}
              className="h-14"
            >
              {busy === "success" ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              {busy === "success" ? "Confirming payment…" : "Simulate successful payment"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={Boolean(busy)}
              onClick={() => choose("failure")}
              className="h-14 text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              {busy === "failure" ? <Loader2 className="animate-spin" /> : <XCircle />}
              {busy === "failure" ? "Processing…" : "Simulate failed payment"}
            </Button>
            <Button variant="ghost" disabled={Boolean(busy)} onClick={onCancel}>
              Cancel
            </Button>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Secured checkout
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
