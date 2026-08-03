import { createServerFn } from "@tanstack/react-start";

import {
  adminPasskeySchema,
  createPostizPostSchema,
  listPostizPostsSchema,
  uploadPostizMediaSchema,
} from "./postiz.schemas";

export const testPostizConnection = createServerFn({ method: "POST" })
  .validator((input: unknown) => adminPasskeySchema.parse(input))
  .handler(async ({ data }) => {
    const api = await import("./postiz.server");
    api.requireAdminPasskey(data.passkey);
    const configuration = api.getPostizConfigurationStatus();
    const integrations = await api.listPostizIntegrations();
    return {
      connected: true as const,
      checkedAt: new Date().toISOString(),
      integrationCount: integrations.length,
      ...configuration,
    };
  });

export const getPostizConfiguration = createServerFn({ method: "POST" })
  .validator((input: unknown) => adminPasskeySchema.parse(input))
  .handler(async ({ data }) => {
    const api = await import("./postiz.server");
    api.requireAdminPasskey(data.passkey);
    return api.getPostizConfigurationStatus();
  });

export const listPostizConnectedAccounts = createServerFn({ method: "POST" })
  .validator((input: unknown) => adminPasskeySchema.parse(input))
  .handler(async ({ data }) => {
    const api = await import("./postiz.server");
    api.requireAdminPasskey(data.passkey);
    const integrations = await api.listPostizIntegrations();
    return {
      checkedAt: new Date().toISOString(),
      integrations: integrations.filter((integration) =>
        ["facebook", "instagram", "instagram-standalone"].includes(integration.identifier),
      ),
    };
  });

export const uploadSocialMedia = createServerFn({ method: "POST" })
  .validator((input: unknown) => uploadPostizMediaSchema.parse(input))
  .handler(async ({ data }) => {
    const api = await import("./postiz.server");
    api.requireAdminPasskey(data.passkey);
    return api.uploadPostizMedia(data);
  });

export const createSocialPost = createServerFn({ method: "POST" })
  .validator((input: unknown) => createPostizPostSchema.parse(input))
  .handler(async ({ data }) => {
    const api = await import("./postiz.server");
    api.requireAdminPasskey(data.passkey);
    const result = await api.createPostizPost(data);
    return { ok: true as const, posts: result };
  });

export const listSocialPosts = createServerFn({ method: "POST" })
  .validator((input: unknown) => listPostizPostsSchema.parse(input))
  .handler(async ({ data }) => {
    const api = await import("./postiz.server");
    api.requireAdminPasskey(data.passkey);
    return api.listPostizPosts(data.startDate, data.endDate);
  });
