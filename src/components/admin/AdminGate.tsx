import { createContext, useContext, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { verifyAdminPasskey } from "@/lib/operators.functions";
import { useOperatorCatalog } from "@/context/OperatorCatalogContext";

const SESSION_KEY = "merqato.operator-admin.passkey";

type AdminAuthValue = { passkey: string; lock: () => void };
const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminGate");
  return ctx;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const verify = useServerFn(verifyAdminPasskey);
  const catalog = useOperatorCatalog();
  const [passkey, setPasskey] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null,
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (passkey) {
    return (
      <AdminAuthContext.Provider value={{ passkey, lock: () => { sessionStorage.removeItem(SESSION_KEY); setPasskey(null); } }}>
        {children}
      </AdminAuthContext.Provider>
    );
  }

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-16">
      <form
        className="card w-full max-w-md p-7"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const { ok } = await verify({ data: { passkey: input } });
            if (!ok) {
              setError("Incorrect passkey");
              return;
            }
            sessionStorage.setItem(SESSION_KEY, input);
            await catalog.loadAdmin(input);
            setPasskey(input);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify");
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="eyebrow">Admin access</p>
        <h1 className="font-display text-4xl font-medium">AI Operator Admin</h1>
        <p className="mt-3 text-sm text-muted">
          Enter the admin passkey to manage the operators shown on the site.
        </p>
        <input
          className="input mt-6 w-full"
          type="password"
          inputMode="numeric"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Passkey"
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-crimson">{error}</p>}
        <button
          disabled={busy}
          className="focus-ring mt-4 w-full rounded-md bg-gold px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-60"
        >
          {busy ? "Verifying…" : "Unlock admin"}
        </button>
      </form>
    </div>
  );
}
