import { NextResponse } from "next/server";
import { buildOrder } from "@/services/orders.service";
import { checkoutSchema } from "@/schemas/forms.schema";

/**
 * Creates a *pending* order with server-side pricing.
 *
 * PRODUCTION: persist the order in your database, then create the gateway
 * order here (e.g. razorpay.orders.create / stripe.paymentIntents.create) and
 * return its identifiers (`gatewayOrderId`, `clientSecret`) alongside the order.
 */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ message: "Your cart is empty." }, { status: 400 });
  }

  const parsed = checkoutSchema
    .pick({ name: true, email: true, phone: true, paymentMethod: true })
    .safeParse(body.customer ? { ...body.customer, paymentMethod: body.paymentMethod } : {});
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid customer details." }, { status: 422 });
  }

  try {
    const order = await buildOrder({
      items: body.items,
      couponCode: body.couponCode,
      customer: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone },
      paymentMethod: parsed.data.paymentMethod,
      provider: body.provider ?? "sandbox",
    });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
