import { NextResponse } from "next/server";

/**
 * Verifies a completed payment with the gateway.
 *
 * PRODUCTION: validate the gateway signature (Razorpay HMAC / Stripe
 * PaymentIntent status) and only then mark the order as paid in the database.
 * The sandbox provider is accepted as-is so the UI can be exercised end to end.
 */
export async function POST(request) {
  const { orderId, provider = "sandbox", paymentId } = await request.json().catch(() => ({}));
  if (!orderId) {
    return NextResponse.json({ message: "Missing order id." }, { status: 400 });
  }
  if (provider !== "sandbox") {
    return NextResponse.json({ message: "Gateway verification not implemented." }, { status: 501 });
  }
  return NextResponse.json({ verified: true, orderId, paymentId: paymentId ?? `sbx_${Date.now()}` });
}
