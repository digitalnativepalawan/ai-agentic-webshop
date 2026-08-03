import { createHash, timingSafeEqual } from "node:crypto";

import {
  postizIntegrationSchema,
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
 * Self-hosted base URL: {NEXT_PUBLIC_BACKEND_URL}/public/v1
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

  const normalized = rawUrl.replace(/\/+$/, "");
  const baseUrl = normalized.endsWith("/public/v1") ? normalized : `${normalized}/public/v1`;
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
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!response.ok) {
    const raw = await response.text();
    let detail = raw;
    try {
      const parsed = JSON.parse(raw) as { message?: unknown; error?: unknown };
      detail = String(parsed.message ?? parsed.error ?? raw);
    } catch {
      // Keep the plain response body.
    }
    throw new PostizApiError(
      `Postiz request failed (${response.status}): ${detail.slice(0, 300) || response.statusText}`,
      response.status,
    );
  }
  return response;
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
  if (integration.identifier === "facebook") return { __type: "facebook" };
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
  return (await response.json()) as Array<{ postId: string; integration: string }>;
}

export async function listPostizPosts(startDate: string, endDate: string): Promise<PostizPost[]> {
  const query = new URLSearchParams({ startDate, endDate });
  const response = await postizFetch(`/posts?${query.toString()}`);
  const payload = (await response.json()) as { posts?: unknown };
  return postizPostSchema.array().parse(payload.posts ?? []);
}
