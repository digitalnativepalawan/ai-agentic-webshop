import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: 'Checkout — Merqato' },
      { name: "description", content: 'Human-approved checkout for AI operator missions and nomad stays.' },
      { property: "og:title", content: 'Checkout — Merqato' },
      { property: "og:description", content: 'Human-approved checkout for AI operator missions and nomad stays.' },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ operatorId: typeof s.operatorId === "string" ? s.operatorId : undefined, stayId: typeof s.stayId === "string" ? s.stayId : undefined }),
  component: Checkout,
});

import { useMemo, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  Database,
  FileLock2,
  Lock,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AFTER_APPROVAL, APPROVAL, buildCheckoutSummary } from "@/lib/checkout-rules";
import { CHECKOUT_TRUST, formatPHP, getOperator, OPERATORS } from "@/lib/site-data";
import type { ProcessStep } from "@/lib/types";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { CheckoutSteps } from "@/components/site/CheckoutSteps";
import { CTAButton } from "@/components/site/CTAButton";
import { TrustBlock } from "@/components/site/TrustBlock";
import { Icon } from "@/components/site/Icon";

const PROGRESS: ProcessStep[] = [
  { index: 1, title: "Select", body: "", icon: "" },
  { index: 2, title: "Configure", body: "", icon: "" },
  { index: 3, title: "Verify", body: "", icon: "" },
  { index: 4, title: "Human Approval", body: "", icon: "" },
  { index: 5, title: "Pay / Reserve", body: "", icon: "" },
  { index: 6, title: "Mission Created", body: "", icon: "" },
];

