// Baseline HTTP security headers applied to every SSR response (see server.ts).
//
// Framing protection (X-Frame-Options / CSP `frame-ancestors`) is intentionally
// omitted: this app is rendered inside the Lovable editor's preview iframe, and a
// DENY/SAMEORIGIN policy would break it. Enforce framing protection at your
// production edge/CDN (Cloudflare/Vercel), where the app is never framed.

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // TanStack Start injects an inline hydration script and shadcn/ui charts inject
  // an inline <style>. 'unsafe-inline' is required until a per-request nonce is
  // threaded through both. Tighten to a nonce before promoting to enforcing.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // Supabase REST / Auth / Realtime.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

export const SECURITY_HEADERS: Record<string, string> = {
  // Rolled out in Report-Only so it can never break SSR hydration or the Lovable
  // preview. Confirm there are no violations in your deployment, then rename this
  // key to "Content-Security-Policy" to enforce it.
  "Content-Security-Policy-Report-Only": CONTENT_SECURITY_POLICY,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  // Ignored by browsers over plain HTTP, enforced over HTTPS.
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

/**
 * Returns a response carrying the baseline security headers. Rebuilds the
 * response so the header set is guaranteed mutable across runtimes (a Response
 * returned from a subrequest can be header-immutable); the body stream is reused.
 */
export function withSecurityHeaders(response: Response): Response {
  const next = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    next.headers.set(name, value);
  }
  return next;
}
