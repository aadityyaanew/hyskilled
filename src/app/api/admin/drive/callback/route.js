import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { exchangeGoogleDriveCode } from "@/lib/google-drive";

export async function GET(request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const returnPath = state ? decodeURIComponent(state) : "/admin/courses";
  const redirectTarget = new URL(returnPath, request.url);

  if (error || !code) {
    redirectTarget.searchParams.set("drive_error", error || "authorization_cancelled");
    return NextResponse.redirect(redirectTarget);
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/admin/drive/callback`;

  try {
    await exchangeGoogleDriveCode(code, redirectUri);
    redirectTarget.searchParams.set("drive_connected", "true");
    return NextResponse.redirect(redirectTarget);
  } catch (err) {
    console.error("Google Drive OAuth exchange error:", err);
    redirectTarget.searchParams.set("drive_error", encodeURIComponent(err.message));
    return NextResponse.redirect(redirectTarget);
  }
}
