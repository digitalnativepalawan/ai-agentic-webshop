import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Merqato" },
      {
        name: "description",
        content:
          "Terms of service for merQato AI operators — acceptable use, booking and checkout terms, limitation of liability, and governing law.",
      },
      { property: "og:title", content: "Terms of Service — Merqato" },
      {
        property: "og:description",
        content:
          "Terms of service for merQato AI operators — acceptable use, booking and checkout terms, limitation of liability.",
      },
    ],
  }),
  component: TermsOfService,
});

import { ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";

const TERMS_DATE = "July 29, 2026";

function TermsOfService() {
  return (
    <>
      <Section>
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-medium leading-[0.95] tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-[13px] text-faint font-mono">Last updated: {TERMS_DATE}</p>
      </Section>

      <Section>
        <div className="prose prose-sm max-w-none text-[14px] leading-relaxed text-ink/90 space-y-6">
          <section>
            <h2 className="font-display text-lg font-medium mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using merQato's AI operator services (the "Services"), you agree to
              these Terms of Service. If you are booking on behalf of a business, you represent that
              you have authority to bind that business to these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">2. What We Provide</h2>
            <p>
              We provide AI-powered operator agents for hospitality businesses. Our agents assist
              with guest inquiries, booking management, social media content drafts, and
              administrative tasks. Agents are draft-first and human-approved — they do not publish,
              charge, or take action without human confirmation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">3. Booking and Checkout</h2>
            <p>
              Bookings are processed through our checkout flow. Pricing for custom-quote operators is
              determined after discussion. Payment is collected via PayMongo (GCash, debit/credit
              cards). Once a booking is confirmed, a human operator reviews the request before the
              agent is configured.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">4. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You
              are responsible for all activity under your account. You must provide accurate information
              when requesting agent setup.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">5. Agent Usage</h2>
            <p>
              Our agents may connect to AI models hosted by third-party providers (OpenRouter, local
              Ollama). We do not control model outputs. You use agent-generated content at your own
              discretion. Agents do not replace professional legal, medical, or financial advice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">6. Prohibited Use</h2>
            <p>You may not use our Services to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Generate spam, deceptive content, or impersonate real people or businesses
              </li>
              <li>Violate applicable laws or regulations</li>
              <li>
                Attempt to reverse-engineer, extract model weights from, or otherwise circumvent our
                agent infrastructure
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">7. Limitation of Liability</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE ARE NOT LIABLE
              FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM USE OF OUR AGENTS.
              OUR TOTAL LIABILITY IS LIMITED TO THE AMOUNT PAID FOR THE SPECIFIC SERVICE GIVING RISE
              TO THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">8. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Republic of the Philippines. Any disputes
              shall be resolved in the courts of the Philippines.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">9. Contact</h2>
            <p>
              Questions about these terms? Email{" "}
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