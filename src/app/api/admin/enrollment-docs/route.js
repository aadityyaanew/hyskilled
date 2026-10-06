import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { query, isDbConfigured } from "@/lib/db";
import { ensureEnrollmentDocsTable } from "@/lib/enrollment-docs-db";

export async function GET(request) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: "Database not configured." },
      { status: 500 }
    );
  }

  try {
    await ensureEnrollmentDocsTable();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending | verified | rejected
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = 20;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    if (status && ["pending", "verified", "rejected"].includes(status)) {
      whereClauses.push("ed.status = ?");
      params.push(status);
    }

    if (search.trim()) {
      whereClauses.push(
        "(ed.full_name LIKE ? OR ed.email LIKE ? OR ed.mobile LIKE ? OR ed.order_id LIKE ?)"
      );
      const like = `%${search.trim()}%`;
      params.push(like, like, like, like);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM enrollment_docs ed ${where}`,
      params
    );
    const total = Number(countResult?.total || 0);

    const rows = await query(
      `SELECT
        ed.id, ed.order_id, ed.full_name, ed.father_name, ed.dob,
        ed.mobile, ed.email, ed.country, ed.address, ed.city, ed.state, ed.postal_code,
        ed.govt_id_type, ed.govt_id_url, ed.aadhaar_number,
        ed.highest_qualification, ed.institution_name, ed.graduation_year,
        ed.percentage_cgpa, ed.marksheet_url,
        ed.current_status, ed.work_experience_years, ed.current_company, ed.designation,
        ed.photo_url, ed.resume_url,
        ed.total_fee, ed.paid_amount, ed.balance, ed.payment_ref_id, ed.receipt_url,
        ed.selected_course, ed.selected_category,
        ed.declaration_agreed, ed.digital_signature,
        ed.status, ed.admin_notes,
        ed.submitted_at, ed.updated_at
      FROM enrollment_docs ed
      ${where}
      ORDER BY ed.submitted_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      docs: rows || [],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin enrollment-docs GET error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch enrollment docs." },
      { status: 500 }
    );
  }
}
