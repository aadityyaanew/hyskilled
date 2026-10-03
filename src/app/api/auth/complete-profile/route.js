import { NextResponse } from "next/server";
import { getPendingOnboarding, signJwt, COOKIE_NAMES, getCookieOptions } from "@/lib/auth-server";
import { query, execute, isDbConfigured } from "@/lib/db";

const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;

export async function POST(request) {
  const pendingProfile = await getPendingOnboarding();
  if (!pendingProfile) {
    return NextResponse.json(
      { message: "Your onboarding session expired. Please sign in with Google again." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const rawPhone = String(body.phone || "").trim();

  // Normalize phone number (strip whitespace and +91 prefix)
  const cleanPhone = rawPhone.replace(/\s+/g, "").replace(/^(\+91)/, "");

  if (!phoneRegex.test(rawPhone) && !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return NextResponse.json(
      { message: "Please enter a valid 10-digit Indian mobile number." },
      { status: 422 }
    );
  }

  const { googleId, email, name, avatarUrl, targetUrl = "/account" } = pendingProfile;
  let userId = null;

  if (isDbConfigured()) {
    try {
      // Check if phone number is already in use by another user
      const existingPhoneRows = await query(
        "SELECT id, email FROM users WHERE phone = ? AND email != ? LIMIT 1",
        [cleanPhone, email]
      );
      if (existingPhoneRows.length > 0) {
        return NextResponse.json(
          { message: "This mobile number is already registered with another account." },
          { status: 409 }
        );
      }

      // Insert or update user record
      await execute(
        `INSERT INTO users (google_id, email, name, avatar_url, phone, status, last_login_at)
         VALUES (?, ?, ?, ?, ?, 'active', NOW())
         ON DUPLICATE KEY UPDATE
           phone = VALUES(phone),
           name = VALUES(name),
           avatar_url = VALUES(avatar_url),
           last_login_at = NOW()`,
        [googleId, email, name, avatarUrl, cleanPhone]
      );

      const userRows = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
      userId = userRows[0]?.id;
    } catch (err) {
      console.error("Database error saving new user profile:", err);
      return NextResponse.json(
        { message: "Could not save your details in database. Please check connection." },
        { status: 500 }
      );
    }
  } else {
    userId = `usr_${Math.random().toString(36).slice(2, 9)}`;
  }

  const userPayload = {
    id: userId,
    googleId,
    email,
    name,
    phone: cleanPhone,
    avatarUrl,
  };

  const sessionToken = await signJwt({ user: userPayload }, "30d");

  const response = NextResponse.json({
    success: true,
    user: userPayload,
    targetUrl: targetUrl || "/account",
  });

  response.cookies.set(COOKIE_NAMES.userSession, sessionToken, getCookieOptions(30 * 24 * 3600));
  response.cookies.delete(COOKIE_NAMES.pendingOnboarding);
  return response;
}
