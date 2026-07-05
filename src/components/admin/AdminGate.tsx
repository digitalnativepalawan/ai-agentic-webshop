import { useState, type ReactNode } from "react";

const SESSION_KEY = "merqato.operator-admin.unlocked";
const configuredPasskey = import.meta.env.VITE_OPERATOR_ADMIN_PASSKEY as string | undefined;

export function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "yes",
  );
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");

  if (unlocked) return <>{children}</>;

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-16">
      <form
        className="card w-full max-w-md p-7"
        onSubmit={(event) => {
          event.preventDefault();
          if (!configuredPasskey) {
            setError("Admin passkey is not configured.");
            return;
          }
          if (passkey !== configuredPasskey) {
            setError("Incorrect passkey");
            return;
          }
          sessionStorage.setItem(SESSION_KEY, "yes");
          setUnlocked(true);
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
          value={passkey}
          onChange={(event) => setPasskey(event.target.value)}
          placeholder="Passkey"
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-crimson">{error}</p>}
        <button className="focus-ring mt-4 w-full rounded-md bg-gold px-4 py-3 text-sm font-medium text-[#0b0b0b]">
          Unlock admin
        </button>
      </form>
    </div>
  );
}

export function lockOperatorAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.reload();
}
