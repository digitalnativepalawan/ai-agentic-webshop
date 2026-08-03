import { CheckCircle2, KeyRound, Link2, RefreshCw, Server, XCircle } from "lucide-react";

export type PostizConnectionState = {
  connected: boolean;
  urlConfigured: boolean;
  apiKeyConfigured: boolean;
  host: string | null;
  checkedAt: string | null;
  integrationCount: number;
};

export function PostizConnection({
  state,
  busy,
  error,
  onTest,
}: {
  state: PostizConnectionState;
  busy: boolean;
  error: string;
  onTest: () => void;
}) {
  const items = [
    {
      label: "Postiz URL",
      ok: state.urlConfigured,
      detail: state.host ?? "Not configured",
      icon: Server,
    },
    {
      label: "API key",
      ok: state.apiKeyConfigured,
      detail: state.apiKeyConfigured ? "Configured securely" : "Not configured",
      icon: KeyRound,
    },
    {
      label: "Public API v1",
      ok: state.connected,
      detail: state.connected ? `${state.integrationCount} integration(s) reachable` : "Not tested",
      icon: Link2,
    },
  ];

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Postiz connection</p>
          <h2 className="font-display text-2xl font-medium">Publishing backend</h2>
          <p className="mt-1 text-sm text-muted">
            Uses the self-hosted Postiz Public API v1. The API key is never returned to the browser.
          </p>
        </div>
        <button
          type="button"
          onClick={onTest}
          disabled={busy}
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b] disabled:opacity-50"
        >
          <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
          {busy ? "Testing…" : "Test connection"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map(({ label, ok, detail, icon: Icon }) => (
          <article key={label} className="rounded-xl border border-line/20 bg-surface-2/35 p-4">
            <div className="flex items-center justify-between">
              <Icon size={17} className="text-gold" />
              {ok ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : (
                <XCircle size={16} className="text-crimson" />
              )}
            </div>
            <p className="mt-4 text-sm font-medium text-ink">{label}</p>
            <p className="mt-1 text-xs text-muted">{detail}</p>
          </article>
        ))}
      </div>

      {state.checkedAt ? (
        <p className="mt-4 font-mono text-[11px] text-faint">
          Last successful test:{" "}
          {new Date(state.checkedAt).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-md border border-crimson/30 bg-crimson/5 px-3 py-2 text-sm text-crimson">
          {error}
        </p>
      ) : null}
    </section>
  );
}
