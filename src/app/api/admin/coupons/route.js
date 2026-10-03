import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  try {
    const coupons = await query("SELECT * FROM coupons ORDER BY created_at DESC");
    const formatted = coupons.map((c) => ({
      ...c,
      value: Number(c.value),
      max_discount: c.max_discount ? Number(c.max_discount) : null,
      min_order: c.min_order ? Number(c.min_order) : null,
      is_active: Boolean(c.is_active),
    }));

    return NextResponse.json({ success: true, coupons: formatted });
  } catch (err) {
    console.error("Database error fetching admin coupons:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch coupons." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    code,
    description,
    type = "percent",
    value = 0,
    max_discount = null,
    min_order = null,
    is_active = true,
    starts_at = null,
    expires_at = null,
    usage_limit = null,
  } = body;

  if (!code || !code.trim()) {
    return NextResponse.json({ success: false, message: "Coupon code is required." }, { status: 422 });
  }

  if (!description || !description.trim()) {
    return NextResponse.json({ success: false, message: "Coupon description is required." }, { status: 422 });
  }

  const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, "");

  try {
    const existing = await query("SELECT id FROM coupons WHERE code = ? LIMIT 1", [normalizedCode]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `A coupon with code "${normalizedCode}" already exists.` },
        { status: 409 }
      );
    }

    const result = await execute(
      `INSERT INTO coupons (
        code, description, type, value, max_discount, min_order,
        is_active, starts_at, expires_at, usage_limit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedCode,
        description.trim(),
        type === "flat" ? "flat" : "percent",
        Number(value) || 0,
        max_discount ? Number(max_discount) : null,
        min_order ? Number(min_order) : null,
        is_active ? 1 : 0,
        starts_at || null,
        expires_at || null,
        usage_limit ? Number(usage_limit) : null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully!",
      id: result.insertId,
      code: normalizedCode,
    });
  } catch (err) {
    console.error("Database error creating coupon:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create coupon." },
      { status: 500 }
    );
  }
}
