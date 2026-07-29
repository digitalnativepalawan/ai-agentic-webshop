import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tala-research")({
  head: () => ({
    meta: [
      { title: "TALA Research Lab — Merqato" },
      {
        name: "description",
        content:
          "TALA Research Lab — run real web research for your business, audience, and location. Get verified source reports.",
      },
      { property: "og:title", content: "TALA Research Lab — Merqato" },
      {
        property: "og:description",
        content: "Run real web research and get verified source reports.",
      },
    ],
  }),
  component: TALAResearch,
});

import { useState } from "react";
import { ArrowRight, ChevronDown, Globe, Loader2, Search, Ship } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { CTAButton } from "@/components/site/CTAButton";
import { Icon } from "@/components/site/Icon";

const VITE_TALA_API_URL =
  import.meta.env.VITE_TALA_API_URL || "http://localhost:8002";

interface SourceCard {
  title: string;
  url: string;
  domain: string;
  evidence: string;
  retrieval_status: string;
}

interface Report {
  summary: string;
  audience_signals: string[];
  problems_and_objections: string[];
  opportunities: string[];
  investor_channels: string[];
  recommended_next_actions: string[];
  sources: SourceCard[];
}

const PRELOAD = {
  business: "Marina Terrace",
  location: "San Vicente, Palawan",
  audience: "Digital nomads and sustainable-tourism investors",
  question:
    "Find evidence of people seeking peaceful island stays with reliable internet and a small community. Identify credible investor networks or channels interested in sustainable tourism, community hospitality or Palawan.",
};

