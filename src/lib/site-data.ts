import type {
  Operator,
  Badge,
  OperatorCategory,
  Partnership,
  ProcessStep,
  Stat,
  TrustPoint,
} from "./types";

/* ------------------------------------------------------------------ *
 * Brand + navigation
 * ------------------------------------------------------------------ */
export const BRAND = {
  name: "merQato.digital",
  tagline: "Built in Palawan. Designed for the world.",
  mission:
    "The marketplace where people and AI agents safely discover, compare, and request AI Operators, and digital infrastructure.",
  location: "San Vicente, Palawan, Philippines",
  contactEmail: "hello@merqato.digital",
};

export const NAV = [
  { label: "Home", to: "/" },
  { label: "AI Operators", to: "/agents" },
  { label: "Ecosystem", to: "/ecosystem" },
  { label: "Resort Agents", to: "/resort-agents" },
  { label: "TALA Research", to: "/tala-research" },
  { label: "Contact", to: "/contact" },
] as const;

export const HERO_BADGES = [
  { icon: "ShieldCheck", label: "AI agent ready" },
  { icon: "UserCheck", label: "Human-approved checkout" },
  { icon: "Palmtree", label: "Built in Palawan" },
] as const;

/* ------------------------------------------------------------------ *
 * Operator categories (filter pills on /agents)
 * ------------------------------------------------------------------ */
export const OPERATOR_CATEGORIES: {
  id: OperatorCategory | "all";
  label: string;
  icon: string;
}[] = [
  { id: "all", label: "All Operators", icon: "LayoutGrid" },
  { id: "hospitality", label: "Hospitality", icon: "Hotel" },
  { id: "booking", label: "Booking", icon: "CalendarCheck" },
  { id: "marketing", label: "Marketing", icon: "Megaphone" },
  { id: "lead-gen", label: "Lead Gen", icon: "Target" },
  { id: "operations", label: "Operations", icon: "Rocket" },
  { id: "local-business", label: "Local Business", icon: "Store" },
];

/* ------------------------------------------------------------------ *
 * AI Operators
 * ------------------------------------------------------------------ */
export const KAPWA = {
  id: "kapwa-resort-backoffice",
  kind: "operator",
  name: "KAPWA",
  icon: "Sparkles",
  tagline:
    "The all-in-one AI back office for resorts — guest service, bookings, lead gen, marketing, reviews, and operations in one coordinated system with human approval.",
  category: "hospitality",
  badges: [
    { label: "The main operator", tone: "gold" },
    { label: "AI-agent readable", tone: "gold" },
  ] as Badge[],
  humanApprovalRequired: true,
  agentReadable: true,
  featured: true,
  topRated: true,
  deploymentScope: ["1 Resort", "Multi-channel", "English + Tagalog", "24/7 Coverage", "Human approval workflows"] as string[],
  // The 8 capabilities bundled inside KAPWA (not sold separately).
  modules: [
    { id: "guest-concierge", name: "Guest Concierge", icon: "BellRing", desc: "24/7 instant answers, recommendations, seamless service." },
    { id: "booking-assistant", name: "Booking Assistant", icon: "CalendarCheck", desc: "Inquiries, availability, confirmed bookings — accurately." },
    { id: "lead-generation", name: "Lead Generation", icon: "Target", desc: "Find, qualify, and nurture high-value leads that convert.", source: "Queen OS" },
    { id: "social-media", name: "Social Media", icon: "Share2", desc: "Plan, draft, and publish content that grows presence.", source: "Queen OS" },
    { id: "review-manager", name: "Review Manager", icon: "Star", desc: "Monitor reviews, draft replies, protect reputation.", source: "Queen OS" },
    { id: "menu-ordering", name: "Menu & Ordering", icon: "UtensilsCrossed", desc: "Smart menus, upsells, order automation across channels." },
    { id: "revenue-followup", name: "Revenue Follow-up", icon: "Receipt", desc: "Recover lost bookings and drive repeat stays." },
  ],
  // Three tiers of the same KAPWA product.
  tiers: [
    {
      id: "kapwa-essential",
      label: "Essential",
      price: { amount: 3999, currency: "PHP", model: "monthly_subscription", suffix: "/ mo" },
      summary: "Core guest service + booking assistance.",
      includedServices: [
        "Guest Concierge",
        "Booking Assistant",
        "AI Agent Setup & Training",
        "Knowledge Base Configuration",
        "Channel Integrations (Web, WhatsApp, FB)",
        "Human Approval & Safety Review",
      ] as string[],
    },
    {
      id: "kapwa-full",
      label: "Full",
      price: { amount: 7999, currency: "PHP", model: "monthly_subscription", suffix: "/ mo" },
      summary: "Everything Essential plus growth & reputation.",
      includedServices: [
        "Guest Concierge",
        "Booking Assistant",
        "Lead Generation",
        "Social Media",
        "Review Manager",
        "Revenue Follow-up",
        "Performance Dashboard",
        "Human Approval & Safety Review",
      ] as string[],
    },
    {
      id: "kapwa-enterprise",
      label: "Enterprise",
      price: { amount: 0, currency: "PHP", model: "custom_quote", suffix: "custom quote" },
      summary: "Full plus menu/ordering, multi-property, custom integrations.",
      includedServices: [
        "All Full modules",
        "Menu & Ordering",
        "Multi-property support",
        "Custom system integrations",
        "Dedicated onboarding",
      ] as string[],
    },
  ],
} as const;

