import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { BRAND } from "@/lib/site-data";
import { StatusChip } from "./StatusChip";

const COLUMNS = [
  {
    heading: "Marketplace",
    links: [
      { label: "AI Operators", to: "/agents" },
      { label: "Nomad Stays", to: "/stays" },
      { label: "Ecosystem Partnerships", to: "/ecosystem" },
      { label: "All Categories", to: "/agents" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/contact" },
      { label: "Mission", to: "/mission-control" },
      { label: "Careers", to: "/contact" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help Center", to: "/contact" },
      { label: "Guides", to: "/contact" },
      { label: "API for Agents", to: "/checkout" },
      { label: "Status", to: "/mission-control" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  return (
    <footer className="mt-24 border-t border-line/20 pt-14">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.5fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-display text-[20px] font-medium leading-none">
                <span className="text-ink">mer</span><span className="text-gold">Q</span><span className="text-ink">ato</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted">
              {BRAND.mission}
            </p>
            <p className="mt-4 text-[13px] font-medium text-gold">{BRAND.tagline}</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="eyebrow mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[13px] text-muted transition-colors hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="eyebrow mb-4">Stay in the loop</h4>
            <p className="mb-3 text-[13px] text-muted">
              Updates, new operators, and Palawan insights.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-gold/30 p-1.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="focus-ring w-full bg-transparent px-2 py-1.5 text-[13px] text-ink placeholder:text-faint focus:outline-none"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="focus-ring inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-md bg-gold text-[#0b0b0b] transition-colors hover:bg-gold-soft"
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line/20 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {[Twitter, Linkedin, Instagram, Mail].map((I, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 text-muted transition-colors hover:border-gold/60 hover:text-gold"
              >
                <I size={14} />
              </a>
            ))}
          </div>
          <p className="text-[12px] text-faint">
            © {new Date().getFullYear()} merQato.digital · All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-faint">
            <a href="#" className="hover:text-gold">Terms of Service</a>
            <a href="#" className="hover:text-gold">Privacy Policy</a>
            <a href="#" className="hover:text-gold">Agent Policy</a>
            <StatusChip tone="gold" icon={<span className="font-mono text-[10px]">{"</>"}</span>}>
              AI-READABLE
            </StatusChip>
          </div>
        </div>
      </div>
    </footer>
  );
}
