/**
 * In-memory sliding-window rate limiter.
 * Works in Node.js runtime (API routes). Not shared across serverless instances,
 * but provides meaningful protection against single-origin abuse.
 *
 * Usage:
 *   const result = rateLimit(ip, "login", 5, 60_000);
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface Window {
  count: number;
  resetAt: number;
}

// key → sliding window
const store = new Map<string, Window>();

// Cleanup stale entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, win]) => {
    if (now > win.resetAt) store.delete(key);
  });
}, 5 * 60 * 1000);

/**
 * @param identifier  IP address or user id
 * @param action      namespace so limits don't cross routes (e.g. "register", "order")
 * @param limit       max allowed requests per window
 * @param windowMs    window duration in milliseconds
 */
export function rateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${action}:${identifier}`;
  const now = Date.now();

  let win = store.get(key);

  if (!win || now > win.resetAt) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(key, win);
  }

  win.count += 1;
  const remaining = Math.max(0, limit - win.count);
  const allowed = win.count <= limit;

  return { allowed, remaining, resetAt: win.resetAt };
}

/**
 * Extract the real client IP from Next.js request headers.
 * Falls back to a generic string so the limiter still works.
 */
export function getClientIp(req: Request): string {
  const headers = (req as any).headers as Headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
