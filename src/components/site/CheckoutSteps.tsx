import { Check } from "lucide-react";
import type { ProcessStep } from "@/lib/types";
import { Icon } from "./Icon";

interface Props {
  steps: ProcessStep[];
  /** 1-based index of the active step (only for the numbered progress variant) */
  activeIndex?: number;
  variant?: "progress" | "process";
}

/**
 * `progress`  — the numbered checkout tracker (Select → … → Mission Created).
 * `process`   — the icon-led "how it works" rail used on Operators/Stays.
 */
export function CheckoutSteps({ steps, activeIndex, variant = "process" }: Props) {
  if (variant === "progress") {
    return (
      <ol className="flex flex-col gap-4 md:flex-row md:items-center md:gap-0">
        {steps.map((s, i) => {
          const done = activeIndex ? s.index < activeIndex : false;
          const active = activeIndex ? s.index === activeIndex : false;
          return (
            <li key={s.index} className="flex items-center gap-3 md:flex-1">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium ${
                  active
                    ? "border-gold bg-gold text-[#0b0b0b]"
                    : done
                      ? "border-gold/50 text-gold"
                      : "border-line/40 text-faint"
                }`}
              >
                {done ? <Check size={15} /> : s.index}
              </span>
              <span className={`text-[13px] ${active ? "text-gold" : done ? "text-ink" : "text-faint"}`}>
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <span className="mx-2 hidden h-px flex-1 bg-line/30 md:block" />
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {steps.map((s, i) => (
        <div key={s.index} className="relative flex flex-col items-center text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 text-gold">
            <Icon name={s.icon} size={20} strokeWidth={1.4} />
          </div>
          <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-ink">
            {s.index}. {s.title}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{s.body}</p>
          {i < steps.length - 1 && (
            <span className="absolute right-0 top-6 hidden h-px w-6 translate-x-1/2 bg-gold/25 lg:block" />
          )}
        </div>
      ))}
    </div>
  );
}
