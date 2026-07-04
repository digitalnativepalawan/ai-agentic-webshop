import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Icon } from "./Icon";

interface Props {
  icon: string;
  title: string;
  body: string;
  to: string;
  cta: string;
}

export function OfferCard({ icon, title, body, to, cta }: Props) {
  return (
    <Link to={to} className="group card card-hover focus-ring block p-7">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gold/25 text-gold">
        <Icon name={icon} size={22} strokeWidth={1.4} />
      </div>
      <h3 className="font-display text-[24px] font-medium leading-tight">{title}</h3>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">{body}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-gold">
        {cta}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
