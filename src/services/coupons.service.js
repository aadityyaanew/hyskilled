import { coupons as mockCoupons } from "@/data/coupons";
import { couponDiscount } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { query, isDbConfigured } from "@/lib/db";

/** Server-side coupon lookup + validation with live DB support. */
export async function findCoupon(code) {
  if (!code) return null;
  const normalised = String(code).trim().toUpperCase();

  if (isDbConfigured()) {
    try {
      const rows = await query(
        "SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1",
        [normalised]
      );
      if (rows && rows.length > 0) {
        const c = rows[0];
        return {
          code: c.code,
          description: c.description,
          type: c.type,
          value: Number(c.value),
          maxDiscount: c.max_discount ? Number(c.max_discount) : null,
          minOrder: c.min_order ? Number(c.min_order) : null,
        };
      }
    } catch (err) {
      console.warn("Could not fetch coupon from MySQL, using mock fallback:", err.message);
    }
  }

  return null;
}

export async function validateCoupon(code, subtotal) {
  const coupon = await findCoupon(code);
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
