import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default_hyskilled_dev_auth_secret_key_32_bytes_min!"
);

export const COOKIE_NAMES = {
  userSession: "hy_user_session",
  adminSession: "hy_admin_session",
  pendingOnboarding: "hy_pending_onboarding",
};

/**
 * Sign a JWT token
 */
export async function signJwt(payload, expiresIn = "30d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

/**
 * Verify a JWT token
 */
export async function verifyJwt(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get current logged in user from cookies (Server Component / Route Handler)
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.userSession)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.user ?? null;
}

/**
 * Get current logged in admin from cookies
 */
export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.adminSession)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.admin ?? null;
}

/**
 * Get pending onboarding profile (Google profile awaiting phone number)
 */
export async function getPendingOnboarding() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.pendingOnboarding)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.profile ?? null;
}

/**
 * Cookie options helper
 */
export function getCookieOptions(maxAgeSeconds = 30 * 24 * 3600) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
