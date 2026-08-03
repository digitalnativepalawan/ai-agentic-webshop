import { CheckCircle2, RefreshCw } from "lucide-react";

import type { PostizIntegration } from "@/lib/postiz.schemas";

function platformLabel(identifier: string) {
  if (identifier === "facebook") return "Facebook Page";
  if (identifier.startsWith("instagram")) return "Instagram";
  return identifier;
}

export function SocialConnections({
  integrations,
  busy,
  lastSync,
  onRefresh,
}: {
  integrations: PostizIntegration[];
  busy: boolean;
  lastSync: string | null;
  onRefresh: () => void;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Connected accounts</p>
          <h2 className="font-display text-2xl font-medium">Postiz channels</h2>
          <p className="mt-1 text-sm text-muted">
            OAuth connections stay in Postiz. MerQato reads only the channels already authorized
            there.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={busy}
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-gold/30 px-3 py-2 text-sm text-gold disabled:opacity-50"
        >
          <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
          Refresh accounts
        </button>
      </div>

      {lastSync ? (
        <p className="mt-3 font-mono text-[11px] text-faint">
          Last successful sync:{" "}
          {new Date(lastSync).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {integrations.map((integration) => (
          <article
            key={integration.id}
            className="rounded-xl border border-line/20 bg-surface-2/35 p-4"
          >
            <div className="flex items-start gap-3">
              {integration.picture ? (
                <img
                  src={integration.picture}
                  alt=""
                  className="h-11 w-11 rounded-full border border-line/20 object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 font-display text-xl text-gold">
                  {integration.identifier === "facebook" ? "f" : "◎"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-medium text-ink">{integration.name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                      integration.disabled
                        ? "bg-crimson/10 text-crimson"
                        : "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    <CheckCircle2 size={10} /> {integration.disabled ? "Disabled" : "Connected"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {platformLabel(integration.identifier)}
                  {integration.profile ? ` · @${integration.profile.replace(/^@/, "")}` : ""}
                </p>
                <p className="mt-2 break-all font-mono text-[10px] text-faint">
                  Integration ID: {integration.id}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!busy && integrations.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-gold/25 p-5 text-center text-sm text-muted">
          No connected Facebook or Instagram accounts were returned by Postiz. Connect them in
          Postiz, then refresh here.
        </div>
      ) : null}
    </section>
  );
}
