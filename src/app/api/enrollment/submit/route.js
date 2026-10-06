import { NextResponse } from "next/server";
import { query, execute, isDbConfigured } from "@/lib/db";
import { ensureEnrollmentDocsTable } from "@/lib/enrollment-docs-db";

export async function POST(request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: "Database not configured." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const {
    // Personal
    orderId,
    fullName,
    fatherName,
    dob,
    mobile,
    email,
    // Address
    country = "India",
    address,
    city,
    state,
    postalCode,
    // Identity
    govtIdType,
    govtIdUrl,
    aadhaarNumber,
    // Academic
    highestQualification,
    institutionName,
    graduationYear,
    percentageCgpa,
    marksheetUrl,
    // Current Status
    currentStatus,
    workExperienceYears,
    currentCompany,
    designation,
    // Files
    photoUrl,
    resumeUrl,
    // Payment
    totalFee,
    paidAmount,
    paymentRefId,
    receiptUrl,
    // Course
    selectedCourse,
    selectedCategory,
    // Declaration
    declarationAgreed,
    digitalSignature,
  } = body;

  // Validate required fields
  const missing = [];
  if (!orderId) missing.push("orderId");
  if (!fullName) missing.push("fullName");
  if (!fatherName) missing.push("fatherName");
  if (!dob) missing.push("dob");
  if (!mobile) missing.push("mobile");
  if (!email) missing.push("email");
  if (!address) missing.push("address");
  if (!city) missing.push("city");
  if (!state) missing.push("state");
  if (!postalCode) missing.push("postalCode");
  if (!highestQualification) missing.push("highestQualification");
  if (!declarationAgreed) missing.push("declarationAgreed");
  if (!digitalSignature) missing.push("digitalSignature");

  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, message: `Missing required fields: ${missing.join(", ")}` },
      { status: 422 }
    );
  }

  try {
    await ensureEnrollmentDocsTable();

    // Check if already submitted for this order
    const existing = await query(
      "SELECT id FROM enrollment_docs WHERE order_id = ? LIMIT 1",
      [orderId]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Documentation for this order has already been submitted.",
          docId: existing[0].id,
        },
        { status: 409 }
      );
    }

    // Optionally resolve user_id from email
    let userId = null;
    try {
      const userRows = await query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [email]
      );
      userId = userRows[0]?.id || null;
    } catch (_) {
      // non-fatal
    }

    const result = await execute(
      `INSERT INTO enrollment_docs (
        order_id, user_id,
        full_name, father_name, dob, mobile, email,
        country, address, city, state, postal_code,
        govt_id_type, govt_id_url, aadhaar_number,
        highest_qualification, institution_name, graduation_year, percentage_cgpa, marksheet_url,
        current_status, work_experience_years, current_company, designation,
        photo_url, resume_url,
        total_fee, paid_amount, payment_ref_id, receipt_url,
        selected_course, selected_category,
        declaration_agreed, digital_signature
      ) VALUES (
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?
      )`,
      [
        orderId, userId,
        fullName.trim(), fatherName.trim(), dob, mobile.trim(), email.trim().toLowerCase(),
        (country || "India").trim(), address.trim(), city.trim(), state.trim(), postalCode.trim(),
        govtIdType || null, govtIdUrl || null, aadhaarNumber || null,
        highestQualification, institutionName || null, graduationYear || null, percentageCgpa || null, marksheetUrl || null,
        currentStatus || null, workExperienceYears || null, currentCompany || null, designation || null,
        photoUrl || null, resumeUrl || null,
        Number(totalFee) || 0, Number(paidAmount) || 0, paymentRefId || null, receiptUrl || null,
        selectedCourse || null, selectedCategory || null,
        declarationAgreed ? 1 : 0, digitalSignature.trim(),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Enrollment documentation submitted successfully!",
      docId: result.insertId,
    });
  } catch (err) {
    console.error("Enrollment submit error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to submit documentation." },
      { status: 500 }
    );
  }
}
