import { CheckCircle2, KeyRound, Link2, RefreshCw, Server, XCircle } from "lucide-react";

export type PostizConnectionState = {
  connected: boolean;
  authenticated: boolean;
  urlConfigured: boolean;
  apiKeyConfigured: boolean;
  host: string | null;
  endpoint: string;
  checkedAt: string | null;
  failedAt: string | null;
  integrationCount: number;
  facebookConnected: boolean;
  instagramConnected: boolean;
  error: { status: number | null; message: string; likelyCause: string } | null;
};

export function PostizConnection({
  state,
  busy,
  onTest,
}: {
  state: PostizConnectionState;
  busy: boolean;
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
      label: "Authenticated API",
      ok: state.authenticated,
      detail: state.authenticated ? "API key accepted" : "Not authenticated",
      icon: KeyRound,
    },
    {
      label: "Public API v1",
      ok: state.connected,
      detail: state.connected
        ? `${state.integrationCount} integration(s) reachable`
        : state.endpoint,
      icon: Link2,
    },
    {
      label: "Facebook",
      ok: state.facebookConnected,
      detail: state.facebookConnected ? "Connected integration visible" : "Not returned",
      icon: Link2,
    },
    {
      label: "Instagram",
      ok: state.instagramConnected,
      detail: state.instagramConnected ? "Connected integration visible" : "Not returned",
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
            Runs a real authenticated test against the self-hosted Public API v1. The API key never
            enters the browser.
          </p>
        </div>
        <button
          type="button"
          onClick={onTest}
          disabled={busy}
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b] disabled:opacity-50"
        >
          <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
          {busy ? "Testing…" : state.connected ? "Test again" : "Test connection"}
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
            <p className="mt-4 text-sm font-medium">{label}</p>
            <p className="mt-1 break-words text-xs text-muted">{detail}</p>
          </article>
        ))}
      </div>
      {state.checkedAt ? (
        <p className="mt-4 font-mono text-[11px] text-faint">
          Exact successful test:{" "}
          {new Date(state.checkedAt).toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            dateStyle: "long",
            timeStyle: "medium",
          })}{" "}
          Asia/Manila
        </p>
      ) : null}
      {state.error ? (
        <div className="mt-4 rounded-md border border-crimson/30 bg-crimson/5 p-4 text-sm text-crimson">
          <p className="font-medium">
            Connection failed{state.error.status ? ` · HTTP ${state.error.status}` : ""}
          </p>
          <p className="mt-1">Endpoint: {state.endpoint}</p>
          <p className="mt-1">{state.error.message}</p>
          <p className="mt-2 text-xs">Likely cause: {state.error.likelyCause}</p>
          <button
            type="button"
            onClick={onTest}
            disabled={busy}
            className="mt-3 rounded-md border border-crimson/30 px-3 py-2 text-xs"
          >
            Retry
          </button>
        </div>
      ) : null}
    </section>
  );
}
