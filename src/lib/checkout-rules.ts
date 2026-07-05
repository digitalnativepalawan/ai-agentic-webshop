import type {
  AgentAction,
  CheckoutSummary,
  HumanGatedAction,
  Operator,
  OrderDraft,
} from "./types";
import { OPERATORS, PARTNERSHIPS, STAYS } from "./site-data";

/* ============================================================
   Human-in-the-loop rules for the whole marketplace.
   Single source of truth used by UI + agent endpoints.
   ============================================================ */

export const AGENT_ALLOWED: { action: AgentAction; label: string }[] = [
  { action: "browse", label: "Browse offers" },
  { action: "compare", label: "Compare offers" },
  { action: "prepare_checkout", label: "Prepare checkout" },
  { action: "request_availability", label: "Request availability" },
  { action: "request_setup", label: "Request setup" },
  { action: "request_quote", label: "Request quote" },
  { action: "view_status", label: "View status" },
];

export const HUMAN_GATED: { action: HumanGatedAction; label: string }[] = [
  { action: "final_payment", label: "Final payment" },
  { action: "confirmed_booking", label: "Confirmed booking" },
  { action: "deployment", label: "Deployment" },
  { action: "account_connection", label: "Account connection" },
  { action: "public_posting", label: "Public posting" },
  { action: "partnership_approval", label: "Partnership approval" },
];

export const APPROVAL = {
  averageTime: "2–4 business hours",
  endpoint: "POST /v1/checkout/request-approval",
  statusEndpoint: "GET /v1/checkout/status/{order_id}",
  paymentNote: "No payment will be processed until human approval.",
  checks: [
    "We verify your requirements and deployment scope",
    "We confirm data handling, permissions, and safety",
    "We ensure pricing, inclusions, and timelines are correct",
    "We keep you protected with human oversight",
  ],
} as const;

export const AFTER_APPROVAL = [
  { icon: "CheckCircle2", title: "Approval granted", body: "You'll receive a confirmation with next steps." },
  { icon: "CreditCard", title: "Payment / Reservation", body: "Secure payment or reservation will be processed." },
  { icon: "Gauge", title: "Mission Created", body: "Your project appears in Mission Control." },
  { icon: "Rocket", title: "Deployment Begins", body: "We set up, train, and launch your AI operator." },
] as const;

/** Deterministic-looking demo order id. No real persistence. */
export function makeOrderId(seed = "00124"): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `ORD-${yy}-${mm}-${seed}`;
}

/** Build a demo checkout summary from an operator. */
export function buildCheckoutSummary(op: Operator): CheckoutSummary {
  const isSetup = op.kind === "setup";
  const lineItems = isSetup
    ? [{ label: "Setup Fee (one-time)", amount: op.price.amount, currency: op.price.currency }]
    : [
        { label: "Monthly Subscription", amount: op.price.amount, currency: op.price.currency },
        { label: "Setup Fee (one-time)", amount: 4999, currency: op.price.currency },
      ];
  const totalToday = lineItems.reduce((sum, li) => sum + li.amount, 0);

  return {
    orderId: makeOrderId(),
    offerName: op.name,
    offerKind: op.kind,
    plan: isSetup ? "One-time Setup" : "Standard Deployment",
    planDescription: isSetup
      ? "Property onboarding, systems connection, and go-live."
      : "24/7 guest support across web, WhatsApp, and social channels.",
    deploymentScope: op.deploymentScope,
    includedServices: op.includedServices,
    lineItems,
    totalToday,
    currency: op.price.currency,
    status: "awaiting_human_approval",
  };
}

/** Collision-resistant order reference, e.g. ORD-26-07-8F3K2Q. */
export function makeOrderRef(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Array.from({ length: 6 }, () =>
    "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)],
  ).join("");
  return `ORD-${yy}-${mm}-${rand}`;
}

/**
 * Resolve an offerId to its authoritative pricing straight from the catalog.
 * The only trusted input from a client or agent is the offerId — every amount
 * is derived here, server-side, so a caller can never dictate the total.
 * Returns null for an unknown offer.
 */
export function resolveOrderDraft(offerId: string): OrderDraft | null {
  const op = OPERATORS.find((o) => o.id === offerId);
  if (op) {
    const s = buildCheckoutSummary(op);
    return {
      offerId: op.id,
      offerKind: op.kind,
      offerName: op.name,
      plan: s.plan,
      lineItems: s.lineItems,
      totalAmount: s.totalToday,
      currency: s.currency,
      requiresQuote: false,
    };
  }

  const stay = STAYS.find((s) => s.id === offerId);
  if (stay) {
    return {
      offerId: stay.id,
      offerKind: stay.kind,
      offerName: stay.name,
      plan: stay.tagline,
      lineItems: [{ label: stay.name, amount: stay.price.amount, currency: stay.price.currency }],
      totalAmount: stay.price.amount,
      currency: stay.price.currency,
      requiresQuote: false,
    };
  }

  const partnership = PARTNERSHIPS.find((p) => p.id === offerId);
  if (partnership) {
    return {
      offerId: partnership.id,
      offerKind: partnership.kind,
      offerName: partnership.name,
      plan: "Custom quote",
      lineItems: [],
      totalAmount: 0,
      currency: "PHP",
      requiresQuote: true,
    };
  }

  return null;
}
