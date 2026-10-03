import { NextResponse } from "next/server";

/**
 * Gateway webhook receiver (source of truth for payment status).
 *
 * PRODUCTION CHECKLIST:
 *  1. Read the RAW body and verify the signature header from your gateway.
 *  2. Make handling idempotent (gateways retry).
 *  3. Mark order paid/failed in the DB, trigger the receipt email and grant the
 *     learner access in the Hyskilled app (call the learning-app API).
 */
export async function POST(request) {
  const payload = await request.text();
  console.info("[webhook] received", payload.slice(0, 200));
  return NextResponse.json({ received: true });
}
