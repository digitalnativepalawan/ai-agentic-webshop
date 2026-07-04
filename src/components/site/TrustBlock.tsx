import type { TrustPoint } from "@/lib/types";
import { Icon } from "./Icon";

interface Props {
  point: TrustPoint;
  variant?: "inline" | "card";
}

export function TrustBlock({ point, variant = "inline" }: Props) {
  if (variant === "card") {
    return (
      <div className="card flex items-start gap-3 p-5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/25 text-gold">
          <Icon name={point.icon} size={17} strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-[13.5px] font-medium text-gold">{point.title}</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{point.body}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/25 text-gold">
        <Icon name={point.icon} size={17} strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-[14px] font-medium text-ink">{point.title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{point.body}</p>
      </div>
    </div>
  );
}
