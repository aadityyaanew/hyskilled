import { NextResponse } from "next/server";
import { execute, query, isDbConfigured } from "@/lib/db";
import { getCashfree } from "@/lib/cashfree";
import { seatBookingSchema } from "@/schemas/forms.schema";

export const dynamic = "force-dynamic";

const BOOKING_AMOUNT = 2;
const BOOKING_CURRENCY = "INR";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  const parsed = seatBookingSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return NextResponse.json(
      { success: false, message: firstError?.message ?? "Invalid details." },
      { status: 422 }
    );
  }

  const { name, phone, email, course, city, state } = parsed.data;

  const orderId = `SEAT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  let userId = null;
  if (isDbConfigured()) {
    try {
      const userRows = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
      userId = userRows[0]?.id || null;
    } catch (_) { /* ignore */ }
  }

  let returnBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hyskilledwebsite.vercel.app";
  if (process.env.CASHFREE_ENV === "production" && !returnBaseUrl.startsWith("https://")) {
    returnBaseUrl = "https://hyskilledwebsite.vercel.app";
  }

  try {
    const cfRequest = {
      order_id: orderId,
      order_amount: BOOKING_AMOUNT,
      order_currency: BOOKING_CURRENCY,
      customer_details: {
        customer_id: userId ? String(userId) : `seat_${Date.now()}`,
        customer_name: name,
        customer_email: email,
        customer_phone: phone.replace(/\D/g, "").slice(-10),
      },
      order_meta: {
        return_url: `${returnBaseUrl.replace(/\/$/, "")}/register-seat/status?order_id=${orderId}`,
        notify_url: `${returnBaseUrl.replace(/\/$/, "")}/api/payments/webhook`,
      },
      order_note: `Seat booking: ${course} | ${city}, ${state}`,
    };

    const response = await getCashfree().PGCreateOrder(cfRequest);
    const paymentSessionId = response.data.payment_session_id;
    const gatewayOrderId = response.data.order_id;

    if (isDbConfigured()) {
      try {
        await execute(
          `INSERT INTO leads (name, phone, email, course, notes, source) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            name,
            phone,
            email,
            course,
            `City: ${city}, State: ${state} | Booking order: ${orderId}`,
            "seat_booking",
          ]
        );

        await execute(
          `INSERT INTO orders (
            id, user_id, customer_name, customer_email, customer_phone,
            status, currency, subtotal, list_total, discount, tax, net, total,
            payment_method, provider
          ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, 'online', 'cashfree')`,
          [
            orderId,
            userId,
            name,
            email,
            phone,
            BOOKING_CURRENCY,
            BOOKING_AMOUNT,
            BOOKING_AMOUNT,
            0,
            0,
            BOOKING_AMOUNT,
            BOOKING_AMOUNT,
          ]
        );

        await execute(
          `INSERT INTO order_items (
            order_id, item_type, item_slug, title, price
          ) VALUES (?, 'course', ?, ?, ?)`,
          [
            orderId,
            course.toLowerCase().replace(/[^a-z0-9]+/g, "-"), // Generate a basic slug
            course,
            BOOKING_AMOUNT,
          ]
        );
      } catch (dbErr) {
        console.warn("Could not persist seat booking to MySQL:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      gatewayOrderId,
      paymentSessionId,
      amount: BOOKING_AMOUNT,
    });
  } catch (error) {
    const cfMessage = error?.response?.data?.message;
    console.error("create-seat-booking failed:", error?.response?.data ?? error);
    return NextResponse.json(
      { success: false, message: cfMessage || error.message || "Payment initiation failed." },
      { status: 400 }
    );
  }
}
