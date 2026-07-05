import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark } from "lucide-react";
import type { Operator } from "@/lib/types";
import type { OperatorMedia } from "@/lib/operator-media";
import { formatPHP } from "@/lib/site-data";
import { useOperatorMedia } from "@/hooks/useOperatorMedia";
import { Icon } from "./Icon";
import { StatusChip } from "./StatusChip";
import { OperatorMediaPreview } from "./OperatorMediaPreview";

interface Props {
  operator: Operator;
  media?: OperatorMedia[];
  compact?: boolean;
}

export function OperatorCard({ operator, media, compact = false }: Props) {
  const [saved, setSaved] = useState(false);
  const { media: allMedia } = useOperatorMedia();
  const operatorMedia = media ?? allMedia.filter((item) => item.operatorId === operator.id);
  const priceLabel =
    operator.price.model === "one_time_setup"
      ? `${formatPHP(operator.price.amount)} one-time`
      : operator.price.model === "custom_quote"
        ? "Custom quote"
        : `From ${formatPHP(operator.price.amount)} ${operator.price.suffix}`;
  const isSetup = operator.kind === "setup";

  return (
    <div className="group card card-hover flex flex-col p-6">
      <OperatorMediaPreview media={operatorMedia} compact={compact} />

      <div className="mb-4 flex items-start justify-between">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-crimson/40 bg-crimson/[0.07] text-crimson">
          <Icon name={operator.icon} size={22} strokeWidth={1.5} />
        </div>
        {!compact && (
          <button
            type="button"
            aria-label={saved ? "Remove bookmark" : "Save operator"}
            aria-pressed={saved}
            onClick={() => setSaved((current) => !current)}
            className="focus-ring rounded-md p-1 text-faint transition-colors hover:text-gold"
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} className={saved ? "text-gold" : ""} />
          </button>
        )}
        {compact && operator.topRated && (
          <StatusChip tone="crimson" className="!text-[10px] uppercase tracking-[0.1em]">
            Top Rated
          </StatusChip>
        )}
      </div>

      <h3 className="font-display text-[22px] font-medium leading-tight">{operator.name}</h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">{operator.tagline}</p>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2">
          {operator.badges.map((badge) => (
            <StatusChip key={badge.label} tone={badge.tone}>
              {badge.label}
            </StatusChip>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-line/15 pt-4">
        <span className="text-[13px] text-gold">{priceLabel}</span>
        <Link
          to="/checkout"
          search={{ operatorId: operator.id }}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-gold/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-gold transition-colors hover:border-gold hover:bg-gold/10"
        >
          {isSetup ? "Request setup" : "View details"}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
