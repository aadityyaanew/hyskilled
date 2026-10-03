import { NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/lib/auth-server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAMES.userSession);
  return response;
}
