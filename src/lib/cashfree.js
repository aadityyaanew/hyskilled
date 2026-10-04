import { Cashfree, CFEnvironment } from "cashfree-pg";

/** Server-side Cashfree client (cashfree-pg v5+ instance API). */
export function getCashfree() {
  return new Cashfree(
    process.env.CASHFREE_ENV === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.NEXT_PUBLIC_CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
  );
}
