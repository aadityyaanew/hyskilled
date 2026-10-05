import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/account";
  const mock = searchParams.get("mock");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;

  // Dev convenience: if user clicks mock or if Google client ID is not configured yet
  if (!clientId || mock === "true") {
    // If not configured and not explicit mock, redirect to login with a notice
    if (!clientId && mock !== "true") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "google_credentials_missing");
      loginUrl.searchParams.set("next", next);
      return NextResponse.redirect(loginUrl);
    }

    // Mock Google sign-in for testing phone onboarding when credentials aren't set
    const mockCallbackUrl = new URL("/api/auth/google/callback", request.url);
    mockCallbackUrl.searchParams.set("mock", "true");
    mockCallbackUrl.searchParams.set("state", encodeURIComponent(next));
    return NextResponse.redirect(mockCallbackUrl);
  }

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "online");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", encodeURIComponent(next));

  return NextResponse.redirect(googleAuthUrl);
}
