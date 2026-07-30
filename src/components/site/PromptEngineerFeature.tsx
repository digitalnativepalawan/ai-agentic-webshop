import { useState } from "react";
import { ArrowRight, Code2, Loader2, Select, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { hasConfig } from "@/lib/agentConfig";
import { generate } from "@/lib/openrouter";
import { StatusChip } from "./StatusChip";
import { CTAButton } from "./CTAButton";

const PE_SYSTEM =
  "You are the Merqato Prompt Engineer — a senior prompt architect for hospitality web experiences. " +
  "Given a rough client request, you (1) list the specific requirements you must clarify before writing, " +
  "and (2) produce a production-grade prompt contract. Voice: precise, structured, no fluff. " +
  "Rules: real facts only; flag any assumption for human review; never invent resort details.";

// OpenRouter models - both free and paid options
const MODELS = [
  { value: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash (Free)" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (Free)" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "openai/gpt-4.5-preview", label: "GPT-4.5 Preview" },
  { value: "anthropic/claude-3.7-sonnet", label: "Claude 3.7 Sonnet" },
];

export function PromptEngineerFeature() {
  const [request, setRequest] = useState(
    "Build me a landing page for my resort in El Nido"
  );
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.0-flash");
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
        model: selectedModel, // Use selected model
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
        model: selectedModel, // Use selected model
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
            <StatusChip tone="gold" icon={<Sparkles size={12} />}>
              Live agent
            </StatusChip>
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
            Turns rough ideas into production-grade prompt contracts for landing pages, web apps,
            and agent workflows — with requirements analysis, design QA, test cases, and version
            control.
          </p>

          {/* Model Selection Dropdown */}
          <div className="w-full">
            <label className="text-[12px] text-muted mb-1.5 block">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2 text-[13px] text-ink focus:ring-2 focus:ring-gold focus:border-gold"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

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
            <CTAButton href="/merqato-catalog.json" variant="secondary">
              Agent-readable spec
            </CTAButton>
          </div>
        </div>

        {/* RIGHT: interactive */}
        <div className="flex flex-col gap-4 bg-surface-2/30 p-7">
          <div className="flex items-center justify-between">
            <p className="eyebrow !mb-0">Live workflow</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              {busy
                ? "generating…"
                : phase === "contract"
                  ? "contract ready"
                  : phase === "questions"
                    ? "requirements ready"
                    : "idle"}
            </span>
          </div>

          <label htmlFor="pe-request" className="text-[12px] text-muted">
            Rough request
          </label>
          <textarea
            id="pe-request"
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
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  Requirements to clarify
                </p>
                <button
                  onClick={() => copy(questions)}
                  className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold/80 hover:text-gold"
                >
                  Copy
                </button>
              </div>
              <div className="max-h-44 overflow-auto whitespace-pre-wrap rounded-md border border-line/20 bg-bg/40 p-3 text-[12.5px] leading-relaxed text-ink">
                {questions}
              </div>
            </div>
          )}

          {contract && (
            <div className="animate-fade-up">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  Prompt contract
                </p>
                <button
                  onClick={() => copy(contract)}
                  className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold/80 hover:text-gold"
                >
                  Copy
                </button>
              </div>
              <div className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-dashed border-line/25 bg-bg/40 p-3 text-[12.5px] leading-relaxed text-ink">
                {contract}
              </div>
            </div>
          )}

          {!questions && !contract && !error && (
            <p className="text-[12.5px] leading-relaxed text-faint">
              Type a rough request, hit Analyze. The agent streams the real requirements to
              clarify, then a full prompt contract.
            </p>
          )}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              Design &amp; QA markers
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {[
                {
                  label: "390 px",
                  detail: "Mobile — thumb-reach CTA, no horizontal scroll.",
                },
                {
                  label: "768 px",
                  detail: "Tablet — hero legibility, 2-col feature grid.",
                },
                {
                  label: "1440 px",
                  detail: "Desktop — max-width guard, image sharpness.",
                },
                {
                  label: "WCAG AA",
                  detail: "Contrast ≥ 4.5:1, focus rings, alt text, keyboard traversal.",
                },
              ].map((m) => (
                <li
                  key={m.label}
                  className="rounded-md border border-dashed border-line/25 bg-bg/40 p-2.5"
                >
                  <p className="font-mono text-[11px] text-gold">{m.label}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{m.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-md border border-crimson/30 bg-crimson/[0.05] px-3 py-2 text-[11.5px] leading-relaxed text-crimson">
            Human approval required before publish. All assumptions and unresolved facts are
            surfaced for sign-off.
          </p>
        </div>
      </div>
    </div>
  );
}