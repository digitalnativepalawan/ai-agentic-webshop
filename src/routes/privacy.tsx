import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Merqato" },
      {
        name: "description",
        content:
          "Privacy policy for merQato — what data we collect, how AI agents process it, and your rights under the Philippine Data Privacy Act.",
      },
      { property: "og:title", content: "Privacy Policy — Merqato" },
      {
        property: "og:description",
        content:
          "Privacy policy for merQato — what data we collect, how AI agents process it, and your rights under the Philippine Data Privacy Act.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

import { ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";

const PRIVACY_DATE = "July 29, 2026";

function PrivacyPolicy() {
  return (
    <>
      <Section>
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-medium leading-[0.95] tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13px] text-faint font-mono">Last updated: {PRIVACY_DATE}</p>
      </Section>

      <Section>
        <div className="prose prose-sm max-w-none text-[14px] leading-relaxed text-ink/90 space-y-6">
          <section>
            <h2 className="font-display text-lg font-medium mb-2">1. What We Collect</h2>
            <p>
              We collect information you provide directly when using our Services:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Name, email, and business details when requesting an agent</li>
              <li>Chat content you submit to AI agents for processing</li>
              <li>
                Checkout and payment information (processed by PayMongo, stored on their servers —
                we do not store card details)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">2. How We Use Your Data</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Configure and operate AI agents on your behalf</li>
              <li>Process bookings and payments</li>
              <li>Respond to support requests</li>
              <li>Improve our Services (aggregated, anonymized data only)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">3. AI Model Data Flow</h2>
            <p>
              When an agent processes a request, your input is sent to a third-party AI model
              provider (OpenRouter or a local Ollama instance you control). The model provider may
              log or store interaction data according to its own privacy policy. We do not sell or
              share your data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">4. Data Retention</h2>
            <p>
              Agent interaction logs and booking records are retained for as long as necessary to
              provide support and comply with applicable Philippine regulations (including RA 10173
              — Data Privacy Act of 2012).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">5. Your Rights</h2>
            <p>
              Under the Philippine Data Privacy Act of 2012, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Withdraw consent for processing</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, email{" "}
              <a href="mailto:hello@merqato.digital" className="text-gold underline">
                hello@merqato.digital
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">6. Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your data.
              However, no method of electronic transmission is 100% secure. We cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">7. Children's Privacy</h2>
            <p>
              Our Services are not directed to individuals under 18. We do not knowingly collect
              data from minors.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">8. Changes to This Policy</h2>
            <p>
              We will notify you of material changes via email or a notice on our site. The
              "Last updated" date at the top of this page indicates when it was most recently
              revised.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium mb-2">9. Contact</h2>
            <p>
              Questions about this policy? Email{" "}
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