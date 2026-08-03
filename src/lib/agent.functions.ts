import { createServerFn } from "@tanstack/react-start";

import {
  agentHealthRequestSchema,
  ollamaModelsRequestSchema,
  socialContentRequestSchema,
} from "./agent.schemas";

export const listAgentBrainModels = createServerFn({ method: "POST" })
  .validator((input: unknown) => ollamaModelsRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const auth = await import("./admin-auth.server");
    auth.requireAdminSession(data.passkey);
    const agent = await import("./agent.server");
    const models = await agent.listOllamaModels(data.ollamaBaseUrl);
    return { models, checkedAt: new Date().toISOString() };
  });

export const testAgentBrainConnection = createServerFn({ method: "POST" })
  .validator((input: unknown) => agentHealthRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const auth = await import("./admin-auth.server");
    auth.requireAdminSession(data.passkey);
    const agent = await import("./agent.server");
    return agent.testAgentService(data.config);
  });

export const generateSocialMediaContent = createServerFn({ method: "POST" })
  .validator((input: unknown) => socialContentRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const auth = await import("./admin-auth.server");
    auth.requireAdminSession(data.passkey);
    const agent = await import("./agent.server");
    return agent.generateSocialContent(data.config, data);
  });
