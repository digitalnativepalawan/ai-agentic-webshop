import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/resort-agents")({
  head: () => ({
    meta: [
      { title: "Resort Agents — Merqato" },
      {
        name: "description",
        content:
          "Working AI agents for Palawan resorts — inquiry, booking, growth, and prompt engineering. Local-first, human-approved, ready to deploy.",
      },
      { property: "og:title", content: "Resort Agents — Merqato" },
      {
        property: "og:description",
        content:
          "Working AI agents for Palawan resorts — inquiry, booking, growth, and prompt engineering.",
      },
    ],
  }),
  component: ResortAgents,
});

import { ArrowUpRight, Bot, CalendarCheck, Megaphone, Sparkles } from "lucide-react";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { CTAButton } from "@/components/site/CTAButton";
import { Icon } from "@/components/site/Icon";

const HERO_BADGES = [
  { icon: "ShieldCheck", label: "AI agent ready" },
  { icon: "UserCheck", label: "Human-approved" },
  { icon: "Palmtree", label: "Built in Palawan" },
];

const RESORT_AGENTS = [
  {
    id: "resort-inquiry",
    name: "Inquiry Agent",
    icon: "Bot",
    tagline:
      "Captures and qualifies pre-stay inquiries across web, WhatsApp, and Facebook — answers fast, routes the serious ones to a human.",
    highlights: ["24/7 inquiry capture", "Multi-channel (Web / WhatsApp / FB)", "Qualifies leads before handoff"],
    tone: "outline" as const,
  },
  {
    id: "resort-booking",
    name: "Booking Agent",
    icon: "CalendarCheck",
    tagline:
      "Turns inquiries into confirmed bookings with live availability, clear rates, and a human-approved checkout — PayMongo-ready for GCash.",
    highlights: ["Live availability + rates", "Confirmed bookings, not just chats", "PayMongo / GCash checkout"],
    tone: "outline" as const,
  },

];

function ResortAgents() {
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
              Resort
              <br />
              <span className="text-gold">Agents</span>
            </h1>
            <div className="flex flex-col justify-center gap-4 lg:border-l lg:border-line/20 lg:pl-14">
              <p className="eyebrow !mb-0 !text-gold">Working agents to sell</p>
              <p className="text-[15px] leading-relaxed text-muted">
                A portfolio of local-first AI agents built for Palawan resorts — forked from open-source
                templates, improved in-house, and ready to deploy.
              </p>
              <p className="text-[15px] leading-relaxed text-muted">
                Each agent is draft-first and human-approved. Run them free on local Ollama, or connect an
                OpenRouter key for production-grade multilingual writing.
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-xl text-[14px] leading-relaxed text-muted">
            We don't sell demos. We sell working agents that fill rooms, capture guests, and grow
            revenue — all year, all weather.
          </p>
        </div>
      </div>

      {/* AGENT CARDS */}
      <Section>
        <Eyebrow>The portfolio</Eyebrow>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {RESORT_AGENTS.map((agent) => (
            <div key={agent.id} className="card card-hover flex flex-col p-6">
              <div className="mb-5 flex items-start justify-between">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/[0.06] text-gold">
                  <Icon name={agent.icon} size={22} strokeWidth={1.6} />
                </span>
                <StatusChip tone={agent.tone}>{agent.tone === "gold" ? "Flagship" : "Available"}</StatusChip>
              </div>

              <h3 className="font-display text-[22px] font-medium leading-tight tracking-tight">{agent.name}</h3>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">{agent.tagline}</p>

              <ul className="mt-4 space-y-1.5">
                {agent.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink/80">
                    <span className="mt-0.5 text-gold">→</span>
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center gap-1.5 text-[12px] font-medium text-gold">
                Request this agent
                <ArrowUpRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* HOW IT RUNS */}
      <Section className="!pt-2">
        <Eyebrow>How a resort agent runs</Eyebrow>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="card p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  t: "Local-first",
                  b: "Runs on your machine with Ollama — no keys, no cost to validate. Triple-redundant internet (Starlink + Globe + Smart) keeps it online.",
                },
                {
                  t: "Draft-first",
                  b: "Every post, reply, and offer is queued for human approval. The agent never publishes or charges on its own.",
                },
                {
                  t: "Multilingual",
                  b: "Writes in English, Tagalog, and 中文. Connect an OpenRouter key and the full model catalog unlocks for production quality.",
                },
                {
                  t: "Yours to own",
                  b: "Forked from MIT templates and improved in-house. The output is ours — deploy to your resort, your brand, your rules.",
                },
              ].map((point) => (
                <div key={point.t} className="rounded-lg border border-line/15 bg-surface-2/40 p-4">
                  <p className="text-[14px] font-medium text-ink">{point.t}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{point.b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card flex flex-col items-start justify-center gap-4 border-gold/25 p-7">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/30 text-gold">
              <Sparkles size={22} />
            </span>
            <div>
              <p className="eyebrow !mb-1.5">Get a working agent</p>
              <p className="max-w-sm text-[14px] leading-relaxed text-muted">
                Tell us the resort and the goal. We deploy a working agent — not a pitch deck — and you
                approve every action.
              </p>
            </div>
            <CTAButton to="/contact" variant="primary">
              Talk to us
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
