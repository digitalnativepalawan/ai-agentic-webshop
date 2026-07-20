import { useState } from "react";
import { ArrowRight, Megaphone } from "lucide-react";
import { Icon } from "./Icon";
import { StatusChip } from "./StatusChip";
import { hasConfig } from "@/lib/agentConfig";
import { generate } from "@/lib/openrouter";

/* ------------------------------------------------------------------ *
 * Resort Growth Agent — interactive, playable on the site.
 * OpenRouter-direct (partner pastes a key; free models work).
 * No pricing/commerce. Season-aware + theme-driven drafts.
 * ------------------------------------------------------------------ */

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "red", label: "RED 小红书" },
];

const LANGS = [
  { id: "en", label: "English" },
  { id: "tl", label: "Tagalog" },
  { id: "zh", label: "中文" },
];

function seasonNow(): { mode: "offpeak" | "peak"; label: string } {
  const m = new Date().getMonth() + 1; // 1-12
  // Palawan: off-peak / rainy season Jun-Oct
  if (m >= 6 && m <= 10) return { mode: "offpeak", label: "Off-peak / rainy season — nomad mode" };
  return { mode: "peak", label: "Peak season — experience & F&B mode" };
}

const SYSTEM = `You are the Palawan Resort Growth Agent — a senior hospitality social-media copywriter.
Your ONE job: write a finished, publish-ready social media post. Not a summary, not bullet points, not an ad brief.
Voice: KAPWA — warm, specific, credible, never generic 'luxury'. Use real facts only.
Rules:
- Hook in line 1. Then 1-2 short body lines. Then the offer/feature. Then a soft CTA.
- Keep it tight: Instagram 4-6 lines, TikTok 3-4 short lines (script style), RED 5-8 lines with emojis.
- Lead with connectivity (Starlink + Globe + Smart) when talking to remote workers — that is the resort's edge.
- Tagalog/中文: natural, conversational, not translated-sounding. End with 2-3 relevant hashtags.
- Never invent prices, rooms, or amenities that aren't in the brief. Weave facts into a real post.

EXAMPLE (Instagram, off-peak, English, theme "work from the beach"):
🌧️ Rainy season in Palawan? Perfect for working from paradise. ☔💻
Trade Manila's gridlock for our beachfront desk, backed by Starlink and dual telco (Globe + Smart) — your calls stay crisp through any downpour.
🌟 Monthly nomad stay ₱35,000 all-in: Garden Room or equivalent, free airport pickup, co-work corner, weekly community dinners, 10% off F&B. Min 28 nights.
Message us for the monthly rate. 🌊
#DigitalNomads #PalawanResort #WorkFromBeach`;

function buildPrompt(platform: string, lang: string, asset: string, mode: string): string {
  const langName = LANGS.find((l) => l.id === lang)?.label ?? "English";
  const conn = "Starlink + Globe + Smart (triple-redundant internet)";
  if (mode === "offpeak") {
    const base = `PLATFORM: ${platform} | LANGUAGE: ${langName} | MODE: off-peak / rainy season (nomad)
AUDIENCE: digital nomads & remote workers staying 3-8 weeks.
OFFER: Monthly nomad stay ₱35,000/mo all-in — Garden Room or equivalent, free airport pickup, co-work corner (desk+monitor), weekly community dinners, 10% off F&B. Min 28 nights.
CONNECTIVITY (lead with this): ${conn}.
Write ONE finished ${platform} post in ${langName} selling this monthly nomad package. Hook = 'you can actually work here'. Use the example style.`;
    return asset.trim()
      ? `${base} ANGLE / THEME to weave through: ${asset.trim()}. Tie the theme to the nomad offer + connectivity.`
      : base;
  }
  const focus = asset.trim() || "the resort's food & experiences";
  return `PLATFORM: ${platform} | LANGUAGE: ${langName} | MODE: peak season
AUDIENCE: tourists planning a Palawan trip.
FOCUS: experience + F&B that drives bookings / walk-ins. Feature: ${focus}.
CONNECTIVITY (mention only if relevant): ${conn}.
Write ONE finished ${platform} post in ${langName} that makes ${focus} feel unmissable and drives a visit/booking. Use the example style.`;
}

