import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";

export async function GET(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;

  try {
    const isNumeric = /^\d+$/.test(id);
    const sql = isNumeric
      ? "SELECT * FROM coupons WHERE id = ? LIMIT 1"
      : "SELECT * FROM coupons WHERE code = ? LIMIT 1";

    const rows = await query(sql, [isNumeric ? Number(id) : id.toUpperCase()]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Coupon not found." }, { status: 404 });
    }

    const coupon = rows[0];
    coupon.value = Number(coupon.value);
    coupon.max_discount = coupon.max_discount ? Number(coupon.max_discount) : null;
    coupon.min_order = coupon.min_order ? Number(coupon.min_order) : null;
    coupon.is_active = Boolean(coupon.is_active);

    return NextResponse.json({ success: true, coupon });
  } catch (err) {
    console.error("Database error fetching coupon:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch coupon." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;
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

  try {
    const isNumeric = /^\d+$/.test(id);
    const existing = await query(
      isNumeric ? "SELECT id, code FROM coupons WHERE id = ? LIMIT 1" : "SELECT id, code FROM coupons WHERE code = ? LIMIT 1",
      [isNumeric ? Number(id) : id.toUpperCase()]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Coupon not found." }, { status: 404 });
    }

    const couponId = existing[0].id;
    const currentCode = existing[0].code;
    const normalizedCode = code ? code.trim().toUpperCase().replace(/\s+/g, "") : currentCode;

    if (normalizedCode !== currentCode) {
      const codeConflict = await query("SELECT id FROM coupons WHERE code = ? AND id != ? LIMIT 1", [
        normalizedCode,
        couponId,
      ]);
      if (codeConflict.length > 0) {
        return NextResponse.json(
          { success: false, message: `A coupon with code "${normalizedCode}" already exists.` },
          { status: 409 }
        );
      }
    }

    await execute(
      `UPDATE coupons SET
        code = ?,
        description = ?,
        type = ?,
        value = ?,
        max_discount = ?,
        min_order = ?,
        is_active = ?,
        starts_at = ?,
        expires_at = ?,
        usage_limit = ?
      WHERE id = ?`,
      [
        normalizedCode,
        description !== undefined ? description.trim() : "",
        type === "flat" ? "flat" : "percent",
        Number(value) || 0,
        max_discount ? Number(max_discount) : null,
        min_order ? Number(min_order) : null,
        is_active ? 1 : 0,
        starts_at || null,
        expires_at || null,
        usage_limit ? Number(usage_limit) : null,
        couponId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully!",
      id: couponId,
      code: normalizedCode,
    });
  } catch (err) {
    console.error("Database error updating coupon:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update coupon." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;

  try {
    const isNumeric = /^\d+$/.test(id);
    const existing = await query(
      isNumeric ? "SELECT id, code FROM coupons WHERE id = ? LIMIT 1" : "SELECT id, code FROM coupons WHERE code = ? LIMIT 1",
      [isNumeric ? Number(id) : id.toUpperCase()]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Coupon not found." }, { status: 404 });
    }

    const couponId = existing[0].id;
    const couponCode = existing[0].code;

    await execute("DELETE FROM coupons WHERE id = ?", [couponId]);

    return NextResponse.json({
      success: true,
      message: `Coupon "${couponCode}" deleted successfully.`,
      id: couponId,
    });
  } catch (err) {
    console.error("Database error deleting coupon:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete coupon." },
      { status: 500 }
    );
  }
}
