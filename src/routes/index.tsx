import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Merqato — Agentic Commerce for Hospitality" },
      { name: "description", content: "AI operators, nomad stays, and Palawan-native ecosystem — booked by agents, approved by humans." },
      { property: "og:title", content: "Merqato — Agentic Commerce for Hospitality" },
      { property: "og:description", content: "AI operators, nomad stays, and Palawan-native ecosystem — booked by agents, approved by humans." },
    ],
  }),
  component: Home,
});

import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Palmtree } from "lucide-react";
import { BUY_WITH_CONFIDENCE, HERO_BADGES, WHAT_YOU_CAN_DO } from "@/lib/site-data";
import { useOperatorCatalog } from "@/context/OperatorCatalogContext";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { CTAButton } from "@/components/site/CTAButton";
import { OfferCard } from "@/components/site/OfferCard";
import { OperatorCard } from "@/components/site/OperatorCard";
import { TrustBlock } from "@/components/site/TrustBlock";
import { MissionControlPreview } from "@/components/site/MissionControlPreview";
import { Icon } from "@/components/site/Icon";

function Home() {
  const { visibleOperators } = useOperatorCatalog();
  const featured = visibleOperators.filter((operator) => operator.featured).slice(0, 4);

  return (
    <>
      <div className="relative">
        <HeroBackdrop />
        <div className="shell pb-6 pt-10 sm:pt-14">
          <div className="mb-8 flex flex-wrap gap-2.5">
            {HERO_BADGES.map((badge) => (
              <StatusChip key={badge.label} tone="outline" icon={<Icon name={badge.icon} size={13} className="text-gold" />}>
                {badge.label}
              </StatusChip>
            ))}
          </div>

          <h1 className="max-w-4xl font-display text-[clamp(2.6rem,7vw,5.2rem)] font-medium leading-[0.98] tracking-tight animate-fade-up">
            Built for <span className="text-gold">people.</span><br />
            Structured for <span className="text-crimson">agents.</span>
          </h1>

          <p className="mt-6 font-display text-[clamp(1.3rem,3vw,1.9rem)] text-ink/90">The marketplace where AI agents can safely shop.</p>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            merQato.digital helps people and AI agents discover, compare, and request AI Operators, Palawan stays, and digital infrastructure — with human approval at every step.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <CTAButton to="/agents" variant="primary">Browse AI Operators</CTAButton>
            <CTAButton to="/stays" variant="secondary">Book a Stay</CTAButton>
            <CTAButton to="/mission-control" variant="ghost">See Mission Control</CTAButton>
          </div>

          {/* Dual entry points: human browse + agent/manifest path (skill Rule 2) */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]">
            <span className="inline-flex items-center gap-1.5 text-faint">
              <Bot size={14} className="text-gold" /> For AI agents:
            </span>
            <a href="/merqato-catalog.json" className="focus-ring inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-gold hover:text-gold-soft">Browse as an agent →</a>
            <span className="text-faint">·</span>
            <a href="/agent-commerce.json" className="focus-ring inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-gold hover:text-gold-soft">View API manifest →</a>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 text-gold"><Palmtree size={16} /></span>
            <div><p className="eyebrow !mb-0">Built in Palawan</p><p className="text-[13px] text-muted">Local team. Local partners. Global mindset.</p></div>
          </div>
        </div>
      </div>

      <Section>
        <Eyebrow>What you can do here</Eyebrow>
        <div className="grid gap-5 md:grid-cols-3">{WHAT_YOU_CAN_DO.map((item) => <OfferCard key={item.title} {...item} />)}</div>
      </Section>

      <Section className="!pt-2">
        <div className="mb-6 flex items-center justify-between">
          <Eyebrow>Featured AI Operators</Eyebrow>
          <Link to="/agents" className="focus-ring -mt-4 inline-flex items-center gap-1.5 text-[13px] text-gold hover:text-gold-soft">View all operators <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map((operator) => <OperatorCard key={operator.id} operator={operator} compact />)}</div>
      </Section>

      <Section className="!pt-2">
        <Eyebrow>Buy with confidence</Eyebrow>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">{BUY_WITH_CONFIDENCE.map((point) => <TrustBlock key={point.title} point={point} />)}</div>
      </Section>

      <Section className="!pt-2">
        <div className="mb-6 flex items-center justify-between">
          <Eyebrow>Mission Control preview</Eyebrow>
          <Link to="/mission-control" className="focus-ring -mt-4 inline-flex items-center gap-1.5 text-[13px] text-gold hover:text-gold-soft">Explore Mission Control <ArrowRight size={14} /></Link>
        </div>
        <div className="card grid items-center gap-8 p-6 lg:grid-cols-[0.9fr_1.6fr] lg:p-8">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-medium leading-tight">Run operations.<br />See what matters.</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">Mission Control gives you real-time visibility across bookings, AI operators, guests, and performance.</p>
            <div className="mt-6"><CTAButton to="/mission-control" variant="ghost">See it in action</CTAButton></div>
          </div>
          <MissionControlPreview />
        </div>
      </Section>
    </>
  );
}
