import "@tanstack/react-start/server-only";

import {
  socialContentResultSchema,
  type AgentRuntimeConfig,
  type SocialContentResult,
} from "./agent.schemas";

export class AgentServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "OLLAMA_UNAVAILABLE"
      | "MODEL_UNAVAILABLE"
      | "REQUEST_TIMEOUT"
      | "MALFORMED_RESPONSE"
      | "PROVIDER_AUTH"
      | "PROVIDER_FAILURE",
    readonly status?: number,
  ) {
    super(message);
    this.name = "AgentServiceError";
  }
}

function normalizeBaseUrl(raw: string): string {
  return new URL(raw).toString().replace(/\/+$/, "");
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new AgentServiceError(
        `The AI request exceeded ${Math.round(timeoutMs / 1000)} seconds. Retry or choose a faster model.`,
        "REQUEST_TIMEOUT",
      );
    }
    throw new AgentServiceError(
      `Could not reach the configured AI provider: ${error instanceof Error ? error.message : "network error"}`,
      "OLLAMA_UNAVAILABLE",
    );
  }
}

export async function testAgentService(config: AgentRuntimeConfig) {
  if (config.mode === "ollama") {
    const models = await listOllamaModels(config.ollamaBaseUrl);
    if (!models.includes(config.model)) {
      throw new AgentServiceError(
        `Ollama is reachable, but model ${config.model} is not installed.`,
        "MODEL_UNAVAILABLE",
      );
    }
    return {
      provider: "ollama" as const,
      model: config.model,
      models,
      checkedAt: new Date().toISOString(),
    };
  }

  if (!config.openrouterKey.trim()) {
    throw new AgentServiceError("OpenRouter API key is missing.", "PROVIDER_AUTH");
  }
  const response = await fetchWithTimeout(
    "https://openrouter.ai/api/v1/models",
    { headers: { Authorization: `Bearer ${config.openrouterKey.trim()}` } },
    20_000,
  );
  if (!response.ok) {
    throw new AgentServiceError(
      `OpenRouter rejected the configured key (HTTP ${response.status}).`,
      "PROVIDER_AUTH",
      response.status,
    );
  }
  const payload = (await response.json()) as { data?: Array<{ id?: string }> };
  const models = (payload.data ?? []).flatMap((item) => (item.id ? [item.id] : []));
  if (config.model && !models.includes(config.model)) {
    throw new AgentServiceError(
      `OpenRouter model ${config.model} is unavailable.`,
      "MODEL_UNAVAILABLE",
    );
  }
  return {
    provider: "openrouter" as const,
    model: config.model,
    models,
    checkedAt: new Date().toISOString(),
  };
}

export async function listOllamaModels(ollamaBaseUrl: string) {
  const baseUrl = normalizeBaseUrl(ollamaBaseUrl);
  const response = await fetchWithTimeout(`${baseUrl}/api/tags`, { method: "GET" }, 12_000);
  if (!response.ok) {
    throw new AgentServiceError(
      `Ollama health check failed with HTTP ${response.status}.`,
      "OLLAMA_UNAVAILABLE",
      response.status,
    );
  }
  const payload = (await response.json()) as { models?: Array<{ name?: string }> };
  return (payload.models ?? []).flatMap((item) => (item.name ? [item.name] : []));
}

const SYSTEM_PROMPT = `You are the merQato Social Media Operator. Write human-sounding social content for Palawan hospitality and practical AI businesses.

Rules:
- Preserve every factual detail supplied by the operator. Never invent availability, prices, promotions, travel times, amenities, booking terms, awards, or completed actions.
- Avoid robotic phrasing, fake urgency, excessive hashtags, and generic tourism cliches.
- Use correct place names, including San Vicente and Palawan.
- Use a clear, natural call to action and adapt paragraphing to each selected platform.
- Never publish automatically and never claim that publishing, scheduling, uploading, or another external action happened.
- Return JSON only, with exactly these keys: main_post, facebook_version, instagram_version, short_version, hashtags, call_to_action, image_brief, content_notes.
- hashtags must be a JSON array of no more than eight restrained hashtags.
- Keep each copy field concise (one or two short paragraphs) and keep the entire JSON response under 240 words.

Brand behavior:
- Marina Terrace: remote work, ocean-view workspace, long stays, community, Starlink, quiet San Vicente setting; practical and grounded, never generic luxury.
- BAIA Palawan: slow, intimate, natural, barefoot, earth-connected, understated hospitality; never crowded, artificial, over-promised, or generic luxury.
- merQato Digital: practical AI operators, business efficiency, ownership of data and systems; confident but not overly technical.
- Kapwa Hospitality Test: hospitality operations and guest service in a clear test-safe context.`;

function extractJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new AgentServiceError(
      "The model returned text that could not be parsed as structured social content.",
      "MALFORMED_RESPONSE",
    );
  }
}

