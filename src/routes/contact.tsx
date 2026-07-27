import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: 'Contact — Merqato' },
      { name: "description", content: 'Talk to the Merqato team about operators or ecosystem partnerships.' },
      { property: "og:title", content: 'Contact — Merqato' },
      { property: "og:description", content: 'Talk to the Merqato team about operators or ecosystem partnerships.' },
    ],
  }),
  component: Contact,
});

import { useState } from "react";
import { Check, Mail, MapPin, MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/site-data";
import { Section, Eyebrow, HeroBackdrop } from "@/components/site/Section";
import { StatusChip } from "@/components/site/StatusChip";
import { CTAButton } from "@/components/site/CTAButton";

const TOPICS = ["AI Operators", "Ecosystem Partnership", "Mission Control setup"];

function Contact() {
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = () => {
    // Demo only — no backend wired up.
    setSent(true);
  };

  return (
    <>
      <div className="relative">
        <HeroBackdrop />
        <div className="shell pb-6 pt-10 sm:pt-14">
          <div className="mb-6 flex flex-wrap gap-2.5">
            <StatusChip tone="outline">Human-first replies</StatusChip>
            <StatusChip tone="outline">2–4 business hours</StatusChip>
          </div>
          <h1 className="max-w-3xl font-display text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-[1] tracking-tight animate-fade-up">
            Let's build <span className="text-gold">together.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Request an operator or a partnership call. A real person from our Palawan team
            reviews and replies — no bots closing deals.
          </p>
        </div>
      </div>

      <Section className="!pt-6">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* FORM */}
          <div className="card p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Check size={26} />
                </span>
                <h3 className="font-display text-[26px] font-medium">Request received</h3>
                <p className="mt-2 max-w-sm text-[13.5px] text-muted">
                  Thanks{form.name ? `, ${form.name}` : ""}. Our team will review your request about
                  {" "}
                  <span className="text-gold">{topic}</span> and reply within 2–4 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="focus-ring mt-6 font-mono text-[12px] uppercase tracking-[0.12em] text-gold hover:text-gold-soft"
                >
                  Send another
                </button>
              </div>
            ) : (
              <>
                <Eyebrow>Send a request</Eyebrow>
                <div className="mb-5">
                  <p className="mb-2 text-[12px] text-muted">What's this about?</p>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        className={`focus-ring rounded-lg border px-3 py-2 text-[12.5px] transition-colors ${
                          topic === t
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-line/30 text-muted hover:border-gold/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Your name">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Nomad"
                      className="input"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="input"
                    />
                  </Field>
                  <Field label="Message">
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      placeholder="Tell us what you're looking for…"
                      className="input resize-none"
                    />
                  </Field>
                  <CTAButton variant="primary" full onClick={submit}>
                    Send request
                  </CTAButton>
                  <p className="text-center text-[11px] text-faint">
                    Demo form — submissions are not stored or sent yet.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* INFO */}
          <div className="space-y-5">
            <div className="card p-6">
              <Eyebrow>Reach us</Eyebrow>
              <div className="space-y-4">
                <InfoRow icon={<MapPin size={16} />} title="Based in" body={BRAND.location} />
                <InfoRow icon={<Mail size={16} />} title="Email" body={BRAND.contactEmail} />
                <InfoRow icon={<MessageCircle size={16} />} title="WhatsApp" body="Human support during PH business hours" />
              </div>
            </div>

            <div className="card border-gold/25 p-6">
              <Eyebrow>For AI Agents</Eyebrow>
              <p className="text-[13px] leading-relaxed text-muted">
                Agents can submit structured requests and read our machine-readable catalog. Final
                approval always requires a human.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <CTAButton href="/agent-commerce.json" variant="secondary" arrow={false}>
                  agent-commerce.json
                </CTAButton>
                <CTAButton href="/ai-manifest.json" variant="ghost" arrow={false}>
                  ai-manifest.json
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-muted">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/25 text-gold">
        {icon}
      </span>
      <div>
        <p className="text-[12px] text-faint">{title}</p>
        <p className="text-[13.5px] text-ink">{body}</p>
      </div>
    </div>
  );
}
