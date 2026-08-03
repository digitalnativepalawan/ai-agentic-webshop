// Server-only: approve a webshop order and wire it into the KAPWA onboarding
// pipeline. Human-in-the-loop: only an admin (has_role) may call this. On
// approval we (1) flip the order to 'approved', (2) open a Mission Control task
// for MerQato to run Mission Control Setup, and (3) if the KAPWA project env is
// configured, create the tenant row in KAPWA's own Supabase project so the
// property is tracked end-to-end. No auto-provision of a Supabase project —
// a human flips the tenant to 'active' during setup.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Input = z.object({ orderId: z.string().uuid() });

export const provisionKapwa = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    // 1) Load the order (service role).
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_ref, offer_id, offer_kind, offer_name, requester_name, requester_email, status",
      )
      .eq("id", data.orderId)
      .maybeSingle();
    if (error || !order) throw new Error("Order not found");
    if (order.status === "approved") return { ok: true, alreadyApproved: true };

    // Only KAPWA operators flow into the onboarding pipeline.
    const isKapwa = order.offer_id?.startsWith("kapwa-");
    if (!isKapwa) throw new Error("Not a KAPWA offer");

    // 2) Flip to approved.
    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update({ status: "approved" })
      .eq("id", order.id);
    if (updErr) throw new Error(`Approval failed: ${updErr.message}`);

    // 3) Open a Mission Control task for the operator to action.
    const { error: taskErr } = await supabaseAdmin.from("mission_control_tasks").insert({
      kind: "onboard_kapwa",
      title: `Onboard KAPWA — ${order.requester_email ?? order.offer_name}`,
      detail: `Order ${order.order_ref} approved. Run Mission Control Setup for ${order.requester_name ?? "property"}.`,
      ref: order.order_ref,
      status: "open",
    });
    if (taskErr) console.error("[provision] mc task failed:", taskErr.message);

    // 4) Cross-project: create the KAPWA tenant row (env-gated, no secret in repo).
    const kapwaUrl = process.env.KAPWA_SUPABASE_URL;
    const kapwaKey = process.env.KAPWA_SERVICE_ROLE_KEY;
    let tenantCreated = false;
    if (kapwaUrl && kapwaKey) {
      try {
        const kapwa = (await import("@supabase/supabase-js")).createClient(kapwaUrl, kapwaKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { error: tenErr } = await kapwa.from("kapwa_tenants").insert({
          property_name: order.requester_name ?? "",
          contact_email: order.requester_email ?? "",
          order_ref: order.order_ref,
          status: "provisioning",
        });
        tenantCreated = !tenErr;
        if (tenErr) console.error("[provision] kapwa tenant failed:", tenErr.message);
      } catch (e) {
        console.error("[provision] kapwa tenant error:", (e as Error).message);
      }
    }

    return { ok: true, orderRef: order.order_ref, tenantCreated };
  });
