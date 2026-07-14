import { useQuery } from "@tanstack/react-query";
import { getMissionControlTasks } from "@/lib/missionControl";
import { StatusChip } from "@/components/site/StatusChip";
import { Rocket } from "lucide-react";

export function MissionControlQueue() {
  const { data, isLoading } = useQuery({
    queryKey: ["mc-tasks"],
    queryFn: () => getMissionControlTasks(),
    refetchInterval: 15_000,
  });
  const tasks = data ?? [];
  return (
    <div className="mt-6 rounded-xl border border-line/25 bg-surface-2/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Rocket size={15} className="text-gold" />
        <h3 className="font-display text-lg">Onboarding Queue</h3>
        <span className="text-[12px] text-muted">({tasks.length} live)</span>
      </div>
      {isLoading && <p className="text-muted">Loading…</p>}
      {!isLoading && tasks.length === 0 && (
        <p className="text-[13px] text-muted">No tasks yet. Approved KAPWA orders appear here for Mission Control Setup.</p>
      )}
      <ul className="divide-y divide-line/15">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-[14px]">{t.title}</p>
              {t.ref && <p className="text-[11px] text-faint">ref {t.ref}</p>}
            </div>
            <StatusChip tone={t.status === "done" ? "gold" : "crimson"}>{t.status}</StatusChip>
          </li>
        ))}
      </ul>
    </div>
  );
}
