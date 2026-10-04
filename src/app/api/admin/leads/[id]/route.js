import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";
import { LEAD_STATUSES, mapLeadRow } from "@/services/leads.service";

async function guard() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }
  return null;
}

const notFound = () =>
  NextResponse.json({ success: false, message: "Lead not found." }, { status: 404 });

export async function PUT(request, { params }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const rows = await query("SELECT * FROM leads WHERE id = ? LIMIT 1", [Number(id)]);
    if (!rows[0]) return notFound();

    const status = LEAD_STATUSES.includes(body.status) ? body.status : rows[0].status;
    const adminNotes =
      body.admin_notes !== undefined
        ? String(body.admin_notes).slice(0, 5000) || null
        : rows[0].admin_notes;

    await execute("UPDATE leads SET status = ?, admin_notes = ? WHERE id = ?", [
      status,
      adminNotes,
      Number(id),
    ]);
    const updated = await query("SELECT * FROM leads WHERE id = ? LIMIT 1", [Number(id)]);
    return NextResponse.json({ success: true, lead: mapLeadRow(updated[0]) });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || "Update failed." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  try {
    const result = await execute("DELETE FROM leads WHERE id = ?", [Number(id)]);
    if (!result.affectedRows) return notFound();
    return NextResponse.json({ success: true, message: "Lead deleted." });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || "Delete failed." }, { status: 500 });
  }
}
