import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/agent-policy")({
  head: () => ({
    meta: [
      { title: "Agent Policy — Merqato" },
      {
        name: "description",
        content:
          "How merQato AI agents behave — draft-first human approval, model transparency, data handling, and escalation.",
      },
      { property: "og:title", content: "Agent Policy — Merqato" },
      {
        property: "og:description",
        content:
          "How merQato AI agents behave — draft-first human approval, model transparency, data handling, and escalation.",
      },
    ],
  }),
  component: AgentPolicy,
});

import { ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";

const AGENT_POLICY_DATE = "July 29, 2026";

function AgentPolicy() {
  return (
    <>
      <Section>
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-medium leading-[0.95] tracking-tight">
          Agent Policy
        </h1>
        <p className="mt-2 text-[13px] text-faint font-mono">Last updated: {AGENT_POLICY_DATE}</p>
      </Section>

      <Section>
        <div className="prose prose-sm max-w-none text-[14px] leading-relaxed text-ink/90 space-y-6">
          <section>
            <h2 className="font-display text-lg font-medium mb-2">1. Overview</h2>
            <p>
              This policy explains how merQato's AI agents behave, what they can and cannot do, and
              what happens when something goes wrong.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">2. Draft-First, Human-Approved</h2>
            <p>
              Our agents never publish, send, book, or charge anything autonomously. Every agent
              action — including social media drafts, booking confirmations, and guest replies — is
              queued for human review and approval before it goes live.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">3. AI Models We Connect To</h2>
            <p>Agents can run on:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>OpenRouter</strong> — a gateway to multiple AI model providers (e.g.,
                community models, commercial models). Your OpenRouter API key is configured in the
                Operator Admin. We do not store your OpenRouter key.
              </li>
              <li>
                <strong>Local Ollama</strong> — runs AI models on your own hardware. No data leaves
                your machine.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">4. What Agents Do NOT Do</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Our agents do not make binding commitments on behalf of your business
              </li>
              <li>Our agents do not process payments directly</li>
              <li>
                Our agents do not access your guests' personal data unless you provide it in a
                prompt
              </li>
              <li>
                Our agents do not store conversation history between sessions (each interaction is
                stateless)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">5. Human Escalation</h2>
            <p>
              Every agent workflow includes a human approval step. If an agent cannot complete a
              task or generates unsatisfactory output, the request stays in queue for manual review.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">6. Model Transparency</h2>
            <p>
              When you configure an agent, you choose the model. You can switch models at any time.
              Model performance and outputs vary — we do not guarantee specific quality levels for
              any particular model.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">7. Rate Limits and Availability</h2>
            <p>
              AI model providers may impose rate limits. If a model is unavailable, agents will
              return an error message rather than making up a response. This is by design — we
              prefer a clear error over a hallucinated answer.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">8. Feedback</h2>
            <p>
              If an agent produces incorrect or harmful output, flag it through the Operator Admin.
              We use that feedback to inform model configuration decisions — we do not retrain or
              fine-tune models without explicit agreement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">9. Contact</h2>
            <p>
              Questions about agent behavior? Email{" "}
              <a href="mailto:hello@merqato.digital" className="text-gold underline">
                hello@merqato.digital
              </a>
              .
            </p>
          </section>
        </div>
      </Section>

      <Section className="!pt-2">
        <CTAButton href="/checkout" variant="primary">
          Request an Operator
          <ArrowRight size={14} />
        </CTAButton>
      </Section>
    </>
  );
}