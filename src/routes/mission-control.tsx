import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mission-control")({
  head: () => ({
    meta: [
      { title: 'Mission Control — Merqato' },
      { name: "description", content: 'Monitor your agents, missions, and reservations in Mission Control.' },
      { property: "og:title", content: 'Mission Control — Merqato' },
      { property: "og:description", content: 'Monitor your agents, missions, and reservations in Mission Control.' },
    ],
  }),
  component: MissionControl,
});

import { Gauge } from "lucide-react";
import { MISSION_CONTROL_METRICS } from "@/lib/site-data";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { MissionControlPreview } from "@/components/site/MissionControlPreview";
import { CTAButton } from "@/components/site/CTAButton";
import { TrustBlock } from "@/components/site/TrustBlock";

const CAPABILITIES = [
  { icon: "Gauge", title: "Real-time overview", body: "Bookings, revenue, guests, and operator health in one view." },
  { icon: "Activity", title: "Performance tracking", body: "Trends and utilization so you always know what's working." },
  { icon: "Bell", title: "Alerts & approvals", body: "Human-in-the-loop notifications before anything goes live." },
  { icon: "Eye", title: "Partner visibility", body: "Share the right metrics without exposing admin-only data." },
];

function MissionControl() {
  return (
    <>
      {/* HERO */}
      <div className="relative">
        <HeroBackdrop />
        <div className="shell pb-6 pt-10 sm:pt-14">
          <div className="mb-6 flex flex-wrap gap-2.5">
            <StatusChip tone="gold" icon={<Gauge size={13} />}>Live demo</StatusChip>
            <StatusChip tone="outline">Proof of work</StatusChip>
          </div>
          <h1 className="max-w-3xl font-display text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-[1] tracking-tight animate-fade-up">
            Run operations.
            <br />
            <span className="text-gold">See what matters.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Mission Control is the operating dashboard behind every Merqato order. It gives you and
            your partners real-time visibility across bookings, AI operators, guests, and
            performance — with human approval on every action.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <CTAButton to="/agents" variant="primary">Browse AI Operators</CTAButton>
            <CTAButton to="/contact" variant="secondary">Request a setup</CTAButton>
          </div>
          <p className="mt-4 text-[12px] text-faint">
            Demo shown with sample data. No live accounts are connected.
          </p>
        </div>
      </div>

      {/* METRICS STRIP */}
      <Section className="!py-8">
        <div className="mb-4 flex items-center gap-2">
          <Eyebrow>Execution metrics</Eyebrow>
          <StatusChip tone="outline" className="!text-[10px] uppercase tracking-[0.1em]">Sample preview · not live</StatusChip>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MISSION_CONTROL_METRICS.map((m) => (
            <div key={m.label} className="card p-5">
              <p className="text-[11px] text-faint">{m.label}</p>
              <p className="mt-1 font-display text-[30px] font-medium text-gold">{m.value}</p>
              <p className="mt-0.5 text-[11px] text-emerald-500">{m.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-faint">
          These figures illustrate the Mission Control dashboard. Live metrics become available once an account is connected.
        </p>
      </Section>

      {/* LIVE PREVIEW */}
      <Section className="!pt-0">
        <Eyebrow>Dashboard preview</Eyebrow>
        <MissionControlPreview />
      </Section>

      {/* CAPABILITIES */}
      <Section className="!pt-2">
        <Eyebrow>What you get</Eyebrow>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <TrustBlock key={c.title} point={c} />
          ))}
        </div>
      </Section>
    </>
  );
}
