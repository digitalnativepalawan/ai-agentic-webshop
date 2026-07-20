import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "AI Operators — Merqato" },
      { name: "description", content: "Deploy AI operators for hospitality: concierge, revenue, ops, marketing, and more." },
      { property: "og:title", content: "AI Operators — Merqato" },
      { property: "og:description", content: "Deploy AI operators for hospitality: concierge, revenue, ops, marketing, and more." },
    ],
  }),
  component: Operators,
});

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import {
  AGENTIC_CHECKOUT_STEPS,
  HERO_BADGES,
  OPERATOR_CATEGORIES,
  OPERATOR_WHY,
} from "@/lib/site-data";
import type { OperatorCategory } from "@/lib/types";
import { hasConfig } from "@/lib/agentConfig";
import { generate } from "@/lib/openrouter";
import { useOperatorCatalog } from "@/context/OperatorCatalogContext";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { OperatorCard } from "@/components/site/OperatorCard";
import { CheckoutSteps } from "@/components/site/CheckoutSteps";
import { TrustBlock } from "@/components/site/TrustBlock";
import { CTAButton } from "@/components/site/CTAButton";
import { Icon } from "@/components/site/Icon";
import { ResortGrowthFeature } from "@/components/site/ResortGrowthFeature";


function Operators() {
  const [cat, setCat] = useState<OperatorCategory | "all">("all");
  const { visibleOperators } = useOperatorCatalog();
  const operators = cat === "all" ? visibleOperators : visibleOperators.filter((operator) => operator.category === cat);

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

          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.6rem)] font-medium leading-[0.98] tracking-tight animate-fade-up">
              Deploy the<br />right <span className="text-gold">operator.</span>
            </h1>
            <div className="flex flex-col justify-center gap-4 lg:border-l lg:border-line/20 lg:pl-14">
              <p className="eyebrow !mb-0 !text-gold">AI Operators</p>
              <p className="text-[15px] leading-relaxed text-muted">Human-approved AI services for hospitality, operations, marketing, and growth.</p>
              <p className="text-[15px] leading-relaxed text-muted">Structured for AI agents to compare services, request setup, and prepare checkout.</p>
            </div>
          </div>

          <p className="mt-8 max-w-xl text-[14px] leading-relaxed text-muted">
            AI operators that work like your best team — 24/7. Real outcomes for hospitality, operations, marketing, and growth.
          </p>
        </div>
      </div>

      <Section className="!pb-6">
        <Eyebrow>Browse by category</Eyebrow>
        <div className="flex flex-wrap gap-2.5">
          {OPERATOR_CATEGORIES.map((category) => {
            const active = category.id === cat;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCat(category.id)}
                className={`focus-ring inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] transition-colors ${active ? "border-gold bg-gold text-[#0b0b0b] font-medium" : "border-gold/25 text-muted hover:border-gold/50 hover:text-ink"}`}
              >
                <Icon name={category.icon} size={15} strokeWidth={1.6} />
                {category.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section className="!py-4">
        <PromptEngineerFeature />
      </Section>

      <Section className="!py-4">
        <ResortGrowthFeature />
      </Section>


      <Section className="!py-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {operators.map((operator) => <OperatorCard key={operator.id} operator={operator} />)}
        </div>
        {operators.length === 0 && <p className="py-10 text-center text-[14px] text-muted">No operators in this category yet. Try another filter.</p>}
      </Section>

      <Section className="!pt-8">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="card p-7">
            <Eyebrow>How agentic checkout works</Eyebrow>
            <CheckoutSteps steps={AGENTIC_CHECKOUT_STEPS} variant="process" />
            <div className="mt-7 rounded-lg border border-gold/25 bg-gold/[0.04] px-4 py-3 text-center"><p className="text-[13px] text-gold">✦ Built for both humans and AI agents. Safe. Transparent. Accountable.</p></div>
          </div>
          <div className="card p-7">
            <Eyebrow>Why choose Merqato operators</Eyebrow>
            <div className="space-y-5">{OPERATOR_WHY.map((point) => <TrustBlock key={point.title} point={point} />)}</div>
          </div>
        </div>
      </Section>

      <Section className="!pt-2">
        <div className="card flex flex-col items-start justify-between gap-6 border-gold/25 p-7 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/30 text-gold"><Code2 size={22} /></span>
            <div>
              <p className="eyebrow !mb-1.5">For AI Agents</p>
              <p className="max-w-xl text-[14px] leading-relaxed text-muted">Use structured categories, clear pricing, and standardized data to evaluate, configure, and request setup. All operators are API-friendly and machine-readable.</p>
            </div>
          </div>
          <CTAButton href="/merqato-catalog.json" variant="secondary">View API &amp; Data Specs</CTAButton>
        </div>
      </Section>
    </>
  );
}

const QA_MARKERS = [
  { label: "390 px", detail: "Mobile — thumb-reach CTA, no horizontal scroll." },
  { label: "768 px", detail: "Tablet — hero legibility, 2-col feature grid." },
  { label: "1440 px", detail: "Desktop — max-width guard, image sharpness." },
  { label: "WCAG AA", detail: "Contrast ≥ 4.5:1, focus rings, alt text, keyboard traversal." },
];

const PE_SYSTEM =
  "You are the Merqato Prompt Engineer — a senior prompt architect for hospitality web experiences. " +
  "Given a rough client request, you (1) list the specific requirements you must clarify before writing, " +
  "and (2) produce a production-grade prompt contract. Voice: precise, structured, no fluff. " +
  "Rules: real facts only; flag any assumption for human review; never invent resort details.";

function PromptEngineerFeature() {
  const [request, setRequest] = useState("Build me a landing page for my resort in El Nido");
  const [questions, setQuestions] = useState("");
  const [contract, setContract] = useState("");
  const [phase, setPhase] = useState<"idle" | "questions" | "contract">("idle");
  const [busy, setBusy] = useState<"" | "q" | "c">("");
  const [error, setError] = useState<string | null>(null);
  const keyReady = hasConfig();

  async function analyze() {
    setError(null);
    if (!keyReady) {
      setError("Connect an OpenRouter key in Operator Admin to enable live generation.");
      return;
    }
    setBusy("q");
    setQuestions("");
    setContract("");
    setPhase("idle");
    try {
      const out = await generate({
        system: PE_SYSTEM,
        user: `ROUGH REQUEST: "${request.trim()}"\n\nStep 1 — List the requirements to clarify (numbered, with a one-line why). Be specific to this request.`,
        maxTokens: 700,
        onToken: setQuestions,
      });
      setQuestions(out);
      setPhase("questions");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setBusy("");
    }
  }

  async function buildContract() {
    setError(null);
    setBusy("c");
    setContract("");
    try {
      const out = await generate({
        system: PE_SYSTEM,
        user: `ROUGH REQUEST: "${request.trim()}"\n\nCLARIFIED REQUIREMENTS (from prior step):\n${questions}\n\nStep 2 — Write the full production prompt contract: role, goal, audience, constraints, output format, model config, guardrails, and 2-3 test cases.`,
        maxTokens: 900,
        onToken: setContract,
      });
      setContract(out);
      setPhase("contract");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setBusy("");
    }
  }

  function copy(text: string) {
    if (text) navigator.clipboard?.writeText(text);
  }

  return (
    <div className="card overflow-hidden border-gold/25 p-0">
      <div className="grid gap-0 lg:grid-cols-2">
        {/* LEFT: pitch */}
        <div className="flex flex-col gap-5 border-b border-line/15 p-7 lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap gap-2">
            <StatusChip tone="gold" icon={<Sparkles size={12} />}>Live agent</StatusChip>
            <StatusChip tone="outline">Landing pages</StatusChip>
            <StatusChip tone="outline">Web apps</StatusChip>
            <StatusChip tone="outline">Agent workflows</StatusChip>
          </div>

          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gold/[0.06] text-gold">
              <Sparkles size={22} strokeWidth={1.6} />
            </span>
            <div>
              <p className="eyebrow !mb-1.5">Prompt Engineer</p>
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-medium leading-[1.05] tracking-tight">
                Vague request in. <span className="text-gold">Production contract out.</span>
              </h2>
            </div>
          </div>

          <p className="text-[14px] leading-relaxed text-muted">
            Turns rough ideas into production-grade prompt contracts for landing pages, web apps, and agent
            workflows — with requirements analysis, design QA, test cases, and version control.
          </p>

          {!keyReady && (
            <p className="rounded-md border border-gold/25 bg-gold/[0.05] px-3 py-2 text-[12px] leading-relaxed text-gold">
              API key set in Operator Admin. Partners can play without pasting a key.
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              to="/checkout"
              search={{ operatorId: "prompt-engineer" }}
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-gold bg-gold px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[#0b0b0b] transition-colors hover:bg-gold/90"
            >
              Request Prompt Engineer
              <ArrowRight size={13} />
            </Link>
            <CTAButton href="/merqato-catalog.json" variant="secondary">Agent-readable spec</CTAButton>
          </div>
        </div>

        {/* RIGHT: interactive */}
        <div className="flex flex-col gap-4 bg-surface-2/30 p-7">
          <div className="flex items-center justify-between">
            <p className="eyebrow !mb-0">Live workflow</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              {busy ? "generating…" : phase === "contract" ? "contract ready" : phase === "questions" ? "requirements ready" : "idle"}
            </span>
          </div>

          <label htmlFor="pe-draft" className="text-[12px] text-muted">Rough request</label>
          <textarea
            id="pe-draft"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={3}
            className="focus-ring w-full resize-none rounded-md border border-line/25 bg-bg/60 p-3 font-mono text-[12.5px] leading-relaxed text-ink placeholder:text-faint"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={analyze}
              disabled={busy !== ""}
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/[0.08] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gold transition-colors hover:border-gold hover:bg-gold/15 disabled:opacity-50"
            >
              <Sparkles size={13} />
              {busy === "q" ? "Analyzing…" : "Analyze request"}
            </button>
            {phase === "questions" && (
              <button
                type="button"
                onClick={buildContract}
                disabled={busy !== ""}
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-gold bg-gold px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#0b0b0b] transition-colors hover:bg-gold/90 disabled:opacity-50"
              >
                <ArrowRight size={13} />
                {busy === "c" ? "Writing…" : "Generate contract"}
              </button>
            )}
          </div>

          {error && (
            <p className="rounded-md border border-crimson/30 bg-crimson/[0.05] px-3 py-2 text-[12px] leading-relaxed text-crimson">
              {error}
            </p>
          )}

          {questions && (
            <div className="animate-fade-up">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">Requirements to clarify</p>
                <button onClick={() => copy(questions)} className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold/80 hover:text-gold">Copy</button>
              </div>
              <div className="max-h-44 overflow-auto whitespace-pre-wrap rounded-md border border-line/20 bg-bg/40 p-3 text-[12.5px] leading-relaxed text-ink">
                {questions}
              </div>
            </div>
          )}

          {contract && (
            <div className="animate-fade-up">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">Prompt contract</p>
                <button onClick={() => copy(contract)} className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold/80 hover:text-gold">Copy</button>
              </div>
              <div className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-dashed border-line/25 bg-bg/40 p-3 text-[12.5px] leading-relaxed text-ink">
                {contract}
              </div>
            </div>
          )}

          {!questions && !contract && !error && (
            <p className="text-[12.5px] leading-relaxed text-faint">
              Type a rough request, hit Analyze. The agent streams the real requirements to clarify, then a full
              prompt contract.
            </p>
          )}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">Design &amp; QA markers</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {QA_MARKERS.map((m) => (
                <li key={m.label} className="rounded-md border border-dashed border-line/25 bg-bg/40 p-2.5">
                  <p className="font-mono text-[11px] text-gold">{m.label}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{m.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-md border border-crimson/30 bg-crimson/[0.05] px-3 py-2 text-[11.5px] leading-relaxed text-crimson">
            Human approval required before publish. All assumptions and unresolved facts are surfaced for sign-off.
          </p>
        </div>
      </div>
    </div>
  );
}