function Checkout() {
  const state = Route.useSearch();
  const [copied, setCopied] = useState(false);

  const operator = useMemo(
    () => getOperator(state.operatorId ?? "guest-concierge-ai") ?? OPERATORS[0],
    [state.operatorId],
  );
  const summary = useMemo(() => buildCheckoutSummary(operator), [operator]);

  const copyOrder = () => {
    navigator.clipboard?.writeText(summary.orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <>
      {/* HERO */}
      <div className="relative">
        <HeroBackdrop />
        <div className="shell pb-6 pt-10 sm:pt-14">
          <div className="mb-8 flex flex-wrap gap-2.5">
            <StatusChip tone="outline" icon={<ShieldCheck size={13} className="text-gold" />}>AI agent ready</StatusChip>
            <StatusChip tone="outline" icon={<UserRound size={13} className="text-gold" />}>Human-approved checkout</StatusChip>
            <StatusChip tone="outline" icon={<Icon name="Palmtree" size={13} className="text-gold" />}>Built in Palawan</StatusChip>
          </div>

          <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.6rem)] font-medium leading-[0.98] tracking-tight animate-fade-up">
            Agentic Checkout
          </h1>
          <p className="mt-3 font-display text-[clamp(1.4rem,3.2vw,2.1rem)]">
            Structured for AI agents. <span className="text-crimson">Approved by humans.</span>
          </p>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted">
            Every purchase, booking, or deployment is verified by a human before it is finalized.
          </p>
        </div>
      </div>

      {/* PROGRESS */}
      <Section className="!py-8">
        <CheckoutSteps steps={PROGRESS} variant="progress" activeIndex={4} />
      </Section>

      {/* ORDER + APPROVAL */}
      <Section className="!pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ORDER SUMMARY */}
          <div className="card p-6 sm:p-7">
            <Eyebrow>Order Summary</Eyebrow>
            <div className="flex gap-4">
              <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-crimson/40 bg-crimson/[0.07] text-crimson">
                <Icon name={operator.icon} size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-[24px] font-medium leading-tight">{operator.name}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{operator.tagline}</p>
                <StatusChip tone="gold" className="mt-2 uppercase !text-[10px] tracking-[0.1em]">
                  {operator.kind === "setup" ? "Setup" : "AI Operator"}
                </StatusChip>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow !mb-1.5 !text-[10px]">Plan</p>
                <p className="text-[13.5px] font-medium text-gold">{summary.plan}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{summary.planDescription}</p>
              </div>
              <div>
                <p className="eyebrow !mb-1.5 !text-[10px]">Deployment Scope</p>
                <ul className="space-y-1 text-[12.5px] text-muted">
                  {summary.deploymentScope.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <p className="eyebrow !mb-2 !text-[10px]">Included Services</p>
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {summary.includedServices.map((s) => (
                  <div key={s} className="flex items-start gap-2 text-[12.5px] text-ink/90">
                    <Check size={14} className="mt-0.5 shrink-0 text-gold" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-line/15 pt-5">
              <p className="eyebrow !mb-3 !text-[10px]">Pricing Summary</p>
              {summary.lineItems.map((li) => (
                <div key={li.label} className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-muted">{li.label}</span>
                  <span className="text-ink">{formatPHP(li.amount)}</span>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between border-t border-line/15 pt-3">
                <span className="text-[13px] text-ink">Total Today (before approval)</span>
                <span className="text-[18px] font-medium text-gold">{formatPHP(summary.totalToday)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 rounded-lg border border-gold/20 bg-gold/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2 text-[13px]">
                <span className="eyebrow !mb-0 !text-[10px]">Status</span>
                <Clock size={14} className="text-gold" />
                <span className="text-gold">Awaiting Human Approval</span>
              </span>
              <span className="text-[11.5px] text-faint">No payment will be processed until human approval.</span>
            </div>
          </div>

          {/* HUMAN APPROVAL */}
          <div className="card p-6 sm:p-7">
            <Eyebrow>Human Approval Required</Eyebrow>
            <div className="flex gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-crimson/40 bg-crimson/[0.07] text-crimson">
                <ShieldCheck size={22} />
              </span>
              <p className="text-[13px] leading-relaxed text-muted">
                Every order is reviewed by our Palawan-based team to ensure quality, safety, and
                alignment with your goals.
              </p>
            </div>

            <ul className="mt-5 space-y-2.5">
              {APPROVAL.checks.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-[13px] text-ink/90">
                  <Check size={15} className="mt-0.5 shrink-0 text-gold" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-3 rounded-lg border border-gold/20 bg-gold/[0.03] px-4 py-3">
              <Clock size={17} className="text-gold" />
              <div>
                <p className="text-[11px] text-faint">Average approval time</p>
                <p className="text-[14px] font-medium text-gold">{APPROVAL.averageTime}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <CTAButton variant="primary" full onClick={() => undefined}>
                Request approval
              </CTAButton>
              <button
                type="button"
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-gold/35 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.12em] text-gold transition-colors hover:border-gold hover:bg-gold/10"
              >
                <MessageCircle size={15} /> Send to WhatsApp
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  className="focus-ring rounded-lg border border-line/30 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-gold/40 hover:text-gold"
                >
                  Prepare checkout
                </button>
                <button
                  type="button"
                  className="focus-ring rounded-lg border border-line/30 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-gold/40 hover:text-gold"
                >
                  Schedule setup call
                </button>
              </div>
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-faint">
              <Lock size={12} /> Checkout is locked until approval is complete.
            </p>
          </div>
        </div>
      </Section>

      {/* FOR AI AGENTS + AFTER APPROVAL */}
      <Section className="!pt-2">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* FOR AI AGENTS */}
          <div className="card p-6 sm:p-7">
            <Eyebrow>For AI Agents</Eyebrow>
            <p className="-mt-3 mb-4 text-[12.5px] text-muted">Structured data for secure agentic transactions.</p>
            <dl className="divide-y divide-line/10 text-[12.5px]">
              {[
                { icon: <Icon name="Wand2" size={14} />, k: "Allowed Actions", v: "Configure, Request Approval, View Status" },
                { icon: <UserRound size={14} />, k: "Human Approval Required", v: "Yes" },
                { icon: <Lock size={14} />, k: "Deployment / Payment Locked", v: "Until approval is granted" },
                { icon: <Icon name="ArrowRight" size={14} />, k: "Next Step", v: "Request approval to proceed" },
              ].map((r) => (
                <div key={r.k} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted">
                    <span className="text-gold">{r.icon}</span>
                    {r.k}
                  </span>
                  <span className="text-right text-ink">{r.v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <span className="flex items-center gap-2 text-muted">
                  <FileLock2 size={14} className="text-gold" /> Approval Endpoint
                </span>
                <code className="rounded bg-surface-2/70 px-2 py-1 font-mono text-[11px] text-gold">
                  {APPROVAL.endpoint}
                </code>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <span className="flex items-center gap-2 text-muted">
                  <Database size={14} className="text-gold" /> Status Endpoint
                </span>
                <code className="rounded bg-surface-2/70 px-2 py-1 font-mono text-[11px] text-gold">
                  {APPROVAL.statusEndpoint}
                </code>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <span className="flex items-center gap-2 text-muted">
                  <Icon name="Hash" size={14} className="text-gold" /> Order ID
                </span>
                <button
                  type="button"
                  onClick={copyOrder}
                  className="focus-ring inline-flex items-center gap-2 rounded bg-surface-2/70 px-2 py-1 font-mono text-[11px] text-ink transition-colors hover:text-gold"
                >
                  {summary.orderId}
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            </dl>
          </div>

          {/* AFTER APPROVAL */}
          <div className="card p-6 sm:p-7">
            <Eyebrow>After Approval</Eyebrow>
            <p className="-mt-3 mb-5 text-[12.5px] text-muted">Mission Control will create your project.</p>
            <ol className="relative space-y-5 border-l border-line/20 pl-6">
              {AFTER_APPROVAL.map((a) => (
                <li key={a.title} className="relative">
                  <span className="absolute -left-[31px] inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold/40 bg-bg text-gold">
                    <Icon name={a.icon} size={12} />
                  </span>
                  <p className="text-[13px] font-medium text-gold">{a.title}</p>
                  <p className="text-[12.5px] leading-relaxed text-muted">{a.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* BUILT ON TRUST */}
      <Section className="!pt-2">
        <Eyebrow>Built on trust</Eyebrow>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CHECKOUT_TRUST.map((t) => (
            <TrustBlock key={t.title} point={t} variant="card" />
          ))}
        </div>
      </Section>
    </>
  );
}
