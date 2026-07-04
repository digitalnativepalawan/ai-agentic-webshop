import { Link } from "@tanstack/react-router";
import { ArrowRight, Dot } from "lucide-react";
import type { Partnership } from "@/lib/types";
import { Icon } from "./Icon";

export function PartnershipCard({ partnership }: { partnership: Partnership }) {
  return (
    <div className="group card card-hover flex flex-col p-6 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-crimson/40 bg-crimson/[0.07] text-crimson">
        <Icon name={partnership.icon} size={22} strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-[21px] font-medium leading-tight">{partnership.name}</h3>
      {partnership.inviteOnly && (
        <span className="mx-auto mt-2 w-fit rounded-full border border-gold/40 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-gold">
          Invite Only
        </span>
      )}
      <p className="mt-3 text-[13px] leading-relaxed text-muted">{partnership.audience}</p>

      <div className="mt-5 text-left">
        <p className="eyebrow mb-2 !text-[10px]">Value for you</p>
        <ul className="space-y-1.5">
          {partnership.valueForPartner.map((v) => (
            <li key={v} className="flex items-start gap-1 text-[13px] text-ink/90">
              <Dot size={16} className="mt-0.5 shrink-0 text-gold" />
              <span className="-ml-1">{v}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/contact"
        className="focus-ring mt-6 flex items-center justify-center gap-2 rounded-lg border border-gold/35 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-gold transition-colors hover:border-gold hover:bg-gold/10"
      >
        Request a Call
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
