import { Bot, HelpCircle, Info, Radar, UserCheck, Wifi } from "lucide-react";
import {
  STAYS,
  STAY_PERKS,
  STAY_STEPS,
} from "@/lib/site-data";
import { Section, Eyebrow } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { StayCard } from "@/components/site/StayCard";
import { CheckoutSteps } from "@/components/site/CheckoutSteps";
import { TrustBlock } from "@/components/site/TrustBlock";
import { Icon } from "@/components/site/Icon";

const HERO_POINTS = [
  { icon: "Palmtree", title: "Tropical focus.", body: "Zero distractions." },
  { icon: "Wifi", title: "Fast, reliable", body: "Starlink internet." },
  { icon: "Users", title: "Local support,", body: "human-first." },
];

const GOOD_HANDS = [
  { icon: "CalendarX2", title: "No automated booking", body: "without confirmation" },
  { icon: "CheckCheck", title: "Human-approved", body: "reservations" },
  { icon: "Settings", title: "Mission Control", body: "tracked" },
  { icon: "BedDouble", title: "Built for long", body: "stays" },
];

export default function Stays() {
  return (
    <>
      {/* HERO */}
      <div className="shell pb-6 pt-10 sm:pt-14">
        <div className="mb-8 flex flex-wrap gap-2.5">
          <StatusChip tone="outline" icon={<Icon name="Palmtree" size={13} className="text-gold" />}>
            Built in Palawan
          </StatusChip>
          <StatusChip tone="outline" icon={<Icon name="ShieldCheck" size={13} className="text-gold" />}>
            AI-agent readable
          </StatusChip>
          <StatusChip tone="outline" icon={<UserCheck size={13} className="text-gold" />}>
            Human confirmation required
          </StatusChip>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="animate-fade-up">
            <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.6rem)] font-medium leading-[0.98] tracking-tight">
              Stay a month.
              <br />
              Build from <span className="text-crimson">Palawan.</span>
            </h1>
            <p className="mt-5 font-mono text-[13px] uppercase tracking-[0.14em] text-gold">
              Nomad Stays
            </p>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
              Book work-ready stays in Palawan for remote workers, founders, and AI builders.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gold/30 px-4 py-2.5 text-[13px] text-ink">
              <Radar size={15} className="text-gold" />
              AI-agent readable availability + human confirmation required
            </div>

            <div className="mt-7 flex flex-wrap gap-6">
              {HERO_POINTS.map((p) => (
                <div key={p.title} className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gold/25 text-gold">
                    <Icon name={p.icon} size={16} strokeWidth={1.5} />
                  </span>
                  <p className="text-[12.5px] leading-tight text-muted">
                    {p.title}
                    <br />
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scenic panel (no external asset — layered CSS scene) */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gold/20">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1c3a4a] via-[#2a4d3a] to-[#0f1a14]" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#3a6d7a]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#0d2620]/70 [clip-path:polygon(0_40%,20%_30%,40%_45%,60%_28%,80%_42%,100%_32%,100%_100%,0_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-[#081410]/80 [clip-path:polygon(0_60%,15%_45%,35%_58%,55%_42%,75%_55%,100%_46%,100%_100%,0_100%)]" />
            <div className="hero-sweep absolute -bottom-10 right-0 h-40 w-2/3 opacity-60" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-black/40 px-3 py-1.5 backdrop-blur-sm">
              <Wifi size={13} className="text-gold" />
              <span className="text-[11px] text-white/80">Starlink · work-ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHOOSE YOUR STAY */}
      <Section>
        <Eyebrow>Choose your stay</Eyebrow>
        <div className="grid gap-5 lg:grid-cols-[repeat(4,1fr)_0.9fr]">
          {STAYS.map((s) => (
            <StayCard key={s.id} stay={s} />
          ))}

          {/* For AI Agents side panel */}
          <div className="card flex flex-col gap-4 border-gold/25 p-5">
            <p className="eyebrow !mb-0">For AI Agents</p>
            <p className="text-[12.5px] leading-relaxed text-muted">
              This page is built for agentic discovery and human-trusted reservation.
            </p>
            {[
              { icon: <Bot size={15} />, title: "Structured availability", body: "Availability data is structured and machine-readable." },
              { icon: <UserCheck size={15} />, title: "Human confirmation", body: "All reservations require human review and approval." },
              { icon: <HelpCircle size={15} />, title: "Next allowed action", body: "Request availability for selected dates." },
            ].map((r) => (
              <div key={r.title} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-gold">{r.icon}</span>
                <div>
                  <p className="text-[12.5px] font-medium text-gold">{r.title}</p>
                  <p className="text-[11.5px] leading-relaxed text-muted">{r.body}</p>
                </div>
              </div>
            ))}
            <p className="mt-1 text-[11px] leading-relaxed text-faint">
              Do not attempt to confirm or book without approval.
            </p>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[12px] text-faint">
          <Info size={13} /> Rates in PHP. Long-stay discounts available. Final pricing confirmed
          after human review.
        </p>
      </Section>

      {/* HOW IT WORKS + GOOD HANDS */}
      <Section className="!pt-2">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="card p-7">
            <Eyebrow>How it works</Eyebrow>
            <CheckoutSteps steps={STAY_STEPS} variant="process" />
          </div>
          <div className="card p-7">
            <Eyebrow>You're in good hands</Eyebrow>
            <div className="grid grid-cols-2 gap-5">
              {GOOD_HANDS.map((g) => (
                <div key={g.title} className="flex items-start gap-2.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/25 text-gold">
                    <Icon name={g.icon} size={16} strokeWidth={1.5} />
                  </span>
                  <p className="text-[12.5px] leading-tight text-muted">
                    {g.title}
                    <br />
                    {g.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* WHY NOMADS LOVE */}
      <Section className="!pt-2">
        <Eyebrow>Why digital nomads love Merqato stays</Eyebrow>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STAY_PERKS.map((p) => (
            <TrustBlock key={p.title} point={p} />
          ))}
        </div>
      </Section>
    </>
  );
}
