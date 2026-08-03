import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";

import { verifyAdminPasskey } from "@/lib/operators.functions";

const SESSION_KEY = "merqato.operator-admin.session.v1";

type StoredSession = { token: string; expiresAt: string };
type AdminAuthValue = { passkey: string; lock: () => void };

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null") as StoredSession | null;
    if (!value?.token || new Date(value.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return value;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be inside AdminGate");
  return context;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const verify = useServerFn(verifyAdminPasskey);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function lock() {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  useEffect(() => {
    setSession(readSession());
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    window.addEventListener("merqato-admin-lock", lock);
    if (!session) return () => window.removeEventListener("merqato-admin-lock", lock);
    const timeout = window.setTimeout(
      lock,
      Math.max(0, new Date(session.expiresAt).getTime() - Date.now()),
    );
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("merqato-admin-lock", lock);
    };
  }, [session]);

  if (!sessionChecked) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted">
        Restoring operator session…
      </div>
    );
  }

  if (session) {
    return (
      <AdminAuthContext.Provider value={{ passkey: session.token, lock }}>
        {children}
      </AdminAuthContext.Provider>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <form
        className="card w-full max-w-md p-7"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const result = await verify({ data: { passkey: input } });
            if (!result.ok) {
              setError("Incorrect passkey");
              return;
            }
            const nextSession = { token: result.sessionToken, expiresAt: result.expiresAt };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
            setSession(nextSession);
          } catch (verificationError) {
            setError(
              verificationError instanceof Error ? verificationError.message : "Failed to verify",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="eyebrow">Admin access</p>
        <h1 className="font-display text-4xl font-medium">Operator Console</h1>
        <p className="mt-3 text-sm text-muted">
          Enter the development admin passkey. Sessions expire automatically and must be replaced
          with production authentication before deployment.
        </p>
        <input
          className="input mt-6 w-full"
          type="password"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Passkey"
          autoFocus
        />
        {error ? <p className="mt-2 text-sm text-crimson">{error}</p> : null}
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
