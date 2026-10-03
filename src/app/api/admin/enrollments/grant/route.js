import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { query, execute, isDbConfigured } from "@/lib/db";

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const courseId = body.courseId;
  const note = String(body.note || "Manual grant by admin");

  if (!email || !courseId) {
    return NextResponse.json(
      { message: "Learner email and course selection are required." },
      { status: 422 }
    );
  }

  if (isDbConfigured()) {
    try {
      // 1. Find user or create placeholder if not yet signed in
      let userRows = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
      let userId = userRows[0]?.id;

      if (!userId) {
        // Auto-create user placeholder so they can unlock immediately upon first login
        const [res] = await execute(
          `INSERT INTO users (google_id, email, name, status, admin_note)
           VALUES (?, ?, ?, 'active', 'Pre-enrolled by admin')`,
          [`manual_${Date.now()}`, email, email.split("@")[0]]
        );
        userId = res.insertId;
      }

      // 2. Resolve course numeric ID if a slug was passed
      let resolvedCourseId = Number(courseId);
      if (isNaN(resolvedCourseId)) {
        const cRows = await query("SELECT id FROM courses WHERE slug = ? LIMIT 1", [courseId]);
        resolvedCourseId = cRows[0]?.id;
      }

      if (!resolvedCourseId) {
        return NextResponse.json({ message: "Course not found in database." }, { status: 404 });
      }

      // 3. Insert or update enrollment
      await execute(
        `INSERT INTO enrollments (user_id, course_id, source, note, status, granted_at)
         VALUES (?, ?, 'manual', ?, 'active', NOW())
         ON DUPLICATE KEY UPDATE status = 'active', note = VALUES(note), granted_at = NOW()`,
        [userId, resolvedCourseId, note]
      );

      return NextResponse.json({ success: true, message: "Course access granted successfully." });
    } catch (err) {
      console.error("Database error granting access:", err);
      return NextResponse.json(
        { message: err.message || "Failed to grant course access." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    message: "Access granted in standby mode (connect MySQL to persist).",
  });
}
