import { NextResponse } from "next/server";
import { buildOrder } from "@/services/orders.service";
import { checkoutSchema } from "@/schemas/forms.schema";
import { query, execute, isDbConfigured } from "@/lib/db";

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

    // If MySQL database is configured, persist the order record
    if (isDbConfigured()) {
      try {
        // Find existing user or link by email
        const userRows = await query(
          "SELECT id FROM users WHERE email = ? LIMIT 1",
          [order.customer.email]
        );
        const userId = userRows[0]?.id || null;

        await execute(
          `INSERT INTO orders (
            id, user_id, customer_name, customer_email, customer_phone,
            status, currency, subtotal, list_total, discount, tax, net, total,
            coupon_code, coupon_description, payment_method, provider
          ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order.id,
            userId,
            order.customer.name,
            order.customer.email,
            order.customer.phone || null,
            order.currency || "INR",
            order.totals.subtotal,
            order.totals.listTotal,
            order.totals.discount,
            order.totals.tax,
            order.totals.net,
            order.totals.total,
            order.coupon?.code || null,
            order.coupon?.description || null,
            order.paymentMethod,
            order.provider,
          ]
        );

        // Insert order items
        for (const item of order.items) {
          await execute(
            `INSERT INTO order_items (
              order_id, item_type, item_slug, title, subtitle, price, original_price, category_slug
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              order.id,
              item.type,
              item.slug,
              item.title,
              item.subtitle || "",
              item.price,
              item.originalPrice || null,
              item.categorySlug || null,
            ]
          );
        }
      } catch (dbErr) {
        console.warn("Could not persist order to MySQL, fallback active:", dbErr.message);
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
