import { internalApi } from "@/services/api-client";

/** Browser-side wrappers for the internal Next.js route handlers. */

export async function searchCoursesClient(q, { signal } = {}) {
  const data = await internalApi.get("/search", { query: { q }, signal });
  return data.results;
}

export async function validateCouponClient(code, subtotal) {
  return internalApi.post("/coupons/validate", { code, subtotal });
}
