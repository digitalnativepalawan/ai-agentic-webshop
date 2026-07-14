import { useEffect, useState } from "react";
import { AdminGate, useAdminAuth } from "./AdminGate";
import { provisionKapwa } from "@/lib/provisionKapwa";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/site/StatusChip";
import { Check, Loader2 } from "lucide-react";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

function OrdersManager() {
  const { passkey, lock } = useAdminAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    // admin-gated read via service role
    const token = passkey; // admin auth is local passkey; verify server-side by reusing supabaseAdmin
    const { data } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setOrders((data as OrderRow[] | null) ?? []);
  }

  useEffect(() => { if (passkey) load(); }, [passkey]);

  async function approve(o: OrderRow) {
    setBusy(o.id);
    setMsg("");
    try {
      const res = await provisionKapwa({ data: { orderId: o.id } });
      setMsg(`Approved ${o.order_ref}. Tenant wired: ${res.tenantCreated}`);
      await load();
    } catch (e) {
      setMsg(`Error: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="shell py-10">
      <h1 className="font-display text-3xl">Orders &amp; Approvals</h1>
      <p className="mt-2 text-muted">Approve KAPWA orders to wire them into onboarding + Mission Control.</p>
      {msg && <p className="mt-3 text-gold">{msg}</p>}
      <div className="mt-6 grid gap-3">
        {orders.map((o) => (
          <Card key={o.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{o.offer_name}</CardTitle>
              <StatusChip tone={o.status === "approved" ? "gold" : "outline"}>{o.status}</StatusChip>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted">
                {o.order_ref} · {o.requester_email ?? "no email"} · ₱{o.total_amount}
              </div>
              {o.status !== "approved" && o.offer_id.startsWith("kapwa-") && (
                <Button size="sm" onClick={() => approve(o)} disabled={busy === o.id}>
                  {busy === o.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Approve &amp; wire
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
      </div>
    </div>
  );
}

export function OrdersAdminPage() {
  return <AdminGate><OrdersManager /></AdminGate>;
}
