import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(message, { status = 500, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Minimal fetch wrapper used by every service.
 * Create one client per backend (internal Next.js routes, external REST API,
 * admin API …) so auth headers / base URLs stay isolated.
 */
export function createApiClient({ baseUrl = "", getHeaders } = {}) {
  async function request(path, { method = "GET", body, query, headers, ...init } = {}) {
    const url = new URL(
      `${baseUrl.replace(/\/$/, "")}${path}`,
      typeof window === "undefined" ? env.siteUrl : window.location.origin
    );
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
      });
    }

    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(getHeaders ? await getHeaders() : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      throw new ApiError(data?.message ?? res.statusText ?? "Request failed", {
        status: res.status,
        data,
      });
    }
    return data;
  }

  return {
    get: (path, opts) => request(path, { ...opts, method: "GET" }),
    post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
    put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
    patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
    delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
  };
}

/** Next.js route handlers under /api (same origin). */
export const internalApi = createApiClient({ baseUrl: "/api" });

/**
 * The future backend (NestJS / Laravel / Django …). Until NEXT_PUBLIC_API_URL
 * is set, services fall back to the mock data layer in /src/data.
 */
export const backendApi = createApiClient({ baseUrl: env.apiUrl });
export const hasBackend = Boolean(env.apiUrl);