export function ResortGrowthFeature() {
  const [platform, setPlatform] = useState("instagram");
  const [lang, setLang] = useState("en");
  const [asset, setAsset] = useState("");
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const season = seasonNow();
  const keyReady = hasConfig();

  async function runGenerate() {
    setError(null);
    if (!keyReady) {
      setError("Connect a model in Operator Admin (OpenRouter or local Ollama) to generate a draft.");
      return;
    }
    setStreaming(true);
    setDraft("");
    const prompt = buildPrompt(platform, lang, asset, season.mode);
    try {
      const out = await generate({ system: SYSTEM, user: prompt, maxTokens: 700, onToken: setDraft });
      if (!out.trim()) setError("No content returned — try a different model or check the connection.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setStreaming(false);
    }
  }

  function copyDraft() {
    if (draft) navigator.clipboard?.writeText(draft);
  }

  return (
    <div className="card overflow-hidden border-gold/25 p-0">
      <div className="grid gap-0 lg:grid-cols-2">
        {/* LEFT: pitch + controls */}
        <div className="flex flex-col gap-5 border-b border-line/15 p-7 lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap gap-2">
            <StatusChip tone="gold" icon={<Megaphone size={12} />}>Live agent</StatusChip>
            <StatusChip tone="outline">Season-aware</StatusChip>
            <StatusChip tone="outline">Multilingual</StatusChip>
            <StatusChip tone="outline">Draft-first</StatusChip>
          </div>

          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gold/[0.06] text-gold">
              <Megaphone size={22} strokeWidth={1.6} />
            </span>
            <div>
              <p className="eyebrow !mb-1.5">Resort Growth Agent</p>
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-medium leading-[1.05] tracking-tight">
                Fills the rooms <span className="text-gold">year-round.</span>
              </h2>
            </div>
          </div>

          <p className="text-[14px] leading-relaxed text-muted">
            Generates real social posts — rainy season → Starlink-led nomad packages; peak → experience &amp;
            F&B. Pick a platform and language, add a theme, and watch it write.
          </p>

          <div className="flex flex-wrap gap-2">
            <StatusChip tone="outline" icon={<Icon name="Wifi" size={13} className="text-gold" />}>
              {season.label}
            </StatusChip>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[12px] text-muted">
              Platform
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="focus-ring rounded-md border border-line/25 bg-bg/60 px-3 py-2 text-[13px] text-ink"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] text-muted">
              Language
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="focus-ring rounded-md border border-line/25 bg-bg/60 px-3 py-2 text-[13px] text-ink"
              >
                {LANGS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-[12px] text-muted">
            Theme / feature asset (optional)
            <input
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="e.g. el nido digital nomads, Bahura Kitchen Sunday Boodle"
              className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2 text-[13px] text-ink placeholder:text-faint"
            />
          </label>

          {keyReady && (
            <p className="text-[12px] text-emerald-600">
              API key connected in Operator Admin — partners can play without pasting a key.
            </p>
          )}

          <div className="mt-1 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runGenerate}
              disabled={streaming}
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-gold bg-gold px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[#0b0b0b] transition-colors hover:bg-gold/90 disabled:opacity-50"
            >
              <Megaphone size={13} />
              {streaming ? "Writing…" : "Generate draft"}
            </button>
          </div>
          {error && (
            <p className="rounded-md border border-crimson/30 bg-crimson/[0.05] px-3 py-2 text-[12px] leading-relaxed text-crimson">
              {error}
            </p>
          )}
        </div>

        {/* RIGHT: draft output */}
        <div className="flex flex-col gap-4 bg-surface-2/30 p-7">
          <div className="flex items-center justify-between">
            <p className="eyebrow !mb-0">Draft (pending approval)</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              {season.mode === "offpeak" ? "offpeak" : "peak"} · {platform} · {lang}
            </span>
          </div>

          <div className="min-h-[180px] flex-1 rounded-md border border-line/25 bg-bg/60 p-4 font-[15px] leading-relaxed text-ink">
            {draft ? (
              <span className="whitespace-pre-wrap">{draft}</span>
            ) : (
              <span className="text-faint">
                {streaming ? "Writing your post…" : "Your generated post appears here. Paste a key and hit Generate."}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={copyDraft}
            disabled={!draft}
            className="focus-ring inline-flex w-fit items-center gap-2 rounded-md border border-gold/40 bg-gold/[0.08] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gold transition-colors hover:border-gold hover:bg-gold/15 disabled:opacity-50"
          >
            Copy draft
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
