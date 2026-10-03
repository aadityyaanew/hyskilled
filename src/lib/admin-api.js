import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";

/**
 * Validate admin session for API routes.
 * Returns { admin, errorResponse }
 */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      admin: null,
      errorResponse: NextResponse.json(
        { success: false, message: "Unauthorized. Admin authentication required." },
        { status: 401 }
      ),
    };
  }
  return { admin, errorResponse: null };
}

/**
 * Clean slugify string
 */
export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Safely parse JSON or return default
 */
export function safeJsonParse(data, fallback = null) {
  if (data === null || data === undefined) return fallback;
  if (typeof data === "object") return data;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}
