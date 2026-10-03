import { internalApi } from "@/services/api-client";
import { env } from "@/config/env";

/**
 * Payment orchestration (browser side).
 *
 * Flow:
 *   1. createPaymentOrder()  -> POST /api/payments/create-order
 *        server re-prices the cart and returns a *pending* order
 *   2. adapter.launch(order) -> opens the gateway (Razorpay / Stripe / sandbox)
 *   3. verifyPayment()       -> POST /api/payments/verify
 *        server verifies the gateway signature & marks the order paid
 *   4. Gateway webhook       -> POST /api/payments/webhook (source of truth)
 *
 * To go live, implement `launch` for your gateway below and set
 * NEXT_PUBLIC_PAYMENT_PROVIDER. Nothing else in the UI needs to change.
 */

export function createPaymentOrder(payload) {
  return internalApi.post("/payments/create-order", payload);
}

export function verifyPayment(payload) {
  return internalApi.post("/payments/verify", payload);
}

/**
 * Adapter contract:
 *   launch(order, { method }) => Promise<{ status: "paid"|"failed"|"cancelled",
 *                                          paymentId?: string, reason?: string }>
 */
export const paymentAdapters = {
  /** Handled by <PaymentSandboxDialog /> – no network gateway involved. */
  sandbox: { id: "sandbox", ui: "dialog" },

  razorpay: {
    id: "razorpay",
    ui: "gateway",
    async launch(/* order, { method } */) {
      // TODO(payments): load https://checkout.razorpay.com/v1/checkout.js and
      // open Razorpay with { key: env.razorpayKeyId, order_id: order.gatewayOrderId, ... }
      // then resolve with the handler response for server-side verification.
      throw new Error("Razorpay is not configured yet.");
    },
  },

  stripe: {
    id: "stripe",
    ui: "gateway",
    async launch(/* order */) {
      // TODO(payments): redirect to Stripe Checkout / confirm a PaymentIntent
      // using env.stripePublishableKey and the clientSecret from create-order.
      throw new Error("Stripe is not configured yet.");
    },
  },
};

export function getPaymentAdapter() {
  return paymentAdapters[env.paymentProvider] ?? paymentAdapters.sandbox;
}
