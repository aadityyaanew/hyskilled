import { NextResponse } from "next/server";
import { execute, isDbConfigured } from "@/lib/db";
import { getCourseOptions } from "@/services/leads.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const courses = await getCourseOptions();
  return NextResponse.json({ success: true, courses });
}

export async function POST(request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: "Service unavailable. Please try again later." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 150);
  const phone = String(body.phone || "").trim().slice(0, 30);
  const email = String(body.email || "").trim().slice(0, 190);
  const course = String(body.course || "").trim().slice(0, 255) || null;
  const notes = String(body.notes || "").trim().slice(0, 2000) || null;
  const source = String(body.source || "schedule_session").trim().slice(0, 60);

  const errors = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone) || phone.replace(/\D/g, "").length < 8) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email.";
  if (!course && source === "schedule_session") errors.course = "Please select a course.";
  if (!notes) errors.experience = "Please select your experience.";

  if (Object.keys(errors).length) {
    return NextResponse.json(
      { success: false, message: "Please fix the highlighted fields.", errors },
      { status: 422 }
    );
  }

  try {
    await execute(
      `INSERT INTO leads (name, phone, email, course, notes, source) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, phone, email, course, notes, source]
    );
    return NextResponse.json({ success: true, message: "Session request received." });
  } catch (err) {
    console.error("Error saving lead:", err);
    return NextResponse.json(
      { success: false, message: "Could not submit your request. Please try again." },
      { status: 500 }
    );
  }
}
