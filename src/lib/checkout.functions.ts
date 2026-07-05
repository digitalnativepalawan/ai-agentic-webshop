// Deterministic checkout/approval server functions shared by the human UI and
// the agent HTTP API. No LLM touches money here: the client/agent supplies an
// offerId and contact details, the server resolves the price from the catalog
// and persists the order. The service-role code lives behind dynamic import()s
// so it is stripped from the client bundle along with the handler bodies.
import { createServerFn } from "@tanstack/react-start";

import { resolveOrderDraft } from "./checkout-rules";
import { CreateApprovalInput, GetOrderStatusInput } from "./checkout-schemas";

/**
 * Prepare an order for human approval. Allowed for humans and agents alike (the
 * manifest lists prepare_checkout as agent-permitted); no payment is taken. The
 * order lands in `awaiting_human_approval` and is only ever advanced by staff.
 */
export const createApprovalRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => CreateApprovalInput.parse(input))
  .handler(async ({ data }) => {
    const draft = resolveOrderDraft(data.offerId);
    if (!draft) {
      throw new Error(`Unknown offer: ${data.offerId}`);
    }

    const { insertOrderFromDraft, resolveOptionalUserId } = await import("./orders.server");
    const userId = await resolveOptionalUserId();

    return insertOrderFromDraft({
      draft,
      requester: { name: data.requesterName, email: data.requesterEmail, notes: data.notes },
      channel: data.channel,
      userId,
    });
  });

/** Poll an order's approval status by its id (the token returned at creation). */
export const getOrderStatus = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetOrderStatusInput.parse(input))
  .handler(async ({ data }) => {
    const { getOrderStatusById } = await import("./orders.server");
    const order = await getOrderStatusById(data.orderId);
    return order ? { found: true as const, ...order } : { found: false as const };
  });
