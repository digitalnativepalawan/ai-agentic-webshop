import {
  Bell,
  CircleUser,
  CreditCard,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { MISSION_CONTROL_METRICS } from "@/lib/site-data";

const SIDEBAR = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Bookings", icon: CreditCard },
  { label: "AI Operators", icon: Users },
  { label: "Guests", icon: CircleUser },
  { label: "Payments", icon: CreditCard },
  { label: "Reports", icon: Search },
  { label: "Settings", icon: Settings },
];

// A gentle upward sparkline (percentages of chart height).
const SERIES = [22, 30, 26, 38, 34, 46, 42, 55, 50, 64, 60, 74, 70, 82];

export function MissionControlPreview() {
  const w = 560;
  const h = 150;
  const step = w / (SERIES.length - 1);
  const line = SERIES.map((v, i) => `${i * step},${h - (v / 100) * h}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <div className="overflow-hidden rounded-xl border border-line/25 bg-[#0b0e14]">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[12px] font-medium">
            <span className="text-crimson">merQato</span>
            <span className="text-[#c4a35a]">.digital</span>
          </span>
          <span className="text-[13px] font-medium text-white/80">Overview</span>
        </div>
        <div className="flex items-center gap-2 text-white/40">
          <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px]">Today ▾</span>
          <Search size={13} />
          <Bell size={13} />
          <CircleUser size={14} />
        </div>
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-36 shrink-0 border-r border-white/5 p-2.5 sm:block">
          {SIDEBAR.map((s) => (
            <div
              key={s.label}
              className={`mb-0.5 flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                s.active ? "bg-[#c4a35a]/10 text-[#c4a35a]" : "text-white/40"
              }`}
            >
              <s.icon size={12} />
              {s.label}
            </div>
          ))}
        </aside>

        {/* main */}
        <div className="min-w-0 flex-1 p-3.5">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {MISSION_CONTROL_METRICS.map((m) => (
              <div key={m.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <p className="text-[10px] text-white/40">{m.label}</p>
                <p className="mt-1 text-[18px] font-semibold text-white">{m.value}</p>
                <p className="mt-0.5 text-[9px] text-emerald-400">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-2.5 lg:grid-cols-[1.9fr_1fr]">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="mb-2 text-[11px] text-white/60">Performance Overview</p>
              <svg viewBox={`0 0 ${w} ${h}`} className="h-[120px] w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mcFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4a35a" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#c4a35a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={area} fill="url(#mcFill)" />
                <polyline points={line} fill="none" stroke="#c4a35a" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="mb-2 self-start text-[11px] text-white/60">Operator Utilization</p>
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#c4a35a"
                    strokeWidth="3.5"
                    strokeDasharray="97.4"
                    strokeDashoffset={97.4 * (1 - 0.68)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-white">
                  68%
                </span>
              </div>
              <p className="mt-2 text-[9px] text-emerald-400">Optimal · +6% vs last 7 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