function extractLooseString(raw: string, key: string): string {
  const match = raw.match(new RegExp(`(?:"${key}"|${key})\\s*:\\s*"((?:\\\\.|[^"\\\\])*)`, "i"));
  if (!match?.[1]) return "";
  try {
    return JSON.parse(`"${match[1]}"`) as string;
  } catch {
    return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
  }
}

function fallbackResult(raw: string): SocialContentResult {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const main = extractLooseString(cleaned, "main_post");
  if (!main) {
    throw new AgentServiceError(
      "The model response did not contain usable social copy. Retry the request.",
      "MALFORMED_RESPONSE",
    );
  }
  const inlineHashtags = cleaned.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  const hashtagBlock = cleaned.match(/"hashtags"\s*:\s*\[([^\]]*)/i)?.[1] ?? "";
  const hashtags = Array.from(
    new Set([
      ...inlineHashtags,
      ...(hashtagBlock.match(/"([^"]+)"/g) ?? []).map((tag) => `#${tag.replace(/["#]/g, "")}`),
    ]),
  ).slice(0, 8);
  return socialContentResultSchema.parse({
    main_post: main,
    facebook_version: extractLooseString(cleaned, "facebook_version") || main,
    instagram_version: extractLooseString(cleaned, "instagram_version") || main,
    short_version: extractLooseString(cleaned, "short_version") || main.slice(0, 280),
    hashtags,
    call_to_action: extractLooseString(cleaned, "call_to_action"),
    image_brief: extractLooseString(cleaned, "image_brief"),
    content_notes:
      extractLooseString(cleaned, "content_notes") ||
      "Normalized from a partial model response; review platform variants before approval.",
  });
}

function normalizeResult(raw: string): SocialContentResult {
  let parsed: unknown;
  try {
    parsed = extractJson(raw);
  } catch {
    return fallbackResult(raw);
  }
  const record = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const hashtags = Array.isArray(record.hashtags)
    ? record.hashtags
        .map(String)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
        .slice(0, 8)
    : typeof record.hashtags === "string"
      ? record.hashtags
          .split(/\s+/)
          .filter((tag) => tag.startsWith("#"))
          .slice(0, 8)
      : [];
  return socialContentResultSchema.parse({ ...record, hashtags });
}

function userPrompt(input: {
  action: string;
  brand: string;
  objective: string;
  audience: string;
  topic: string;
  callToAction: string;
  tone: string;
  format: string;
  channels: string[];
  backgroundContext: string;
  currentContent: string;
}) {
  return `Action: ${input.action}
Brand: ${input.brand}
Campaign objective: ${input.objective}
Target audience: ${input.audience}
Content topic or rough idea: ${input.topic}
Requested call to action: ${input.callToAction || "Choose a natural, non-pushy call to action"}
Tone: ${input.tone}
Post format: ${input.format}
Selected channels: ${input.channels.join(", ")}
Optional background context: ${input.backgroundContext || "None supplied"}
Current copy to transform: ${input.currentContent || "None; create new copy"}

For transform actions, preserve the meaning and supplied facts of the current copy. Produce the complete JSON object for all fields, with the requested action reflected most strongly in main_post.`;
}

export async function generateSocialContent(
  config: AgentRuntimeConfig,
  input: Parameters<typeof userPrompt>[0],
) {
  await testAgentService(config);
  let response: Response;
  if (config.mode === "ollama") {
    response = await fetchWithTimeout(
      `${normalizeBaseUrl(config.ollamaBaseUrl)}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          stream: false,
          format: "json",
          options: { temperature: 0.65, num_predict: 320 },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt(input) },
          ],
        }),
      },
      config.generationTimeoutMs,
    );
  } else {
    response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.openrouterKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://merqato.digital",
          "X-Title": "merQato Social Media Operator",
        },
        body: JSON.stringify({
          model: config.model,
          stream: false,
          response_format: { type: "json_object" },
          max_tokens: 1400,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt(input) },
          ],
        }),
      },
      config.generationTimeoutMs,
    );
  }
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new AgentServiceError(
      `${config.mode === "ollama" ? "Ollama" : "OpenRouter"} generation failed (HTTP ${response.status}): ${detail || response.statusText}`,
      response.status === 401 || response.status === 403 ? "PROVIDER_AUTH" : "PROVIDER_FAILURE",
      response.status,
    );
  }
  const payload = (await response.json()) as {
    message?: { content?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content =
    config.mode === "ollama" ? payload.message?.content : payload.choices?.[0]?.message?.content;
  if (!content)
    throw new AgentServiceError(
      "The AI provider returned an empty response.",
      "MALFORMED_RESPONSE",
    );
  return { result: normalizeResult(content), completedAt: new Date().toISOString() };
}
