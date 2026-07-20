import { useEffect, useState } from "react";
import { AdminGate, useAdminAuth } from "./AdminGate";
import { OperatorDeleteDialog } from "./OperatorDeleteDialog";
import { OperatorEditorDialog } from "./OperatorEditorDialog";
import { useOperatorCatalog, type EditableOperator } from "@/context/OperatorCatalogContext";
import { useOperatorMedia } from "@/hooks/useOperatorMedia";
import { getOpenRouterKey, setOpenRouterKey } from "@/lib/openrouterKey";

function blankOperator(order: number): EditableOperator {
  return {
    id: "",
    kind: "operator",
    name: "",
    icon: "Bot",
    tagline: "",
    category: "hospitality",
    badges: [],
    price: { amount: 0, currency: "PHP", model: "monthly_subscription", suffix: "/ mo" },
    humanApprovalRequired: true,
    agentReadable: true,
    featured: false,
    topRated: false,
    deploymentScope: [],
    includedServices: [],
    active: true,
    displayOrder: order,
  };
}

export function OperatorAdminPage() {
  return (
    <AdminGate>
      <OperatorManager />
    </AdminGate>
  );
}

function OperatorManager() {
  const catalog = useOperatorCatalog();
  const mediaCatalog = useOperatorMedia();
  const { passkey, lock } = useAdminAuth();
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditableOperator | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EditableOperator | null>(null);
  const [orKey, setOrKey] = useState(getOpenRouterKey());

  useEffect(() => {
    catalog.loadAdmin(passkey).catch((error) => setMessage(error instanceof Error ? error.message : String(error)));
  }, [passkey]);

  async function guarded(id: string, action: () => Promise<void>, done: string) {
    setBusyId(id);
    setMessage("");
    try {
      await action();
      setMessage(done);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function saveOperator(operator: EditableOperator) {
    const originalId = editing?.id;
    if (isNew) await catalog.addOperator(operator, passkey);
    else await catalog.updateOperator(originalId ?? operator.id, operator, passkey);
    setEditing(null);
    setMessage(`${operator.name} saved`);
  }

  const editingMedia = editing
    ? mediaCatalog.media.filter((item) => item.operatorId === editing.id).sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <div className="shell py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="font-display text-4xl font-medium">AI Operator Selection</h1>
          <p className="mt-2 text-sm text-muted">Manage complete operator details, pricing, visibility, screenshots, and video.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsNew(true); setEditing(blankOperator(catalog.operators.length)); }}
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b]"
          >
            Add operator
          </button>
          <button onClick={lock} className="rounded-md border border-line px-4 py-2 text-sm">Lock</button>
        </div>
      </div>

      {message && <p className="mb-4 rounded-md border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-gold">{message}</p>}

      <div className="card flex flex-col gap-3 p-5 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <p className="eyebrow !mb-1.5">OpenRouter API key</p>
          <p className="mb-2 text-sm text-muted">
            Powers the live Prompt Engineer &amp; Resort Growth widgets on the site. Stored in this browser only
            (localStorage) — partners play without ever seeing the key.
          </p>
          <input
            type="password"
            value={orKey}
            onChange={(e) => setOrKey(e.target.value)}
            placeholder="sk-or-..."
            className="focus-ring w-full max-w-md rounded-md border border-line/25 bg-bg/60 px-3 py-2 font-mono text-[12.5px] text-ink placeholder:text-faint"
          />
        </div>
        <button
          onClick={() => { setOpenRouterKey(orKey); setMessage("OpenRouter key saved for this browser."); }}
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b]"
        >
          Save key
        </button>
      </div>

      <div className="grid gap-4">
        {catalog.operators.map((operator) => {
          const busy = busyId === operator.id;
          const mediaCount = mediaCatalog.media.filter((item) => item.operatorId === operator.id).length;
          return (
            <article key={operator.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl">{operator.name}</h2>
                  {operator.featured && <span className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-gold">Featured</span>}
                  {!operator.active && <span className="rounded-full border border-crimson/30 px-2 py-0.5 text-xs text-crimson">Hidden</span>}
                </div>
                <p className="mt-1 max-w-3xl text-sm text-muted">{operator.tagline}</p>
                <p className="mt-2 text-xs text-muted">
                  Order {operator.displayOrder} · {operator.category} · ₱{operator.price.amount.toLocaleString()} {operator.price.suffix} · {mediaCount} media
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy} onClick={() => { setIsNew(false); setEditing(operator); }} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50">Edit</button>
                <button disabled={busy} onClick={() => guarded(operator.id, () => catalog.updateOperator(operator.id, { ...operator, active: !operator.active }, passkey), operator.active ? "Operator hidden" : "Operator visible")} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50">{operator.active ? "Hide" : "Show"}</button>
                <button disabled={busy} onClick={() => guarded(operator.id, () => catalog.updateOperator(operator.id, { ...operator, featured: !operator.featured }, passkey), operator.featured ? "Operator unfeatured" : "Operator featured")} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50">{operator.featured ? "Unfeature" : "Feature"}</button>
                <button disabled={busy} onClick={() => setDeleteTarget(operator)} className="rounded-md border border-crimson/40 px-3 py-2 text-sm text-crimson disabled:opacity-50">Delete</button>
              </div>
            </article>
          );
        })}
      </div>

      <OperatorEditorDialog
        operator={editing}
        isNew={isNew}
        passkey={passkey}
        media={editingMedia}
        onMediaChange={() => mediaCatalog.refresh()}
        onClose={() => setEditing(null)}
        onSave={saveOperator}
      />

      <OperatorDeleteDialog
        operator={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={(operator) => {
          setDeleteTarget(null);
          guarded(operator.id, () => catalog.deleteOperator(operator.id, passkey), `${operator.name} deleted`);
        }}
      />
    </div>
  );
}
