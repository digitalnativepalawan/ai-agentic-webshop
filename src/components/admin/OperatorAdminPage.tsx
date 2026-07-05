import { useState } from "react";
import { AdminGate, lockOperatorAdmin } from "./AdminGate";
import { useOperatorCatalog } from "@/context/OperatorCatalogContext";
import type { Operator } from "@/lib/types";

export function OperatorAdminPage() {
  return <AdminGate><OperatorManager /></AdminGate>;
}

function OperatorManager() {
  const catalog = useOperatorCatalog();
  const [message, setMessage] = useState("");

  function addOperator() {
    const name = window.prompt("Operator name");
    if (!name) return;
    const tagline = window.prompt("Short description") || "AI operator service";
    const amount = Number(window.prompt("Monthly price in PHP", "0") || 0);
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const operator: Operator & { active?: boolean; displayOrder?: number } = {
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
      deploymentScope: ["1 Property"],
      includedServices: ["AI setup and training", "Human approval and safety review"],
      active: true,
      displayOrder: catalog.operators.length,
    };
    catalog.addOperator(operator);
    setMessage(`${name} added`);
  }

  function editOperator(operator: Operator & { active?: boolean; displayOrder?: number }) {
    const name = window.prompt("Operator name", operator.name);
    if (!name) return;
    const tagline = window.prompt("Short description", operator.tagline) || operator.tagline;
    const amount = Number(window.prompt("Price in PHP", String(operator.price.amount)) || operator.price.amount);
    catalog.updateOperator(operator.id, { ...operator, name, tagline, price: { ...operator.price, amount } });
    setMessage(`${name} updated`);
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
          <button onClick={lockOperatorAdmin} className="rounded-md border border-line px-4 py-2 text-sm">Lock</button>
        </div>
      </div>
      {message && <p className="mb-4 text-sm text-gold">{message}</p>}
      <div className="grid gap-4">
        {catalog.operators.map((operator) => (
          <article key={operator.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl">{operator.name}</h2>
              <p className="mt-1 text-sm text-muted">{operator.tagline}</p>
              <p className="mt-2 text-xs text-muted">₱{operator.price.amount.toLocaleString()} {operator.price.suffix} · {operator.active === false ? "Hidden" : "Visible"} · {operator.featured ? "Featured" : "Standard"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => editOperator(operator)} className="rounded-md border border-line px-3 py-2 text-sm">Edit</button>
              <button onClick={() => catalog.updateOperator(operator.id, { ...operator, active: operator.active === false })} className="rounded-md border border-line px-3 py-2 text-sm">{operator.active === false ? "Show" : "Hide"}</button>
              <button onClick={() => catalog.updateOperator(operator.id, { ...operator, featured: !operator.featured })} className="rounded-md border border-line px-3 py-2 text-sm">{operator.featured ? "Unfeature" : "Feature"}</button>
              <button onClick={() => catalog.deleteOperator(operator.id)} className="rounded-md border border-crimson/40 px-3 py-2 text-sm text-crimson">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