export function TALAResearch() {
  const [form, setForm] = useState({
    business: PRELOAD.business,
    location: PRELOAD.location,
    audience: PRELOAD.audience,
    question: PRELOAD.question,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runResearch() {
    setLoading(true);
    setError(null);
    setReport(null);

    const steps = ["Searching the web…", "Reading verified sources…", "Building report…"];
    for (let i = 0; i < steps.length; i++) {
      setProgress(steps[i]);
      await new Promise((r) => setTimeout(r, 400));
    }

    try {
      const res = await fetch(`${VITE_TALA_API_URL}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Research failed (${res.status})`);
      }
      const data: { report: Report } = await res.json();
      setReport(data.report);
      setProgress("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Research failed.");
      setProgress("");
    } finally {
      setLoading(false);
    }
  }

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      {/* HERO */}
      <div className="relative">
        <HeroBackdrop />
        <div className="shell pb-6 pt-10 sm:pt-14">
          <div className="mb-8 flex flex-wrap gap-2.5">
            <StatusChip tone="gold">TALA Research</StatusChip>
            <StatusChip tone="outline">Web Research</StatusChip>
            <StatusChip tone="outline">Verified Sources</StatusChip>
          </div>

          <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.6rem)] font-medium leading-[0.98] tracking-tight animate-fade-up">
            TALA Research Lab
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            Enter your business, location, audience, and research question. TALA runs real
            web research and returns a concise report with verified source links.
          </p>
        </div>
      </div>

      {/* RESEARCH FORM */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* LEFT: form */}
          <div className="card border-gold/25 p-7">
            <h2 className="font-display text-[1.4rem] font-medium mb-5">Research Setup</h2>

            <div className="grid gap-4">
              <label className="flex flex-col gap-1.5 text-[12px] text-muted">
                Business
                <input
                  type="text"
                  value={form.business}
                  onChange={(e) => update("business", e.target.value)}
                  placeholder="e.g. Marina Terrace"
                  className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2.5 text-[14px] text-ink placeholder:text-faint"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[12px] text-muted">
                Location
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. San Vicente, Palawan"
                  className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2.5 text-[14px] text-ink placeholder:text-faint"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[12px] text-muted">
                Audience
                <select
                  value={form.audience}
                  onChange={(e) => update("audience", e.target.value)}
                  className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2.5 text-[14px] text-ink"
                >
                  <option value="Digital nomads and sustainable-tourism investors">Digital nomads and sustainable-tourism investors</option>
                  <option value="Resort guests seeking wellness retreats">Resort guests seeking wellness retreats</option>
                  <option value="Remote workers looking for island stays">Remote workers looking for island stays</option>
                  <option value="Eco-tourism families">Eco-tourism families</option>
                  <option value="Adventure travelers">Adventure travelers</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-[12px] text-muted">
                Research Question
                <textarea
                  value={form.question}
                  onChange={(e) => update("question", e.target.value)}
                  rows={4}
                  placeholder="What do you want to know?"
                  className="focus-ring w-full resize-none rounded-md border border-line/25 bg-bg/60 px-3 py-2.5 text-[14px] text-ink placeholder:text-faint"
                />
              </label>

              <button
                type="button"
                onClick={runResearch}
                disabled={loading}
                className="focus-ring mt-2 inline-flex items-center gap-2 rounded-md border border-gold bg-gold px-5 py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-[#0b0b0b] transition-colors hover:bg-gold/90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Search size={14} />
                )}{" "}
                {loading ? "Researching…" : "Run Research"}
              </button>
            </div>
          </div>

          {/* RIGHT: results */}
          <div className="flex flex-col gap-5">
            {error && (
              <div className="rounded-md border border-crimson/30 bg-crimson/[0.05] px-4 py-3 text-[13px] text-crimson">
                {error}
              </div>
            )}

            {progress && !report && (
              <div className="flex items-center gap-3 rounded-md border border-gold/25 bg-gold/[0.03] px-4 py-3 text-[13px] text-muted">
                <Loader2 size={14} className="animate-spin" />
                {progress}
              </div>
            )}

            {report && (
              <div className="flex flex-col gap-6">
                {/* Summary */}
                <div className="card border-gold/25 p-6">
                  <h3 className="eyebrow mb-3">Summary</h3>
                  <p className="text-[14px] leading-relaxed text-ink/90">
                    {report.summary}
                  </p>
                </div>

                {/* Audience Signals */}
                {report.audience_signals.length > 0 && (
                  <div className="card p-6">
                    <h3 className="eyebrow mb-3 flex items-center gap-2">
                      <Globe size={14} className="text-gold" /> Audience Signals
                    </h3>
                    <ul className="space-y-1.5">
                      {report.audience_signals.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-[13px] leading-snug text-ink/80">
                          <span className="mt-0.5 text-gold">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Problems */}
                {report.problems_and_objections.length > 0 && (
                  <div className="card p-6">
                    <h3 className="eyebrow mb-3 flex items-center gap-2">
                      <ChevronDown size={14} className="text-gold" /> Problems &amp; Objections
                    </h3>
                    <ul className="space-y-1.5">
                      {report.problems_and_objections.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-[13px] leading-snug text-ink/80">
                          <span className="mt-0.5 text-gold">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Opportunities */}
                {report.opportunities.length > 0 && (
                  <div className="card p-6">
                    <h3 className="eyebrow mb-3">Opportunities</h3>
                    <ul className="space-y-1.5">
                      {report.opportunities.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-[13px] leading-snug text-ink/80">
                          <span className="mt-0.5 text-gold">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Investor Channels */}
                {report.investor_channels.length > 0 && (
                  <div className="card p-6">
                    <h3 className="eyebrow mb-3">Investor Channels</h3>
                    <ul className="space-y-1.5">
                      {report.investor_channels.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-[13px] leading-snug text-ink/80">
                          <span className="mt-0.5 text-gold">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Next Actions */}
                {report.recommended_next_actions.length > 0 && (
                  <div className="card p-6">
                    <h3 className="eyebrow mb-3">Recommended Next Actions</h3>
                    <ul className="space-y-1.5">
                      {report.recommended_next_actions.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-[13px] leading-snug text-ink/80">
                          <span className="mt-0.5 text-gold">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Source Cards */}
                {report.sources.length > 0 && (
                  <div className="card p-6">
                    <h3 className="eyebrow mb-4">Verified Sources</h3>
                    <div className="flex flex-col gap-3">
                      {report.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-line/15 bg-surface-2/30 p-4 transition-colors hover:border-gold/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[13px] font-medium text-ink">{src.title}</p>
                              <p className="mt-0.5 text-[11px] font-mono text-faint">
                                {src.domain} · {src.retrieval_status}
                              </p>
                            </div>
                            <Globe size={12} className="mt-1 shrink-0 text-gold" />
                          </div>
                          <p className="mt-2 text-[12px] leading-relaxed text-muted"> {src.evidence}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deploy CTA */}
                <div className="card border-gold/25 p-6 flex flex-col items-center gap-3 text-center">
                  <Ship size={22} className="text-gold" />
                  <h3 className="font-display text-xl font-medium">Ready to deploy TALA?</h3>
                  <p className="text-[13px] leading-relaxed text-muted max-w-sm">
                    Let TALA run your competitor research, audience analysis, and market
                    intelligence — continuously, with verified sources.
                  </p>
                  <Link to="/contact">
                    <CTAButton variant="primary">
                      Deploy TALA
                      <ArrowRight size={14} />
                    </CTAButton>
                  </Link>
                </div>
              </div>
            )}

            {!report && !loading && !progress && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
                <Search size={28} className="mb-3 text-faint" />
                <p className="text-[13px]">Fill in the form and hit Run Research.</p>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}