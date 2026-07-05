// Agent-facing HTTP API — the endpoints advertised in public/agent-commerce.json.
// Dispatched from src/server.ts (the fetch entry) rather than a file route so it
// does not depend on route-tree codegen. Server-only: reuses the same
// deterministic pricing + persistence as the human UI, so an agent and a human
// go through identical, human-approval-gated logic.
import { resolveOrderDraft } from "./checkout-rules";
import { CreateApprovalInput, GetOrderStatusInput } from "./checkout-schemas";

const API_PREFIX = "/v1/checkout/";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS, ...extra },
  });
}

// Best-effort fixed-window limiter. NOTE: state is per-isolate and short-lived on
// edge/serverless runtimes, so this only blunts a single client hammering one
// instance — back it with Cloudflare KV/Durable Objects or a Supabase counter
// for durable limits.
const RATE_LIMIT = { windowMs: 60_000, max: 20 };
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(request: Request): boolean {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

/**
 * Handle an agent-API request, or return null if the path is not one of ours
 * (so src/server.ts falls through to normal SSR).
 */
export async function handleAgentApi(request: Request): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith(API_PREFIX)) return null;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (rateLimited(request)) {
    return json({ error: "rate_limited", message: "Too many requests. Try again shortly." }, 429, {
      "Retry-After": "60",
    });
  }

  const route = pathname.slice(API_PREFIX.length).replace(/\/+$/, "");

  try {
    if (route === "request-approval") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      return await handleRequestApproval(request);
    }
    if (route.startsWith("status/")) {
      if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
      return handleStatus(route.slice("status/".length));
    }
    return json({ error: "not_found" }, 404);
  } catch (error) {
    console.error("[agent-api]", error);
    return json({ error: "internal_error" }, 500);
  }
}

async function handleRequestApproval(request: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const parsed = CreateApprovalInput.safeParse(raw);
  if (!parsed.success) {
    return json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }

  const draft = resolveOrderDraft(parsed.data.offerId);
  if (!draft) {
    return json({ error: "unknown_offer", offerId: parsed.data.offerId }, 404);
  }

  const { insertOrderFromDraft } = await import("./orders.server");
  const order = await insertOrderFromDraft({
    draft,
    requester: {
      name: parsed.data.requesterName,
      email: parsed.data.requesterEmail,
      notes: parsed.data.notes,
    },
    channel: "agent",
    userId: null,
  });

  return json(
    {
      orderId: order.orderId,
      orderRef: order.orderRef,
      status: order.status,
      offer: { id: draft.offerId, name: order.offerName, kind: order.offerKind },
      total: { amount: order.totalAmount, currency: order.currency },
      requiresQuote: order.requiresQuote,
      humanApprovalRequired: true,
      statusEndpoint: `${API_PREFIX}status/${order.orderId}`,
      message: "No payment will be processed until human approval.",
    },
    201,
  );
}

async function handleStatus(orderId: string): Promise<Response> {
  const parsed = GetOrderStatusInput.safeParse({ orderId });
  if (!parsed.success) {
    return json({ error: "invalid_order_id" }, 400);
  }

  const { getOrderStatusById } = await import("./orders.server");
  const order = await getOrderStatusById(parsed.data.orderId);
  if (!order) return json({ error: "not_found" }, 404);

  return json({
    orderId: order.orderId,
    orderRef: order.orderRef,
    status: order.status,
    offer: { name: order.offerName },
    total: { amount: order.totalAmount, currency: order.currency },
    createdAt: order.createdAt,
    humanApprovalRequired: true,
  });
}
