import { useEffect, useState } from "react";
import { AdminGate, useAdminAuth } from "./AdminGate";
import { useOperatorCatalog, type EditableOperator } from "@/context/OperatorCatalogContext";

export function OperatorAdminPage() {
  return (
    <AdminGate>
      <OperatorManager />
    </AdminGate>
  );
}

function OperatorManager() {
  const catalog = useOperatorCatalog();
  const { passkey, lock } = useAdminAuth();
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    catalog.loadAdmin(passkey).catch((err) => setMessage(err instanceof Error ? err.message : String(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passkey]);

  async function guarded(id: string, fn: () => Promise<void>, done: string) {
    setBusyId(id);
    setMessage("");
    try {
      await fn();
      setMessage(done);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  function addOperator() {
    const name = window.prompt("Operator name");
    if (!name) return;
    const tagline = window.prompt("Short description") || "AI operator service";
    const amount = Number(window.prompt("Monthly price in PHP", "0") || 0);
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const operator: EditableOperator = {
      id,
      kind: "operator",
      name,
      icon: "Bot",
      tagline,
      category: "hospitality",
      badges: [],
      price: { amount, currency: "PHP", model: "monthly_subscription", suffix: "/ mo" },
      humanApprovalRequired: true,
      agentReadable: true,
      featured: false,
      topRated: false,
      deploymentScope: ["1 Property"],
      includedServices: ["AI setup and training", "Human approval and safety review"],
      active: true,
      displayOrder: catalog.operators.length,
    };
    guarded(id, () => catalog.addOperator(operator, passkey), `${name} added`);
  }

  function editOperator(operator: EditableOperator) {
    const name = window.prompt("Operator name", operator.name);
    if (!name) return;
    const tagline = window.prompt("Short description", operator.tagline) || operator.tagline;
    const amount = Number(window.prompt("Price in PHP", String(operator.price.amount)) || operator.price.amount);
    const next: EditableOperator = { ...operator, name, tagline, price: { ...operator.price, amount } };
    guarded(operator.id, () => catalog.updateOperator(operator.id, next, passkey), `${name} updated`);
  }

  return (
    <div className="shell py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="font-display text-4xl font-medium">AI Operator Selection</h1>
          <p className="mt-2 text-sm text-muted">Manage which AI operators appear on the public site.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addOperator} className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b]">Add operator</button>
          <button onClick={lock} className="rounded-md border border-line px-4 py-2 text-sm">Lock</button>
        </div>
      </div>
      {message && <p className="mb-4 text-sm text-gold">{message}</p>}
      <div className="grid gap-4">
        {catalog.operators.map((operator) => {
          const busy = busyId === operator.id;
          return (
            <article key={operator.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl">{operator.name}</h2>
                <p className="mt-1 text-sm text-muted">{operator.tagline}</p>
                <p className="mt-2 text-xs text-muted">
                  ₱{operator.price.amount.toLocaleString()} {operator.price.suffix} · {operator.active === false ? "Hidden" : "Visible"} · {operator.featured ? "Featured" : "Standard"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy} onClick={() => editOperator(operator)} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50">Edit</button>
                <button
                  disabled={busy}
                  onClick={() => guarded(operator.id, () => catalog.updateOperator(operator.id, { ...operator, active: !operator.active }, passkey), operator.active ? "Hidden" : "Visible")}
                  className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  {operator.active === false ? "Show" : "Hide"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => guarded(operator.id, () => catalog.updateOperator(operator.id, { ...operator, featured: !operator.featured }, passkey), operator.featured ? "Unfeatured" : "Featured")}
                  className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  {operator.featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (!window.confirm(`Delete ${operator.name}?`)) return;
                    guarded(operator.id, () => catalog.deleteOperator(operator.id, passkey), `${operator.name} deleted`);
                  }}
                  className="rounded-md border border-crimson/40 px-3 py-2 text-sm text-crimson disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
