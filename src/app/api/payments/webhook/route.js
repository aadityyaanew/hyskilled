import { NextResponse } from "next/server";
import crypto from "crypto";
import { query, execute, isDbConfigured } from "@/lib/db";

/**
 * Cashfree webhook receiver — source of truth for payment status.
 *
 * Verification flow (Cashfree PG v3+):
 *   signature = Base64( HMAC-SHA256( timestamp + rawBody, CASHFREE_SECRET_KEY ) )
 *   Headers:  x-webhook-timestamp, x-webhook-signature
 */

function verifySignature(rawBody, timestamp, signature) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export async function POST(request) {
  // 1. Read the RAW body — must not parse first or signature will break
  const rawBody = await request.text();

  const timestamp = request.headers.get("x-webhook-timestamp") ?? "";
  const signature = request.headers.get("x-webhook-signature") ?? "";

  // 2. Reject unsigned / tampered requests
  if (!signature || !timestamp || !verifySignature(rawBody, timestamp, signature)) {
    console.error("[webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = event?.type;
  console.info("[webhook] verified event:", type);

  // 3. Handle payment success
  if (type === "PAYMENT_SUCCESS_WEBHOOK") {
    const orderId = event?.data?.order?.order_id;
    const cfPaymentId = String(event?.data?.payment?.cf_payment_id ?? "");

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id in webhook" }, { status: 400 });
    }

    if (isDbConfigured()) {
      try {
        // Check idempotency — skip if already paid
        const existing = await query(
          "SELECT status FROM orders WHERE id = ? LIMIT 1",
          [orderId]
        );
        if (existing[0]?.status === "paid") {
          console.info("[webhook] order already paid, skipping:", orderId);
          return NextResponse.json({ received: true });
        }

        // Mark order as paid
        await execute(
          "UPDATE orders SET status = 'paid', payment_id = ?, paid_at = NOW() WHERE id = ?",
          [cfPaymentId, orderId]
        );

        // Fetch order details
        const orderRows = await query(
          "SELECT id, user_id, customer_email, customer_name, customer_phone FROM orders WHERE id = ? LIMIT 1",
          [orderId]
        );
        const order = orderRows[0];

        if (order) {
          let userId = order.user_id;

          // Find or auto-create the user
          if (!userId) {
            const userRows = await query(
              "SELECT id FROM users WHERE email = ? LIMIT 1",
              [order.customer_email]
            );
            if (userRows.length > 0) {
              userId = userRows[0].id;
            } else {
              const [newUserRes] = await execute(
                `INSERT INTO users (google_id, email, name, phone, status)
                 VALUES (?, ?, ?, ?, 'active')`,
                [
                  `auto_${Date.now()}`,
                  order.customer_email,
                  order.customer_name,
                  order.customer_phone || null,
                ]
              );
              userId = newUserRes.insertId;
            }
            await execute("UPDATE orders SET user_id = ? WHERE id = ?", [userId, orderId]);
          }

          // Grant course access for every purchased item
          const itemRows = await query(
            "SELECT item_type, item_slug FROM order_items WHERE order_id = ?",
            [orderId]
          );

          for (const item of itemRows) {
            if (item.item_type === "course") {
              const courseRows = await query(
                "SELECT id FROM courses WHERE slug = ? LIMIT 1",
                [item.item_slug]
              );
              const courseId = courseRows[0]?.id;
              if (courseId && userId) {
                await execute(
                  `INSERT INTO enrollments (user_id, course_id, source, order_id, status, granted_at)
                   VALUES (?, ?, 'order', ?, 'active', NOW())
                   ON DUPLICATE KEY UPDATE status = 'active', order_id = VALUES(order_id), granted_at = NOW()`,
                  [userId, courseId, orderId]
                );
              }
            }
          }

          console.info("[webhook] enrollment complete for order:", orderId, "user:", userId);
        }
      } catch (err) {
        // Log but return 200 — Cashfree will retry on non-2xx responses, which
        // could cause infinite retries if the error is persistent on our side.
        console.error("[webhook] DB error processing payment:", err.message);
      }
    }
  }

  // 4. Handle payment failure (optional — for audit trail)
  if (type === "PAYMENT_FAILED_WEBHOOK") {
    const orderId = event?.data?.order?.order_id;
    if (orderId && isDbConfigured()) {
      try {
        await execute(
          "UPDATE orders SET status = 'failed' WHERE id = ? AND status = 'pending'",
          [orderId]
        );
        console.info("[webhook] marked order as failed:", orderId);
      } catch (err) {
        console.error("[webhook] DB error marking order failed:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
