import { z } from "zod";

export const agentModeSchema = z.enum(["openrouter", "ollama"]);

export const agentRuntimeConfigSchema = z.object({
  mode: agentModeSchema,
  model: z.string().min(1).max(240),
  ollamaBaseUrl: z.string().url().max(500).default("http://localhost:11434"),
  openrouterKey: z.string().max(500).default(""),
  generationTimeoutMs: z.number().int().min(10_000).max(180_000).default(90_000),
});

export type AgentRuntimeConfig = z.infer<typeof agentRuntimeConfigSchema>;

export const socialContentRequestSchema = z.object({
  passkey: z.string().min(1).max(2048),
  config: agentRuntimeConfigSchema,
  action: z.enum(["generate", "improve", "shorten", "hashtags", "facebook", "instagram", "tone"]),
  brand: z.string().min(1).max(120),
  objective: z.string().min(1).max(120),
  audience: z.string().min(1).max(600),
  topic: z.string().min(1).max(2000),
  callToAction: z.string().max(500).default(""),
  tone: z.string().min(1).max(120),
  format: z.string().min(1).max(120),
  channels: z
    .array(z.enum(["facebook", "instagram"]))
    .min(1)
    .max(2),
  backgroundContext: z.string().max(3000).default(""),
  currentContent: z.string().max(10_000).default(""),
});

export const socialContentResultSchema = z.object({
  main_post: z.string().min(1),
  facebook_version: z.string().min(1),
  instagram_version: z.string().min(1),
  short_version: z.string().min(1),
  hashtags: z.array(z.string().min(1)).max(12),
  call_to_action: z.string(),
  image_brief: z.string(),
  content_notes: z.string(),
});

export type SocialContentResult = z.infer<typeof socialContentResultSchema>;

export const weeklySocialPlanRequestSchema = z.object({
  passkey: z.string().min(1).max(2048),
  config: agentRuntimeConfigSchema,
  brand: z.string().min(1).max(120),
  brief: z.string().min(1).max(3000),
  audience: z.string().min(1).max(600),
  callToAction: z.string().max(500).default(""),
  tone: z.string().min(1).max(120),
  startDate: z.string().date(),
  postsPerDay: z.number().int().min(1).max(3),
  channels: z
    .array(z.enum(["facebook", "instagram"]))
    .min(1)
    .max(2),
  times: z
    .array(z.string().regex(/^\d{2}:\d{2}$/))
    .min(1)
    .max(3),
});

export const weeklySocialDraftSchema = z.object({
  date: z.string().date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  theme: z.string().min(1).max(160),
  content: z.string().min(1).max(10_000),
  image_brief: z.string().min(1).max(1000),
});

export const weeklySocialPlanResultSchema = z.object({
  drafts: z.array(weeklySocialDraftSchema).min(7).max(21),
});

export type WeeklySocialDraft = z.infer<typeof weeklySocialDraftSchema>;

export const agentHealthRequestSchema = z.object({
  passkey: z.string().min(1).max(2048),
  config: agentRuntimeConfigSchema,
});

export const ollamaModelsRequestSchema = z.object({
  passkey: z.string().min(1).max(2048),
  ollamaBaseUrl: z.string().url().max(500),
});
