import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { getGoogleDriveAuthUrl, isGoogleDriveConfigured } from "@/lib/google-drive";

export async function GET(request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!isGoogleDriveConfigured()) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env.local" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") || "/admin/courses";

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/admin/drive/callback`;

  const authUrl = getGoogleDriveAuthUrl(redirectUri, encodeURIComponent(returnTo));
  return NextResponse.redirect(authUrl);
}