// Backwards-compatible operator list for the /agents grid + machine-readable catalog.
// KAPWA tiers are the only listed operators; modules ride inside KAPWA.
export const OPERATORS: Operator[] = [
  {
    id: KAPWA.tiers[1].id,
    kind: "operator",
    name: `${KAPWA.name} — Full`,
    icon: KAPWA.icon,
    tagline:
      "The complete AI back office for resorts — guest service, bookings, lead gen, social, reviews, menu & ordering, and revenue follow-up, all coordinated with human approval.",
    category: "hospitality",
    badges: [
      { label: "The main operator", tone: "gold" },
      { label: "Everything included", tone: "gold" },
      { label: "Human approval", tone: "crimson" },
    ],
    price: KAPWA.tiers[1].price,
    humanApprovalRequired: true,
    agentReadable: true,
    featured: true,
    topRated: true,
    deploymentScope: KAPWA.deploymentScope,
    includedServices: KAPWA.tiers[1].includedServices,
  },
];


export const FEATURED_OPERATOR_IDS = [
  "kapwa-full",
];




/* ------------------------------------------------------------------ *
 * Ecosystem partnerships
 * ------------------------------------------------------------------ */
export const PARTNERSHIPS: Partnership[] = [
  {
    id: "property-partner",
    kind: "partnership",
    name: "Property Partner",
    icon: "Building2",
    audience: "Hotels, resorts, villas, and serviced properties.",
    valueForPartner: [
      "Increased direct bookings",
      "AI-powered pricing & ops",
      "Performance insights",
    ],
  },
  {
    id: "local-business-partner",
    kind: "partnership",
    name: "Local Business Partner",
    icon: "Store",
    audience: "Tour operators, F&B, transport, wellness, and local services.",
    valueForPartner: [
      "Access more guests & agents",
      "Verified partner marketplace",
      "Transparent commissions",
      "Growth with Merqato",
    ],
  },
  {
    id: "technology-partner",
    kind: "partnership",
    name: "Technology Partner",
    icon: "Code2",
    audience: "SaaS, tools, integrations, and AI platforms.",
    valueForPartner: [
      "Co-build with real operators",
      "Open integration pathways",
      "Joint go-to-market",
      "Revenue opportunities",
    ],
  },
  {
    id: "founding-partner-program",
    kind: "partnership",
    name: "Founding Partner Program",
    icon: "Crown",
    audience: "Select partners shaping the future of Merqato.",
    inviteOnly: true,
    valueForPartner: [
      "Early access to roadmap",
      "Strategic collaboration",
      "Equity-aligned incentives",
      "Priority visibility & support",
    ],
  },
  {
    id: "revenue-share-pilot",
    kind: "partnership",
    name: "Revenue-Share Pilot",
    icon: "RefreshCcw",
    audience: "Pilot new solutions with performance-aligned terms.",
    inviteOnly: true,
    valueForPartner: [
      "Share in upside",
      "Lower upfront commitment",
      "Real-world co-validation",
      "Scalable outcomes",
    ],
  },
];

export const PARTNER_DASHBOARDS: { label: string; metric: string; title: string; body: string }[] = [
  { label: "Active Operators", metric: "128", title: "Active Operators", body: "See who is active, online, and delivering." },
  { label: "Onboarding Progress", metric: "72%", title: "Project Progress", body: "Track implementations, onboarding, and milestones." },
  { label: "Bookings (All Partners)", metric: "12.4K", title: "Business Outcomes", body: "Understand performance that drives results." },
  { label: "Human Oversight", metric: "98.2%", title: "Human Oversight", body: "Confirm what's approved, flagged, and resolved." },
];

