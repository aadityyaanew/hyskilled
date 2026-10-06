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
    const rows = await query("SELECT * FROM enrollment_docs WHERE id = ? LIMIT 1", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Record not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, doc: rows[0] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status, adminNotes } = body;

  const allowed = ["pending", "verified", "rejected"];
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ success: false, message: "Invalid status." }, { status: 422 });
  }

  try {
    await execute(
      "UPDATE enrollment_docs SET status = ?, admin_notes = ? WHERE id = ?",
      [status, adminNotes || null, id]
    );
    const rows = await query("SELECT * FROM enrollment_docs WHERE id = ? LIMIT 1", [id]);
    return NextResponse.json({ success: true, doc: rows[0] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
