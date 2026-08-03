import { createHash, timingSafeEqual } from "node:crypto";

import {
  postizIntegrationSchema,
  postizCreateResultSchema,
  postizMediaSchema,
  postizPostSchema,
  type CreatePostizPostInput,
  type PostizIntegration,
  type PostizMedia,
  type PostizPost,
} from "./postiz.schemas";

/**
 * Postiz Public API v1 client.
 * Contract: https://docs.postiz.com/public-api/introduction
 * Self-hosted base URL: {NEXT_PUBLIC_BACKEND_URL}/public/v1. In the standard
 * single-container install, NEXT_PUBLIC_BACKEND_URL is the public site URL
 * plus /api.
 */

export class PostizApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PostizApiError";
  }
}

export function requireAdminPasskey(passkey: string): void {
  const expected = process.env.ADMIN_PASSKEY;
  if (!expected) throw new Error("Admin passkey is not configured");
  const inputHash = createHash("sha256").update(passkey, "utf8").digest();
  const expectedHash = createHash("sha256").update(expected, "utf8").digest();
  if (!timingSafeEqual(inputHash, expectedHash)) throw new Error("Invalid admin passkey");
}

function postizConfig() {
  const rawUrl = process.env.POSTIZ_API_URL?.trim();
  const apiKey = process.env.POSTIZ_API_KEY?.trim();
  if (!rawUrl || !apiKey) {
    const missing = [!rawUrl ? "POSTIZ_API_URL" : null, !apiKey ? "POSTIZ_API_KEY" : null].filter(
      Boolean,
    );
    throw new Error(`Postiz is not configured. Missing ${missing.join(" and ")}.`);
  }

  let configuredUrl: URL;
  try {
    configuredUrl = new URL(rawUrl);
  } catch {
    throw new Error("POSTIZ_API_URL must be a valid absolute URL.");
  }

  const normalized = configuredUrl.toString().replace(/\/+$/, "");
  const pathname = configuredUrl.pathname.replace(/\/+$/, "");
  const baseUrl = pathname.endsWith("/public/v1")
    ? normalized
    : pathname.endsWith("/api")
      ? `${normalized}/public/v1`
      : configuredUrl.hostname === "api.postiz.com"
        ? `${normalized}/public/v1`
        : `${normalized}/api/public/v1`;
  return { baseUrl, apiKey };
}

export function getPostizConfigurationStatus() {
  const rawUrl = process.env.POSTIZ_API_URL?.trim();
  const apiKey = process.env.POSTIZ_API_KEY?.trim();
  let host: string | null = null;
  if (rawUrl) {
    try {
      host = new URL(rawUrl).host;
    } catch {
      host = "Invalid URL";
    }
  }
  return { urlConfigured: Boolean(rawUrl), apiKeyConfigured: Boolean(apiKey), host };
}

async function postizFetch(path: string, init?: RequestInit): Promise<Response> {
  const { baseUrl, apiKey } = postizConfig();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", apiKey);
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    signal: init?.signal ?? AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const raw = await response.text();
    let detail = response.statusText;
    try {
      const parsed = JSON.parse(raw) as {
        msg?: unknown;
        message?: unknown;
        error?: unknown;
        provider?: unknown;
        name?: unknown;
      };
      const message = parsed.msg ?? parsed.message ?? parsed.error;
      detail = Array.isArray(message) ? message.join("; ") : String(message ?? response.statusText);
      if (parsed.provider || parsed.name) {
        detail = `${String(parsed.name ?? parsed.provider)}: ${detail}`;
      }
    } catch {
      if (raw && !raw.trimStart().startsWith("<")) detail = raw;
    }
    throw new PostizApiError(
      `Postiz request failed (${response.status}): ${detail.slice(0, 300) || response.statusText}`,
      response.status,
    );
  }
  return response;
}

export async function testPostizApiConnection() {
  const response = await postizFetch("/is-connected");
  const payload = (await response.json()) as { connected?: unknown };
  if (payload.connected !== true) throw new Error("Postiz did not confirm an active connection.");
  return { connected: true as const };
}

export async function listPostizIntegrations(): Promise<PostizIntegration[]> {
  const response = await postizFetch("/integrations");
  return postizIntegrationSchema.array().parse(await response.json());
}

export async function uploadPostizMedia(input: {
  filename: string;
  contentType: string;
  base64: string;
}): Promise<PostizMedia> {
  const bytes = Uint8Array.from(Buffer.from(input.base64, "base64"));
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: input.contentType }), input.filename);
  const response = await postizFetch("/upload", { method: "POST", body: form });
  return postizMediaSchema.parse(await response.json());
}

function settingsFor(integration: PostizIntegration): Record<string, unknown> {
  if (integration.identifier === "facebook") {
    return { __type: "facebook", post_type: "post" };
  }
  if (integration.identifier === "instagram" || integration.identifier === "instagram-standalone") {
    return {
      __type: integration.identifier,
      post_type: "post",
      is_trial_reel: false,
      collaborators: [],
    };
  }
  throw new Error(`Unsupported channel for this interface: ${integration.identifier}`);
}

export async function createPostizPost(input: CreatePostizPostInput) {
  const integrations = await listPostizIntegrations();
  const byId = new Map(integrations.map((integration) => [integration.id, integration]));
  const selected = input.integrationIds.map((id) => {
    const integration = byId.get(id);
    if (!integration || integration.disabled)
      throw new Error(`Postiz integration is unavailable: ${id}`);
    return integration;
  });

  const payload = {
    type: input.type,
    date: input.date,
    shortLink: false,
    tags: [],
    posts: selected.map((integration) => ({
      integration: { id: integration.id },
      value: [{ content: input.content, image: input.media.map(({ id, path }) => ({ id, path })) }],
      settings: settingsFor(integration),
    })),
  };

  const response = await postizFetch("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return postizCreateResultSchema.array().parse(await response.json());
}

export async function listPostizPosts(startDate: string, endDate: string): Promise<PostizPost[]> {
  const query = new URLSearchParams({ startDate, endDate });
  const response = await postizFetch(`/posts?${query.toString()}`);
  const payload = (await response.json()) as { posts?: unknown };
  return postizPostSchema
    .array()
    .parse(payload.posts ?? [])
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}
