import { internalApi } from "@/services/api-client";
import { env } from "@/config/env";
import { load } from "@cashfreepayments/cashfree-js";

/**
 * Payment orchestration (browser side).
 *
 * Flow:
 *   1. createPaymentOrder()  -> POST /api/payments/create-order
 *        server re-prices the cart, creates the order on Cashfree, returns payment_session_id
 *   2. adapter.launch(order) -> opens the Cashfree checkout page
 *        Cashfree redirects the user to return_url after payment
 *   3. verifyPayment()       -> POST /api/payments/verify
 *        server confirms payment status with Cashfree and grants course access
 *   4. Cashfree webhook      -> POST /api/payments/webhook (source of truth)
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
  cashfree: {
    id: "cashfree",
    ui: "gateway",
    async launch(order) {
      const cashfree = await load({
        mode: env.cashfreeEnv === "production" ? "production" : "sandbox",
      });
      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_self", // stay in same tab for clean UX
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      // Cashfree will redirect the browser to return_url —
      // this line is only reached if the SDK resolves without redirect (rare).
      return { status: "paid", paymentId: order.gatewayOrderId };
    },
  },
};

export function getPaymentAdapter() {
  return paymentAdapters[env.paymentProvider] ?? paymentAdapters.cashfree;
}
