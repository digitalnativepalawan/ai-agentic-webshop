import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Bot, LockKeyhole, Radio } from "lucide-react";

export type AdminServiceStatus = {
  ai: {
    state: "idle" | "checking" | "connected" | "failed";
    label: string;
    checkedAt?: string | null;
  };
  postiz: {
    state: "idle" | "checking" | "connected" | "failed";
    label: string;
    checkedAt?: string | null;
  };
  activityCount: number;
};

const DEFAULT_STATUS: AdminServiceStatus = {
  ai: { state: "idle", label: "AI not checked" },
  postiz: { state: "idle", label: "Postiz not checked" },
  activityCount: 0,
};

const AdminShellContext = createContext<{
  status: AdminServiceStatus;
  setStatus: (status: AdminServiceStatus) => void;
} | null>(null);

export function useAdminShellStatus() {
  const context = useContext(AdminShellContext);
  if (!context) throw new Error("useAdminShellStatus must be inside AdminShell");
  return context;
}

function statusClass(state: AdminServiceStatus["ai"]["state"]) {
  if (state === "connected") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
  if (state === "failed") return "border-crimson/30 bg-crimson/5 text-crimson";
  return "border-line/25 bg-surface-2/40 text-muted";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const workspace = useMemo(() => {
    if (pathname.startsWith("/admin/social-media")) return "Social Media Operator";
    if (pathname.startsWith("/admin/orders")) return "Orders";
    return "Operator Admin";
  }, [pathname]);

  return (
    <AdminShellContext.Provider value={{ status, setStatus }}>
      <div className="min-h-screen bg-bg text-ink">
        <header className="sticky top-0 z-40 border-b border-line/20 bg-bg/95 backdrop-blur-sm">
          <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link
              to="/admin/operators"
              className="focus-ring mr-auto flex items-center gap-3 rounded-md"
            >
              <span className="font-display text-2xl">
                <span className="text-ink">mer</span>
                <span className="text-gold">Q</span>
                <span className="text-ink">ato</span>
              </span>
              <span className="hidden border-l border-line/25 pl-3 sm:block">
                <span className="block font-mono text-[9px] uppercase tracking-[0.17em] text-gold">
                  Operator Console
                </span>
                <span className="block text-xs text-muted">{workspace}</span>
              </span>
            </Link>

            {pathname.startsWith("/admin/social-media") ? (
              <div className="hidden items-center gap-2 lg:flex">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${statusClass(status.ai.state)}`}
                >
                  <Bot size={11} /> {status.ai.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${statusClass(status.postiz.state)}`}
                >
                  <Radio size={11} /> {status.postiz.label}
                </span>
              </div>
            ) : null}

            <span
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-line/25 text-muted"
              title="Recent operator activity"
            >
              <Bell size={15} />
              {status.activityCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-gold px-1 text-center text-[9px] font-medium text-[#0b0b0b]">
                  {Math.min(status.activityCount, 9)}
                </span>
              ) : null}
            </span>
            <Link
              to="/admin/operators"
              className="focus-ring rounded-md border border-line/25 px-3 py-2 text-xs text-muted hover:text-ink"
            >
              Operator Admin
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("merqato-admin-lock"))}
              className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-gold/30 px-3 py-2 text-xs text-gold"
            >
              <LockKeyhole size={13} /> Lock
            </button>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-line/15 px-4 py-3 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
          merQato operator console · development authentication · human approval required
        </footer>
      </div>
    </AdminShellContext.Provider>
  );
}