export const PARTNER_TRUST: TrustPoint[] = [
  { icon: "ShieldCheck", title: "Every partnership is reviewed", body: "Commercial, operational, and ethical due diligence." },
  { icon: "UserCheck", title: "Human approval at every step", body: "No automation without validation by our team." },
  { icon: "FileCheck2", title: "Transparent agreements", body: "Clear terms, performance metrics, and expectations." },
  { icon: "Lock", title: "Partner-safe by design", body: "We protect your data, reputation, and your guests." },
];

export const PARTNER_STATS: Stat[] = [
  { value: "Built in Palawan", label: "Local team. Local partners. Global mindset.", sub: "palm" },
  { value: "50+", label: "Active Operators", sub: "Hospitality & commerce on the platform." },
  { value: "12.4K+", label: "Bookings Managed", sub: "Across stays, tours, and experiences." },
  { value: "98.2%", label: "Human Approval Rate", sub: "We keep humans in control — always." },
  { value: "Partner-Safe", label: "Role-based access. Data-minimal exposure.", sub: "lock" },
];

/* ------------------------------------------------------------------ *
 * Operator checkout process (shared on /agents + /checkout)
 * ------------------------------------------------------------------ */
export const AGENTIC_CHECKOUT_STEPS: ProcessStep[] = [
  { index: 1, title: "Compare", body: "AI agents compare operators, features, and pricing.", icon: "Search" },
  { index: 2, title: "Configure", body: "Select options, integrations, and service scope.", icon: "SlidersHorizontal" },
  { index: 3, title: "Human Approval", body: "We review requests for safety, brand fit, and quality.", icon: "UserCheck" },
  { index: 4, title: "Setup", body: "We deploy, connect systems, and test the operator.", icon: "Rocket" },
  { index: 5, title: "Mission Created", body: "Live in Mission Control with tracking, alerts, and reporting.", icon: "Gauge" },
];

export const OPERATOR_WHY: TrustPoint[] = [
  { icon: "Plus", title: "Transparent pricing", body: "Clear monthly rates or one-time fees. No hidden costs." },
  { icon: "ShieldCheck", title: "Safe by design", body: "Human approval before any deployment or charge." },
  { icon: "Users", title: "Human + AI together", body: "AI speed with human judgment for reliability." },
  { icon: "Gauge", title: "Proof of work", body: "Every operator is trackable with real-time results." },
];

/* ------------------------------------------------------------------ *
 * Operator checkout process (shared on /agents + /checkout)
 * ------------------------------------------------------------------ */
export const WHAT_YOU_CAN_DO = [
  {
    icon: "Bot",
    title: "AI Operators",
    body: "Hire specialized AI operators that work 24/7 to handle tasks, delight guests, and grow your business.",
    to: "/agents",
    cta: "Explore AI Operators",
  },
  {
    icon: "Handshake",
    title: "Ecosystem Partnerships",
    body: "Partner with merQato.digital to build, integrate, and scale the future of agentic commerce.",
    to: "/ecosystem",
    cta: "Partner With Us",
  },
];

export const BUY_WITH_CONFIDENCE: TrustPoint[] = [
  { icon: "ShieldCheck", title: "AI agents welcome here", body: "Our platform is designed for AI agents and their humans — structured, clear, and machine-friendly." },
  { icon: "UserCheck", title: "Human approval before payment or deployment", body: "Every purchase and deployment requires human validation for safety and quality." },
  { icon: "Lock", title: "Structured checkout for people and AI agents", body: "Transparent pricing, clear terms, and agent-readable confirmations." },
  { icon: "LineChart", title: "Proof of work", body: "Track performance, approvals, and results in real time." },
];

export const CHECKOUT_TRUST: TrustPoint[] = [
  { icon: "Receipt", title: "Transparent pricing", body: "Clear costs. No hidden fees." },
  { icon: "UserCheck", title: "Human-approved checkout", body: "Real people verify every order." },
  { icon: "LineChart", title: "Mission Control tracking", body: "Full visibility from day one." },
  { icon: "ShieldCheck", title: "Safe deployment", body: "Secure, aligned, and compliant." },
];

/* ------------------------------------------------------------------ *
 * Operator checkout process (shared on /agents + /checkout)
 * ------------------------------------------------------------------ */
export function formatPHP(amount: number): string {
  return "₱" + amount.toLocaleString("en-PH");
}

export function getOperator(id: string): Operator | undefined {
  return OPERATORS.find((o) => o.id === id);
}
