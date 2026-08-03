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
    try {
      await api.testPostizApiConnection();
      const integrations = await api.listPostizIntegrations();
      const active = integrations.filter((integration) => !integration.disabled);
      return {
        connected: true as const,
        authenticated: true as const,
        checkedAt: new Date().toISOString(),
        failedAt: null,
        endpoint: `${process.env.POSTIZ_API_URL?.replace(/\/+$/, "")}/api/public/v1`,
        integrationCount: active.length,
        facebookConnected: active.some((integration) => integration.identifier === "facebook"),
        instagramConnected: active.some((integration) =>
          integration.identifier.startsWith("instagram"),
        ),
        error: null,
        ...configuration,
      };
    } catch (error) {
      const postizError = error instanceof api.PostizApiError ? error : null;
      return {
        connected: false as const,
        authenticated: false as const,
        checkedAt: null,
        failedAt: new Date().toISOString(),
        endpoint: postizError?.endpoint ?? process.env.POSTIZ_API_URL ?? "Not configured",
        integrationCount: 0,
        facebookConnected: false,
        instagramConnected: false,
        error: {
          status: postizError?.status ?? null,
          message: error instanceof Error ? error.message : "Postiz connection failed.",
          likelyCause:
            postizError?.status === 401
              ? "The configured Postiz API key was rejected."
              : "Check that Postiz is running and POSTIZ_API_URL is reachable from the app server.",
        },
        ...configuration,
      };
    }
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
