import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import type { Stay } from "@/lib/types";
import { formatPHP } from "@/lib/site-data";
import { Icon } from "./Icon";

export function StayCard({ stay }: { stay: Stay }) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-6 transition-all duration-300 ${
        stay.mostPopular
          ? "border-crimson/50 bg-surface/70 shadow-[0_30px_70px_-50px_rgb(196_20_20/0.6)]"
          : "card card-hover"
      }`}
    >
      {stay.mostPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-crimson px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white">
          Most Popular
        </span>
      )}

      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-crimson/40 bg-crimson/[0.07] text-crimson">
        <Icon name={stay.icon} size={20} strokeWidth={1.5} />
      </div>

      <h3 className="font-display text-[23px] font-medium leading-tight">{stay.name}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{stay.tagline}</p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {stay.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-ink/90">
            <Check size={15} className="mt-0.5 shrink-0 text-gold" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <p className="mb-3 text-[13px]">
          <span className="text-faint">From </span>
          <span className="text-[18px] font-medium text-gold">{formatPHP(stay.price.amount)}</span>
          <span className="text-faint"> {stay.price.suffix}</span>
        </p>
        <Link
          to="/checkout"
          state={{ stayId: stay.id }}
          className="focus-ring group flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] font-medium text-[#0b0b0b] transition-colors hover:bg-gold-soft"
        >
          Request Availability
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
