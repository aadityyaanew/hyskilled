import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import {
  isGoogleDriveConfigured,
  getGoogleDriveRefreshToken,
  getGoogleDriveApiKey,
} from "@/lib/google-drive";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = isGoogleDriveConfigured();
  const refreshToken = await getGoogleDriveRefreshToken();
  const apiKey = getGoogleDriveApiKey();
  const connected = Boolean(configured && refreshToken);

  return NextResponse.json({
    configured,
    connected,
    hasApiKey: Boolean(apiKey),
  });
}

