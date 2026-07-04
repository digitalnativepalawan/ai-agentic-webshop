import type { ReactNode } from "react";

type Tone = "gold" | "crimson" | "neutral" | "outline";

const tones: Record<Tone, string> = {
  gold: "border-gold/40 text-gold bg-gold/[0.06]",
  crimson: "border-crimson/50 text-crimson bg-crimson/[0.06]",
  neutral: "border-line/40 text-muted bg-transparent",
  outline: "border-gold/30 text-ink bg-transparent",
};

interface Props {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}

export function StatusChip({ children, tone = "gold", icon, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] leading-none ${tones[tone]} ${className}`}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
