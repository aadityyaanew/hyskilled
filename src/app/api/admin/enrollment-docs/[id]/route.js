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
    const rows = await query(`
      SELECT 
        ed.*,
        COALESCE(IF(ed.total_fee = 2 OR ed.total_fee = 2500, c.price, ed.total_fee), c.price, o.total) AS total_fee,
        (COALESCE(IF(ed.total_fee = 2 OR ed.total_fee = 2500, c.price, ed.total_fee), c.price, o.total) - COALESCE(ed.paid_amount, o.total)) AS balance,
        COALESCE(ed.paid_amount, o.total) AS paid_amount
      FROM enrollment_docs ed
      JOIN orders o ON o.id = ed.order_id
      JOIN order_items oi ON o.id = oi.order_id AND oi.item_type = 'course'
      LEFT JOIN courses c ON c.slug = oi.item_slug
      WHERE ed.id = ? LIMIT 1
    `, [id]);
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
  const {
    status,
    adminNotes,
    full_name,
    father_name,
    dob,
    mobile,
    email,
    address,
    city,
    state,
    postal_code,
    country,
    govt_id_type,
    aadhaar_number,
    highest_qualification,
    institution_name,
    graduation_year,
    percentage_cgpa,
    current_status,
    current_company,
    designation,
    work_experience_years,
    selected_course,
    selected_category,
    total_fee,
    paid_amount,
    payment_ref_id,
  } = body;

  const allowed = ["pending", "verified", "rejected"];
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ success: false, message: "Invalid status." }, { status: 422 });
  }

  try {
    const updateFields = [];
    const updateValues = [];

    // Fields that can be updated directly
    const fieldsMap = {
      status,
      admin_notes: adminNotes,
      full_name,
      father_name,
      dob,
      mobile,
      email,
      address,
      city,
      state,
      postal_code,
      country,
      govt_id_type,
      aadhaar_number,
      highest_qualification,
      institution_name,
      graduation_year,
      percentage_cgpa,
      current_status,
      current_company,
      designation,
      work_experience_years,
      selected_course,
      selected_category,
      total_fee,
      paid_amount,
      payment_ref_id,
    };

    for (const [key, value] of Object.entries(fieldsMap)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    const { order_id } = body;

    // Check if document exists either by id or order_id
    const existingRows = await query(
      "SELECT id FROM enrollment_docs WHERE id = ? OR order_id = ? LIMIT 1",
      [id, order_id || id]
    );

    let docId = existingRows.length > 0 ? existingRows[0].id : null;

    if (!docId && order_id) {
      // It's a missing_docs scenario, insert a new record
      // We need to fetch the order details to initialize default values
      const orderRows = await query("SELECT user_id, customer_email, total FROM orders WHERE id = ? LIMIT 1", [order_id]);
      const order = orderRows[0];

      if (!order) {
         return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
      }

      // Perform an insert with all provided fields
      const insertKeys = ["order_id", "user_id", "email"];
      const insertVals = [order_id, order.user_id || null, email || order.customer_email || "N/A"];

      // Add other fields from fieldsMap
      for (const [key, value] of Object.entries(fieldsMap)) {
        if (value !== undefined && key !== "email") {
          insertKeys.push(key);
          if (key === "total_fee" && (value === "" || value === null)) {
            insertVals.push(order.total || 0);
          } else {
            insertVals.push(value);
          }
        }
      }

      // Add default required fields if missing
      const defaults = {
        total_fee: order.total || 0,
        full_name: "N/A",
        father_name: "N/A",
        dob: "1970-01-01",
        mobile: "N/A",
        address: "N/A",
        city: "N/A",
        state: "N/A",
        postal_code: "N/A",
        highest_qualification: "N/A"
      };

      for (const [k, v] of Object.entries(defaults)) {
        if (!insertKeys.includes(k)) {
          insertKeys.push(k);
          insertVals.push(v);
        }
      }

      const placeholders = insertVals.map(() => "?").join(", ");
      const insertResult = await execute(
        `INSERT INTO enrollment_docs (${insertKeys.join(", ")}) VALUES (${placeholders})`,
        insertVals
      );
      docId = insertResult.insertId;
    } else if (docId && updateFields.length > 0) {
      // Update existing record
      updateValues.push(docId);
      await execute(
        `UPDATE enrollment_docs SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );
    }

    const rows = await query(`
      SELECT 
        ed.*,
        COALESCE(IF(ed.total_fee = 2 OR ed.total_fee = 2500, c.price, ed.total_fee), c.price, o.total) AS total_fee,
        (COALESCE(IF(ed.total_fee = 2 OR ed.total_fee = 2500, c.price, ed.total_fee), c.price, o.total) - COALESCE(ed.paid_amount, o.total)) AS balance,
        COALESCE(ed.paid_amount, o.total) AS paid_amount
      FROM enrollment_docs ed
      JOIN orders o ON o.id = ed.order_id
      JOIN order_items oi ON o.id = oi.order_id AND oi.item_type = 'course'
      LEFT JOIN courses c ON c.slug = oi.item_slug
      WHERE ed.id = ? LIMIT 1
    `, [docId]);
    return NextResponse.json({ success: true, doc: rows[0] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
