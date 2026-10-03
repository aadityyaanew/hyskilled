import { NextResponse } from "next/server";
import { validateCoupon } from "@/services/coupons.service";

export async function POST(request) {
  const { code, subtotal } = await request.json().catch(() => ({}));
  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ valid: false, message: "Enter a coupon code." }, { status: 400 });
  }
  const result = validateCoupon(code, subtotal);
  return NextResponse.json(result);
}
