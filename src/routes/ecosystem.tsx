import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ecosystem")({
  head: () => ({
    meta: [
      { title: 'Ecosystem Partnerships — Merqato' },
      { name: "description", content: 'Partner with the Merqato ecosystem to co-build agentic experiences in Palawan.' },
      { property: "og:title", content: 'Ecosystem Partnerships — Merqato' },
      { property: "og:description", content: 'Partner with the Merqato ecosystem to co-build agentic experiences in Palawan.' },
    ],
  }),
  component: Ecosystem,
});

import { Check, Users2 } from "lucide-react";
import {
  PARTNERSHIPS,
  PARTNER_DASHBOARDS,
  PARTNER_STATS,
  PARTNER_TRUST,
} from "@/lib/site-data";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { PartnershipCard } from "@/components/site/PartnershipCard";
import { TrustBlock } from "@/components/site/TrustBlock";
import { CTAButton } from "@/components/site/CTAButton";
import { Icon } from "@/components/site/Icon";

const HERO_BADGES = [
  { icon: "ShieldCheck", label: "Human-approved partnerships" },
  { icon: "Palmtree", label: "Built in Palawan" },
  { icon: "Lock", label: "Partner-safe by design" },
];

function Ecosystem() {
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

          <h1 className="max-w-3xl font-display text-[clamp(2.6rem,7vw,5rem)] font-medium leading-[0.98] tracking-tight animate-fade-up">
            Ecosystem
            <br />
            <span className="text-gold">Partnerships</span>
          </h1>

          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink/90">
            Partner with Merqato to build the future of AI-powered business infrastructure in
            Palawan.
          </p>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted">
            Merqato brings together people, technology, and operations to deliver transparent,
            human-approved systems that make hospitality and commerce smarter, safer, and more
            profitable.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <CTAButton to="/contact" variant="primary">
              Explore Partnership Options
            </CTAButton>
            <CTAButton to="/contact" variant="secondary">
              Request an Intro Call
            </CTAButton>
          </div>
        </div>
      </div>

      {/* PARTNERSHIP CARDS */}
      <Section>
        <Eyebrow>Partner with purpose. Grow together.</Eyebrow>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PARTNERSHIPS.map((p) => (
            <PartnershipCard key={p.id} partnership={p} />
          ))}
        </div>
      </Section>

      {/* WHAT PARTNERS SEE */}
      <Section className="!pt-2">
        <Eyebrow>What partners see</Eyebrow>
        <p className="-mt-3 mb-6 text-[13px] text-muted">
          Mission Control gives partners the right visibility — without exposing sensitive admin
          data.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNER_DASHBOARDS.map((d) => (
            <div key={d.title} className="card card-hover p-5">
              <div className="mb-4 rounded-lg border border-line/15 bg-surface-2/60 p-3">
                <p className="text-[10px] text-faint">{d.label}</p>
                <p className="mt-1 font-display text-[26px] font-medium text-gold">{d.metric}</p>
                <p className="text-[9px] text-emerald-500">▲ vs yesterday</p>
              </div>
              <p className="text-[14px] font-medium text-ink">{d.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{d.body}</p>
              <p className="mt-3 text-[12px] text-gold">View preview →</p>
            </div>
          ))}
        </div>
      </Section>

      {/* BUILT WITH HUMAN APPROVAL */}
      <Section className="!pt-2">
        <Eyebrow>Built with human approval</Eyebrow>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PARTNER_TRUST.map((t) => (
            <TrustBlock key={t.title} point={t} />
          ))}
        </div>
      </Section>

      {/* WHY PARTNER — stats */}
      <Section className="!pt-2">
        <Eyebrow>Why partner with Merqato</Eyebrow>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {PARTNER_STATS.map((s) => (
            <div key={s.value} className="flex items-start gap-3">
              {(s.sub === "palm" || s.sub === "lock") && (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/25 text-gold">
                  <Icon name={s.sub === "palm" ? "Palmtree" : "Lock"} size={16} strokeWidth={1.5} />
                </span>
              )}
              <div>
                <p className="font-display text-[26px] font-medium leading-none text-gold">{s.value}</p>
                <p className="mt-2 text-[13px] font-medium text-ink">{s.label}</p>
                {s.sub !== "palm" && s.sub !== "lock" && s.sub && (
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{s.sub}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SELECTED PARTNERS BANNER */}
      <Section className="!pt-2">
        <div className="card grid items-center gap-6 border-gold/25 p-7 lg:grid-cols-[1.3fr_1fr_auto]">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/30 text-gold">
              <Users2 size={22} />
            </span>
            <div>
              <h3 className="font-display text-[24px] font-medium">Selected partners only.</h3>
              <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
                We collaborate with partners who share our standards for quality, transparency, and
                guest trust.
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {["Human-approved partnerships", "Performance-aligned outcomes", "Built for long-term value"].map((l) => (
              <li key={l} className="flex items-center gap-2 text-[13px] text-ink/90">
                <Check size={15} className="text-gold" /> {l}
              </li>
            ))}
          </ul>
          <div>
            <CTAButton to="/contact" variant="primary">
              Request Partnership Intro
            </CTAButton>
            <p className="mt-2 text-[11px] text-faint">Spots are limited. Apply to start the conversation.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
