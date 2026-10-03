import { NextResponse } from "next/server";
import { query, execute, isDbConfigured } from "@/lib/db";
import {
  signJwt,
  COOKIE_NAMES,
  getCookieOptions,
} from "@/lib/auth-server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const mock = searchParams.get("mock");
  const targetUrl = state ? decodeURIComponent(state) : "/account";

  let googleUser = null;

  if (mock === "true") {
    // Development mock profile
    const randomId = Math.floor(100000 + Math.random() * 900000);
    googleUser = {
      sub: `mock_google_${randomId}`,
      email: `learner${randomId}@example.com`,
      name: `Learner ${randomId}`,
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    };
  } else {
    if (!code) {
      return NextResponse.redirect(new URL("/login?error=auth_cancelled", request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    try {
      // 1. Exchange code for token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error("Failed to exchange Google OAuth code:", errorText);
        return NextResponse.redirect(new URL("/login?error=oauth_exchange_failed", request.url));
      }

      const tokenData = await tokenRes.json();

      // 2. Fetch user profile
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        return NextResponse.redirect(new URL("/login?error=oauth_profile_failed", request.url));
      }

      googleUser = await userRes.json();
    } catch (err) {
      console.error("Google auth error:", err);
      return NextResponse.redirect(new URL("/login?error=server_error", request.url));
    }
  }

  const { sub: googleId, email, name, picture: avatarUrl } = googleUser;

  // 3. Database check
  if (isDbConfigured()) {
    try {
      const rows = await query(
        "SELECT id, google_id, email, name, avatar_url, phone, status FROM users WHERE google_id = ? OR email = ? LIMIT 1",
        [googleId, email]
      );

      const existingUser = rows[0];

      // If user exists and has a phone number -> direct login!
      if (existingUser && existingUser.phone && existingUser.phone.trim().length >= 10) {
        if (existingUser.status === "suspended") {
          return NextResponse.redirect(new URL("/login?error=account_suspended", request.url));
        }

        // Update last login
        await execute(
          "UPDATE users SET last_login_at = NOW(), avatar_url = COALESCE(?, avatar_url) WHERE id = ?",
          [avatarUrl, existingUser.id]
        );

        const userPayload = {
          id: existingUser.id,
          googleId: existingUser.google_id,
          email: existingUser.email,
          name: existingUser.name,
          phone: existingUser.phone,
          avatarUrl: existingUser.avatar_url || avatarUrl,
        };

        const sessionToken = await signJwt({ user: userPayload }, "30d");
        const response = NextResponse.redirect(new URL(targetUrl, request.url));
        response.cookies.set(COOKIE_NAMES.userSession, sessionToken, getCookieOptions(30 * 24 * 3600));
        response.cookies.delete(COOKIE_NAMES.pendingOnboarding);
        return response;
      }
    } catch (dbErr) {
      console.error("Database lookup error during Google auth:", dbErr);
    }
  }

  // User is signing in for the first time OR phone number is missing!
  // Save pending profile in a short-lived signed cookie and redirect to phone onboarding.
  const pendingToken = await signJwt(
    {
      profile: {
        googleId,
        email,
        name,
        avatarUrl,
        targetUrl,
      },
    },
    "15m"
  );

  const onboardingUrl = new URL("/auth/complete-profile", request.url);
  const response = NextResponse.redirect(onboardingUrl);
  response.cookies.set(COOKIE_NAMES.pendingOnboarding, pendingToken, getCookieOptions(15 * 60));
  return response;
}
