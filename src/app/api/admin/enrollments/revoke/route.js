import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { execute, isDbConfigured } from "@/lib/db";

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);

  if (!id) {
    return NextResponse.json({ message: "Enrollment ID is required." }, { status: 422 });
  }

  if (isDbConfigured()) {
    try {
      await execute(
        "UPDATE enrollments SET status = 'revoked', revoked_at = NOW() WHERE id = ?",
        [id]
      );
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
