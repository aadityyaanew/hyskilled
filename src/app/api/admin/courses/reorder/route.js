import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-api";
import { getPool, isDbConfigured } from "@/lib/db";
import { ensureCourseOrderColumn } from "@/lib/course-order";

/**
 * PUT { ids: number[] } — the complete list of course ids in the desired order.
 * Positions are always rewritten as unique, contiguous 1..N values in a single
 * transaction, so duplicate/invalid positions can never be stored.
 */
export async function PUT(request) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const ids = body.ids;

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 5000) {
    return NextResponse.json({ success: false, message: "A non-empty list of course ids is required." }, { status: 422 });
  }
  const numeric = ids.map(Number);
  if (numeric.some((n) => !Number.isInteger(n) || n <= 0)) {
    return NextResponse.json({ success: false, message: "Course ids must be positive integers." }, { status: 422 });
  }
  if (new Set(numeric).size !== numeric.length) {
    return NextResponse.json({ success: false, message: "Duplicate course ids in the order list." }, { status: 422 });
  }

  let conn;
  try {
    await ensureCourseOrderColumn();
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    // Lock and verify the ids exist and cover the whole table.
    const [rows] = await conn.query("SELECT id FROM courses ORDER BY display_order ASC, id ASC FOR UPDATE");
    const existing = new Set(rows.map((r) => r.id));
    if (numeric.some((id) => !existing.has(id))) {
      await conn.rollback();
      return NextResponse.json({ success: false, message: "One or more courses no longer exist. Refresh and try again." }, { status: 409 });
    }

    // Any courses missing from the payload (e.g. created concurrently) keep their relative order at the end.
    const given = new Set(numeric);
    const finalOrder = [...numeric, ...rows.map((r) => r.id).filter((id) => !given.has(id))];

    const caseSql = finalOrder.map(() => "WHEN ? THEN ?").join(" ");
    const params = [];
    finalOrder.forEach((id, i) => params.push(id, i + 1));
    await conn.query(
      `UPDATE courses SET display_order = CASE id ${caseSql} END WHERE id IN (${finalOrder.map(() => "?").join(",")})`,
      [...params, ...finalOrder]
    );
    await conn.commit();

    try {
      revalidatePath("/");
      revalidatePath("/courses");
      revalidatePath("/categories");
      revalidatePath("/admin/courses");
    } catch (e) {
      console.warn("revalidatePath error on reorder:", e);
    }

    return NextResponse.json({ success: true, message: "Course order saved.", count: finalOrder.length });
  } catch (err) {
    if (conn) await conn.rollback().catch(() => {});
    console.error("Database error reordering courses:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed to save course order." }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
