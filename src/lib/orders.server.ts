// Server-only order persistence. Uses the service-role client (bypasses RLS),
// so this module must never reach the client bundle — it is imported only via
// dynamic import() inside server-function handlers (which are stripped from the
// client build), and the `.server.ts` suffix marks it server-only.
import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { makeOrderRef } from "./checkout-rules";
import type { OrderDraft } from "./types";

export interface OrderRequester {
  name?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface PersistedOrder {
  orderId: string;
  orderRef: string;
  status: Database["public"]["Enums"]["order_status"];
  offerName: string;
  offerKind: string;
  totalAmount: number;
  currency: string;
  requiresQuote: boolean;
}

/**
 * Insert an approval request. The price fields come solely from the
 * server-resolved `draft`; the caller's only influence on money is the offerId
 * that produced it upstream. Retries once on the (astronomically unlikely)
 * order_ref collision.
 */
export async function insertOrderFromDraft(params: {
  draft: OrderDraft;
  requester: OrderRequester;
  channel: "web" | "agent";
  userId: string | null;
}): Promise<PersistedOrder> {
  const { draft, requester, channel, userId } = params;

  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_ref: makeOrderRef(),
        channel,
        offer_id: draft.offerId,
        offer_kind: draft.offerKind,
        offer_name: draft.offerName,
        plan: draft.plan,
        line_items: draft.lineItems,
        total_amount: draft.totalAmount,
        currency: draft.currency,
        user_id: userId,
        requester_name: requester.name ?? null,
        requester_email: requester.email ?? null,
        notes: requester.notes ?? null,
      })
      .select("id, order_ref, status")
      .single();

    if (!error && data) {
      return {
        orderId: data.id,
        orderRef: data.order_ref,
        status: data.status,
        offerName: draft.offerName,
        offerKind: draft.offerKind,
        totalAmount: draft.totalAmount,
        currency: draft.currency,
        requiresQuote: draft.requiresQuote,
      };
    }

    // 23505 = unique_violation — only retry that, surface anything else.
    if (error?.code !== "23505") {
      throw new Error(`Failed to persist order: ${error?.message ?? "unknown error"}`);
    }
  }

  throw new Error("Failed to persist order: could not allocate a unique order reference");
}

export interface OrderStatusView {
  orderId: string;
  orderRef: string;
  status: Database["public"]["Enums"]["order_status"];
  offerName: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

/** Look up an order by its unguessable id (the status token handed to agents). */
export async function getOrderStatusById(orderId: string): Promise<OrderStatusView | null> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_ref, status, offer_name, total_amount, currency, created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    orderId: data.id,
    orderRef: data.order_ref,
    status: data.status,
    offerName: data.offer_name,
    totalAmount: data.total_amount,
    currency: data.currency,
    createdAt: data.created_at,
  };
}

/**
 * Best-effort resolution of the calling human's user id from the bearer token
 * that the global auth-attacher forwards. Returns null for agents/guests or any
 * verification failure — checkout never *requires* a session, it just links the
 * order to a human when one is present. Verification is real (getClaims), so a
 * forged token cannot associate an order with someone else's account.
 */
export async function resolveOptionalUserId(): Promise<string | null> {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length);
  if (token.split(".").length !== 3) return null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  try {
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getClaims(token);
    const sub = data?.claims?.sub;
    if (error || !sub) return null;
    return String(sub);
  } catch {
    return null;
  }
}
