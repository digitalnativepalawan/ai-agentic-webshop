/* ============================================================
   Merqato — shared domain types
   These describe the marketplace catalog for both human UI and
   machine-readable agent endpoints.  Kept framework-agnostic.
   ============================================================ */

export type Currency = "PHP";

export type PriceModel =
  | "monthly_subscription"
  | "one_time_setup"
  | "per_day"
  | "per_week"
  | "per_stay"
  | "per_month"
  | "custom_quote";

export interface Price {
  amount: number;
  currency: Currency;
  model: PriceModel;
  /** e.g. "/ mo", "/ day", "one-time" — display suffix */
  suffix: string;
  note?: string;
}

export type OfferKind = "operator" | "stay" | "partnership" | "setup";

/** Actions an autonomous agent may take without a human in the loop. */
export type AgentAction =
  | "browse"
  | "compare"
  | "prepare_checkout"
  | "request_availability"
  | "request_setup"
  | "request_quote"
  | "view_status";

/** Actions that always require an explicit human approval. */
export type HumanGatedAction =
  | "final_payment"
  | "confirmed_booking"
  | "deployment"
  | "account_connection"
  | "public_posting"
  | "partnership_approval";

export interface Badge {
  label: string;
  tone: "gold" | "crimson" | "neutral";
}

export type OperatorCategory =
  | "hospitality"
  | "booking"
  | "marketing"
  | "lead-gen"
  | "operations"
  | "mission-control"
  | "local-business";

export interface Operator {
  id: string;
  kind: "operator" | "setup";
  name: string;
  icon: string; // lucide icon name
  tagline: string;
  category: OperatorCategory;
  badges: Badge[];
  price: Price;
  humanApprovalRequired: boolean;
  agentReadable: boolean;
  featured?: boolean;
  topRated?: boolean;
  deploymentScope: string[];
  includedServices: string[];
}

export interface Stay {
  id: string;
  kind: "stay";
  name: string;
  icon: string;
  tagline: string;
  price: Price;
  mostPopular?: boolean;
  features: string[];
  humanConfirmationRequired: true;
}

export interface Partnership {
  id: string;
  kind: "partnership";
  name: string;
  icon: string;
  audience: string;
  valueForPartner: string[];
  inviteOnly?: boolean;
}

export interface TrustPoint {
  icon: string;
  title: string;
  body: string;
}

export interface ProcessStep {
  index: number;
  title: string;
  body: string;
  icon: string;
}

export interface Stat {
  value: string;
  label: string;
  sub?: string;
}

export type Offer = Operator | Stay | Partnership;

export interface CheckoutLineItem {
  label: string;
  amount: number;
  currency: Currency;
}

export interface CheckoutSummary {
  orderId: string;
  offerName: string;
  offerKind: OfferKind;
  plan: string;
  planDescription: string;
  deploymentScope: string[];
  includedServices: string[];
  lineItems: CheckoutLineItem[];
  totalToday: number;
  currency: Currency;
  status: "awaiting_human_approval";
}

/**
 * Minimal, offer-agnostic pricing snapshot resolved from the catalog. This is
 * the server-authoritative shape persisted with an order: the client/agent
 * supplies only an offerId, never an amount, so prices cannot be tampered with.
 */
export interface OrderDraft {
  offerId: string;
  offerKind: OfferKind;
  offerName: string;
  plan: string;
  lineItems: CheckoutLineItem[];
  totalAmount: number;
  currency: Currency;
  /** true for partnership quotes where the price is settled by a human later. */
  requiresQuote: boolean;
}
