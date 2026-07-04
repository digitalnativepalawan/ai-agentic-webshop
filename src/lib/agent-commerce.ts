import { AGENT_ALLOWED, APPROVAL, HUMAN_GATED } from "./checkout-rules";
import { BRAND, OPERATORS, PARTNERSHIPS, STAYS } from "./site-data";

/* ============================================================
   Programmatic view of the marketplace for AI agents.
   The public/*.json files mirror this shape so agents can
   fetch a static manifest without executing our client.
   ============================================================ */

export interface AgentManifest {
  business: {
    name: string;
    location: string;
    mission: string;
    contact: string;
  };
  humanApprovalRequired: true;
  allowedAgentActions: string[];
  disallowedWithoutHumanApproval: string[];
  approval: {
    averageTime: string;
    requestEndpoint: string;
    statusEndpoint: string;
  };
  categories: string[];
  offers: AgentOffer[];
}

export interface AgentOffer {
  id: string;
  kind: string;
  name: string;
  category?: string;
  pricing: {
    amount: number;
    currency: string;
    model: string;
  };
  humanApprovalRequired: boolean;
  agentReadable: boolean;
  actions: string[];
}

export function buildAgentManifest(): AgentManifest {
  const operatorOffers: AgentOffer[] = OPERATORS.map((o) => ({
    id: o.id,
    kind: o.kind,
    name: o.name,
    category: o.category,
    pricing: { amount: o.price.amount, currency: o.price.currency, model: o.price.model },
    humanApprovalRequired: o.humanApprovalRequired,
    agentReadable: o.agentReadable,
    actions: ["browse", "compare", "prepare_checkout", "request_setup", "view_status"],
  }));

  const stayOffers: AgentOffer[] = STAYS.map((s) => ({
    id: s.id,
    kind: s.kind,
    name: s.name,
    pricing: { amount: s.price.amount, currency: s.price.currency, model: s.price.model },
    humanApprovalRequired: true,
    agentReadable: true,
    actions: ["browse", "compare", "request_availability", "view_status"],
  }));

  const partnershipOffers: AgentOffer[] = PARTNERSHIPS.map((p) => ({
    id: p.id,
    kind: p.kind,
    name: p.name,
    pricing: { amount: 0, currency: "PHP", model: "custom_quote" },
    humanApprovalRequired: true,
    agentReadable: true,
    actions: ["browse", "compare", "request_quote", "view_status"],
  }));

  return {
    business: {
      name: BRAND.name,
      location: BRAND.location,
      mission: BRAND.mission,
      contact: BRAND.contactEmail,
    },
    humanApprovalRequired: true,
    allowedAgentActions: AGENT_ALLOWED.map((a) => a.action),
    disallowedWithoutHumanApproval: HUMAN_GATED.map((a) => a.action),
    approval: {
      averageTime: APPROVAL.averageTime,
      requestEndpoint: APPROVAL.endpoint,
      statusEndpoint: APPROVAL.statusEndpoint,
    },
    categories: ["ai-operators", "nomad-stays", "ecosystem-partnerships", "mission-control"],
    offers: [...operatorOffers, ...stayOffers, ...partnershipOffers],
  };
}
