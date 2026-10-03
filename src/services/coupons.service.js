import { coupons } from "@/data/coupons";
import { couponDiscount } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";

/** Server-side coupon lookup + validation. */
export function findCoupon(code) {
  if (!code) return null;
  const normalised = String(code).trim().toUpperCase();
  return coupons.find((c) => c.code === normalised) ?? null;
}

export function validateCoupon(code, subtotal) {
  const coupon = findCoupon(code);
  if (!coupon) {
    return { valid: false, message: "This coupon code isn't valid." };
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `Add ${formatPrice(coupon.minOrder - subtotal)} more to use ${coupon.code}.`,
    };
  }
  return {
    valid: true,
    coupon,
    discount: couponDiscount(coupon, subtotal),
    message: `${coupon.code} applied — ${coupon.description}.`,
  };
}
