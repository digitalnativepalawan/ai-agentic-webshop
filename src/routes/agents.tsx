import { useState } from "react";
import { Code2 } from "lucide-react";
import {
  AGENTIC_CHECKOUT_STEPS,
  HERO_BADGES,
  OPERATORS,
  OPERATOR_CATEGORIES,
  OPERATOR_WHY,
} from "@/lib/site-data";
import type { OperatorCategory } from "@/lib/types";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { OperatorCard } from "@/components/site/OperatorCard";
import { CheckoutSteps } from "@/components/site/CheckoutSteps";
import { TrustBlock } from "@/components/site/TrustBlock";
import { CTAButton } from "@/components/site/CTAButton";
import { Icon } from "@/components/site/Icon";

export default function Operators() {
  const [cat, setCat] = useState<OperatorCategory | "all">("all");
  const operators = cat === "all" ? OPERATORS : OPERATORS.filter((o) => o.category === cat);

  return (
    <>
      {/* HERO */}
      <div className="relative">
        <HeroBackdrop />
        <div className="shell pb-6 pt-10 sm:pt-14">
          <div className="mb-8 flex flex-wrap gap-2.5">
            {HERO_BADGES.map((b) => (
              <StatusChip key={b.label} tone="outline" icon={<Icon name={b.icon} size={13} className="text-gold" />}>
                {b.label}
              </StatusChip>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.6rem)] font-medium leading-[0.98] tracking-tight animate-fade-up">
              Deploy the
              <br />
              right <span className="text-gold">operator.</span>
            </h1>
            <div className="flex flex-col justify-center gap-4 lg:border-l lg:border-line/20 lg:pl-14">
              <p className="eyebrow !mb-0 !text-gold">AI Operators</p>
              <p className="text-[15px] leading-relaxed text-muted">
                Human-approved AI services for hospitality, operations, marketing, and growth.
              </p>
              <p className="text-[15px] leading-relaxed text-muted">
                Structured for AI agents to compare services, request setup, and prepare checkout.
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-xl text-[14px] leading-relaxed text-muted">
            AI operators that work like your best team — 24/7. Real outcomes for hospitality,
            operations, marketing, and growth.
          </p>
        </div>
      </div>

      {/* CATEGORY FILTERS */}
      <Section className="!pb-6">
        <Eyebrow>Browse by category</Eyebrow>
        <div className="flex flex-wrap gap-2.5">
          {OPERATOR_CATEGORIES.map((c) => {
            const active = c.id === cat;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={`focus-ring inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "border-gold bg-gold text-[#0b0b0b] font-medium"
                    : "border-gold/25 text-muted hover:border-gold/50 hover:text-ink"
                }`}
              >
                <Icon name={c.icon} size={15} strokeWidth={1.6} />
                {c.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* OPERATOR GRID */}
      <Section className="!py-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {operators.map((op) => (
            <OperatorCard key={op.id} operator={op} />
          ))}
        </div>
        {operators.length === 0 && (
          <p className="py-10 text-center text-[14px] text-muted">
            No operators in this category yet. Try another filter.
          </p>
        )}
      </Section>

      {/* HOW CHECKOUT WORKS + WHY */}
      <Section className="!pt-8">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="card p-7">
            <Eyebrow>How agentic checkout works</Eyebrow>
            <CheckoutSteps steps={AGENTIC_CHECKOUT_STEPS} variant="process" />
            <div className="mt-7 rounded-lg border border-gold/25 bg-gold/[0.04] px-4 py-3 text-center">
              <p className="text-[13px] text-gold">
                ✦ Built for both humans and AI agents. Safe. Transparent. Accountable.
              </p>
            </div>
          </div>

          <div className="card p-7">
            <Eyebrow>Why choose Merqato operators</Eyebrow>
            <div className="space-y-5">
              {OPERATOR_WHY.map((t) => (
                <TrustBlock key={t.title} point={t} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* FOR AI AGENTS */}
      <Section className="!pt-2">
        <div className="card flex flex-col items-start justify-between gap-6 border-gold/25 p-7 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/30 text-gold">
              <Code2 size={22} />
            </span>
            <div>
              <p className="eyebrow !mb-1.5">For AI Agents</p>
              <p className="max-w-xl text-[14px] leading-relaxed text-muted">
                Use structured categories, clear pricing, and standardized data to evaluate,
                configure, and request setup. All operators are API-friendly and machine-readable.
              </p>
            </div>
          </div>
          <CTAButton href="/merqato-catalog.json" variant="secondary">
            View API &amp; Data Specs
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
