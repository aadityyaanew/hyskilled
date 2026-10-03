import { NextResponse } from "next/server";
import { signJwt, COOKIE_NAMES, getCookieOptions } from "@/lib/auth-server";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const envAdminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const envAdminPassword = process.env.ADMIN_PASSWORD || "";

  if (!envAdminEmail || !envAdminPassword) {
    return NextResponse.json(
      {
        message:
          "ADMIN_EMAIL and ADMIN_PASSWORD are not configured in your .env.local file yet.",
      },
      { status: 500 }
    );
  }

  if (email !== envAdminEmail || password !== envAdminPassword) {
    return NextResponse.json(
      { message: "Invalid admin email or password." },
      { status: 401 }
    );
  }

  // Create Admin JWT session (valid for 7 days)
  const adminToken = await signJwt(
    {
      admin: {
        email: envAdminEmail,
        role: "admin",
      },
    },
    "7d"
  );

  const response = NextResponse.json({ success: true, email: envAdminEmail });
  response.cookies.set(COOKIE_NAMES.adminSession, adminToken, getCookieOptions(7 * 24 * 3600));
  return response;
}
