import { NextResponse } from "next/server";
import { query, execute, isDbConfigured } from "@/lib/db";
import { getCashfree } from "@/lib/cashfree";

export async function POST(request) {
  const { orderId, provider = "sandbox", paymentId } = await request.json().catch(() => ({}));
  if (!orderId) {
    return NextResponse.json({ message: "Missing order id." }, { status: 400 });
  }

  let generatedPaymentId = paymentId ?? `sbx_${Date.now()}`;

  if (provider === "cashfree") {
    try {
      const response = await getCashfree().PGOrderFetchPayments(orderId);
      const paidPayment = response.data?.find((p) => p.payment_status === "SUCCESS");
      if (!paidPayment) {
        return NextResponse.json({ message: "Payment not successful" }, { status: 400 });
      }
      generatedPaymentId = String(paidPayment.cf_payment_id);
    } catch (error) {
      return NextResponse.json({ message: "Failed to verify payment with Cashfree" }, { status: 400 });
    }
  }

  if (isDbConfigured()) {
    try {
      // 1. Mark order as paid
      await execute(
        "UPDATE orders SET status = 'paid', payment_id = ?, paid_at = NOW() WHERE id = ?",
        [generatedPaymentId, orderId]
      );

      // 2. Fetch order and items to automatically grant enrollments
      const orderRows = await query(
        "SELECT id, user_id, customer_email, customer_name, customer_phone FROM orders WHERE id = ? LIMIT 1",
        [orderId]
      );
      const order = orderRows[0];

      if (order) {
        let userId = order.user_id;

        // If user wasn't registered prior, find or link them
        if (!userId) {
          const userRows = await query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [order.customer_email]
          );
          if (userRows.length > 0) {
            userId = userRows[0].id;
          } else {
            const newUserRes = await execute(
              `INSERT INTO users (google_id, email, name, phone, status)
               VALUES (?, ?, ?, ?, 'active')`,
              [
                `auto_${Date.now()}`,
                order.customer_email,
                order.customer_name,
                order.customer_phone || null,
              ]
            );
            userId = newUserRes?.insertId;
          }
          await execute("UPDATE orders SET user_id = ? WHERE id = ?", [userId, orderId]);
        }

        // 3. Grant course access for items
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
      }
    } catch (err) {
      console.warn("Could not synchronize payment confirmation to MySQL:", err.message);
    }
  }

  return NextResponse.json({
    verified: true,
    orderId,
    paymentId: generatedPaymentId,
  });
}
