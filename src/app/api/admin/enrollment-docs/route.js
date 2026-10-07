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

    let whereClauses = ["o.status = 'paid'"];
    let params = [];

    if (status) {
      if (status === "missing_docs") {
        whereClauses.push("ed.id IS NULL");
      } else if (["pending", "verified", "rejected"].includes(status)) {
        whereClauses.push("ed.status = ?");
        params.push(status);
      }
    }

    if (search.trim()) {
      whereClauses.push(
        "(ed.full_name LIKE ? OR o.customer_name LIKE ? OR ed.email LIKE ? OR o.customer_email LIKE ? OR ed.mobile LIKE ? OR o.customer_phone LIKE ? OR o.id LIKE ?)"
      );
      const like = `%${search.trim()}%`;
      params.push(like, like, like, like, like, like, like);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countQuery = `
      SELECT COUNT(DISTINCT o.id) as total 
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id AND oi.item_type = 'course'
      LEFT JOIN enrollment_docs ed ON o.id = ed.order_id
      ${where}
    `;

    const [countResult] = await query(countQuery, params);
    const total = Number(countResult?.total || 0);

    const rows = await query(
      `SELECT
        COALESCE(ed.id, o.id) AS id, 
        o.id AS order_id, 
        COALESCE(ed.full_name, o.customer_name) AS full_name, 
        ed.father_name, ed.dob,
        COALESCE(ed.mobile, o.customer_phone) AS mobile, 
        COALESCE(ed.email, o.customer_email) AS email, 
        ed.country, ed.address, ed.city, ed.state, ed.postal_code,
        ed.govt_id_type, ed.govt_id_url, ed.aadhaar_number,
        ed.highest_qualification, ed.institution_name, ed.graduation_year,
        ed.percentage_cgpa, ed.marksheet_url,
        ed.current_status, ed.work_experience_years, ed.current_company, ed.designation,
        ed.photo_url, ed.resume_url,
        ed.payment_history,
        COALESCE(IF(ed.total_fee = 2 OR ed.total_fee = 2500, c.price, ed.total_fee), c.price, o.total) AS total_fee, 
        COALESCE(ed.paid_amount, o.total) AS paid_amount, 
        (COALESCE(IF(ed.total_fee = 2 OR ed.total_fee = 2500, c.price, ed.total_fee), c.price, o.total) - COALESCE(ed.paid_amount, o.total)) AS balance, 
        COALESCE(ed.payment_ref_id, o.payment_id) AS payment_ref_id, 
        ed.receipt_url,
        COALESCE(ed.selected_course, MAX(oi.title)) AS selected_course, 
        COALESCE(ed.selected_category, MAX(oi.category_slug)) AS selected_category,
        COALESCE(ed.declaration_agreed, 0) AS declaration_agreed, 
        ed.digital_signature,
        COALESCE(ed.status, 'missing_docs') AS status, 
        ed.admin_notes,
        COALESCE(ed.submitted_at, o.paid_at) AS submitted_at, 
        ed.updated_at
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id AND oi.item_type = 'course'
      LEFT JOIN courses c ON c.slug = oi.item_slug
      LEFT JOIN enrollment_docs ed ON o.id = ed.order_id
      ${where}
      GROUP BY o.id, ed.id, c.price
      ORDER BY submitted_at DESC
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
