// Thin HTTP client for consuming the Movisun API.
//
// While the real API is under construction this hits the local mock route
// handlers (src/app/api/v1). To switch to the real API: set API_BASE_URL and
// delete src/app/api/v1/. No page/component code changes are required — the
// data-access functions in src/api/* are the only seam.

export const API_BASE_URL =
  process.env.API_BASE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export class ApiError extends Error {
  constructor(
    public status: number,
    path: string,
  ) {
    super(`GET ${path} → ${status}`);
  }
}

interface HttpOptions {
  revalidate?: number;
  signal?: AbortSignal;
}

/** GET + parse JSON. Server-side by default (pages are Server Components). */
export async function httpGet<T>(path: string, opts: HttpOptions = {}): Promise<T> {
  const { revalidate = 60, signal } = opts;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate },
    signal,
  });
  if (!res.ok) throw new ApiError(res.status, path);
  return res.json() as Promise<T>;
}