import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { Operator } from "./types";

export type AdminOperator = Operator & { active: boolean; displayOrder: number };

type Row = {
  id: string;
  kind: string;
  name: string;
  icon: string;
  tagline: string;
  category: string;
  badges: unknown;
  price: unknown;
  human_approval_required: boolean;
  agent_readable: boolean;
  featured: boolean;
  top_rated: boolean;
  deployment_scope: unknown;
  included_services: unknown;
  active: boolean;
  display_order: number;
};

function rowToOperator(row: Row): AdminOperator {
  return {
    id: row.id,
    kind: row.kind as Operator["kind"],
    name: row.name,
    icon: row.icon,
    tagline: row.tagline,
    category: row.category as Operator["category"],
    badges: (row.badges ?? []) as Operator["badges"],
    price: row.price as Operator["price"],
    humanApprovalRequired: row.human_approval_required,
    agentReadable: row.agent_readable,
    featured: row.featured,
    topRated: row.top_rated,
    deploymentScope: (row.deployment_scope ?? []) as string[],
    includedServices: (row.included_services ?? []) as string[],
    active: row.active,
    displayOrder: row.display_order,
  };
}

function passkeyMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSKEY;
  if (!expected) return false;
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

function requirePasskey(passkey: string) {
  if (!passkeyMatches(passkey)) {
    throw new Error("Invalid admin passkey");
  }
}

const operatorSchema = z.object({
  id: z.string().min(1).max(120),
  kind: z.enum(["operator", "setup"]),
  name: z.string().min(1).max(200),
  icon: z.string().min(1).max(80),
  tagline: z.string().min(1).max(600),
  category: z.enum([
    "hospitality",
    "booking",
    "marketing",
    "lead-gen",
    "operations",
    "mission-control",
    "local-business",
  ]),
  badges: z.array(z.object({ label: z.string().max(120), tone: z.enum(["gold", "crimson", "neutral"]) })).max(8),
  price: z.object({
    amount: z.number().int().min(0).max(10_000_000),
    currency: z.literal("PHP"),
    model: z.enum([
      "monthly_subscription",
      "one_time_setup",
      "per_day",
      "per_week",
      "per_stay",
      "per_month",
      "custom_quote",
    ]),
    suffix: z.string().max(40),
    note: z.string().max(200).optional(),
  }),
  humanApprovalRequired: z.boolean(),
  agentReadable: z.boolean(),
  featured: z.boolean().optional(),
  topRated: z.boolean().optional(),
  deploymentScope: z.array(z.string().max(160)).max(20),
  includedServices: z.array(z.string().max(240)).max(30),
  active: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(10_000).optional(),
});

// PUBLIC — visible operators only. Anyone can call.
export const listPublicOperators = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await client
    .from("operators")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Row[]).map(rowToOperator);
});

// ADMIN — all rows, passkey-gated.
export const listAllOperators = createServerFn({ method: "POST" })
  .inputValidator((input: { passkey: string }) => z.object({ passkey: z.string() }).parse(input))
  .handler(async ({ data }) => {
    requirePasskey(data.passkey);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("operators" as any)
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows as unknown as Row[]).map(rowToOperator);
  });

export const verifyAdminPasskey = createServerFn({ method: "POST" })
  .inputValidator((input: { passkey: string }) => z.object({ passkey: z.string() }).parse(input))
  .handler(async ({ data }) => ({ ok: passkeyMatches(data.passkey) }));

export const upsertOperator = createServerFn({ method: "POST" })
  .inputValidator((input: { passkey: string; operator: unknown }) =>
    z.object({ passkey: z.string(), operator: operatorSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    requirePasskey(data.passkey);
    const op = data.operator;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("operators" as any).upsert({
      id: op.id,
      kind: op.kind,
      name: op.name,
      icon: op.icon,
      tagline: op.tagline,
      category: op.category,
      badges: op.badges,
      price: op.price,
      human_approval_required: op.humanApprovalRequired,
      agent_readable: op.agentReadable,
      featured: op.featured ?? false,
      top_rated: op.topRated ?? false,
      deployment_scope: op.deploymentScope,
      included_services: op.includedServices,
      active: op.active ?? true,
      display_order: op.displayOrder ?? 0,
    } as any);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteOperator = createServerFn({ method: "POST" })
  .inputValidator((input: { passkey: string; id: string }) =>
    z.object({ passkey: z.string(), id: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    requirePasskey(data.passkey);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("operators" as any).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
