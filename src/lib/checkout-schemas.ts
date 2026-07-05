import { z } from "zod";

/* Shared, isomorphic validators for the checkout/approval flow. Used by both the
   TanStack server functions (human UI) and the agent HTTP API so there is a
   single source of truth for what a valid request looks like. */

export const CreateApprovalInput = z.object({
  offerId: z.string().min(1).max(100),
  requesterName: z.string().trim().min(1).max(200).optional(),
  requesterEmail: z.string().trim().email().max(320).optional(),
  notes: z.string().trim().max(2000).optional(),
  channel: z.enum(["web", "agent"]).default("web"),
});

export type CreateApprovalInputType = z.input<typeof CreateApprovalInput>;

export const GetOrderStatusInput = z.object({ orderId: z.string().uuid() });
