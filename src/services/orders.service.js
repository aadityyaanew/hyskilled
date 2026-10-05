import { getCourseBySlug } from "@/services/courses.service";
import { getBundleBySlug } from "@/services/bundles.service";
import { validateCoupon } from "@/services/coupons.service";
import { calculateTotals } from "@/lib/pricing";
import { courseToLineItem, bundleToLineItem } from "@/lib/line-items";
import { siteConfig } from "@/config/site";

export function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `HY-${stamp}${rand}`;
}

/**
 * Re-price an order from trusted catalogue data.
 * The client only sends `{ type, slug }` pairs and a coupon code – amounts are
 * always computed here so they can't be tampered with.
 */
export async function buildOrder({ items, couponCode, customer, paymentMethod, provider }) {
  const lineItems = [];
  for (const { type, slug } of items) {
    if (type === "bundle") {
      const bundle = await getBundleBySlug(slug);
      if (bundle) lineItems.push(bundleToLineItem(bundle));
    } else {
      const course = await getCourseBySlug(slug);
      if (course) {
        if (course.isClosed) {
          throw new Error(`Enrollment for "${course.title}" has closed and is no longer accepting new registrations.`);
        }
        lineItems.push(courseToLineItem(course));
      }
    }
  }
  if (lineItems.length === 0) {
    throw new Error("No valid items in order.");
  }

  const subtotal = lineItems.reduce((s, i) => s + i.price, 0);
  let coupon = null;
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal);
    if (result.valid) coupon = result.coupon;
  }

  return {
    id: generateOrderId(),
    status: "pending", // pending | paid | failed
    currency: siteConfig.currency.code,
    items: lineItems,
    coupon: coupon ? { code: coupon.code, description: coupon.description } : null,
    totals: calculateTotals(lineItems, coupon),
    customer,
    paymentMethod,
    provider,
    createdAt: new Date().toISOString(),
  };
}
