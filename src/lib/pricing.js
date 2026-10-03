import { siteConfig } from "@/config/site";

/**
 * Pure pricing logic shared by the client (cart, checkout preview) and the
 * server (order creation re-prices from trusted data – never trust the client).
 */

/** Round to 2 decimals to avoid float drift. */
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Compute the discount a coupon grants for a given subtotal.
 * coupon: { type: "percent"|"flat", value, maxDiscount?, minOrder? }
 */
export function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.minOrder && subtotal < coupon.minOrder) return 0;
  let discount =
    coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  return r2(Math.min(discount, subtotal));
}

/**
 * items: [{ price, originalPrice? }]
 * Returns { subtotal, listTotal, savings, discount, total, tax, net }
 *  - subtotal  : sum of current prices
 *  - listTotal : sum of strike-through prices
 *  - savings   : listTotal - subtotal (marketing discount)
 *  - discount  : coupon discount
 *  - total     : amount payable
 *  - tax/net   : GST breakdown (inclusive by default)
 */
export function calculateTotals(items, coupon) {
  const subtotal = r2(items.reduce((sum, i) => sum + i.price, 0));
  const listTotal = r2(
    items.reduce((sum, i) => sum + (i.originalPrice ?? i.price), 0)
  );
  const discount = couponDiscount(coupon, subtotal);
  const { rate, inclusive } = siteConfig.tax;

  let total;
  let tax;
  let net;
  if (inclusive) {
    total = r2(subtotal - discount);
    net = r2(total / (1 + rate));
    tax = r2(total - net);
  } else {
    net = r2(subtotal - discount);
    tax = r2(net * rate);
    total = r2(net + tax);
  }

  return {
    subtotal,
    listTotal,
    savings: r2(listTotal - subtotal),
    discount,
    tax,
    net,
    total,
  };
}
