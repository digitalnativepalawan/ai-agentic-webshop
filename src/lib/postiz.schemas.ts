import { z } from "zod";

export const postizProviderSchema = z.enum(["facebook", "instagram", "instagram-standalone"]);

export type PostizProvider = z.infer<typeof postizProviderSchema>;

export const postizIntegrationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  identifier: z.string().min(1),
  picture: z.string().url().nullable().optional(),
  disabled: z.boolean().default(false),
  profile: z.string().nullable().optional(),
  customer: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable()
    .optional(),
});

export type PostizIntegration = z.infer<typeof postizIntegrationSchema>;

export const postizMediaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  originalName: z.string().nullable().optional(),
  path: z.string().url(),
  thumbnail: z.string().url().nullable().optional(),
  alt: z.string().nullable().optional(),
});

export type PostizMedia = z.infer<typeof postizMediaSchema>;

export const postizPostSchema = z.object({
  id: z.string().min(1),
  content: z.string().default(""),
  publishDate: z.string().datetime(),
  state: z.enum(["DRAFT", "QUEUE", "PUBLISHED", "ERROR"]),
  releaseURL: z.string().nullable().optional(),
  releaseId: z.string().nullable().optional(),
  group: z.string().min(1),
  creationMethod: z.string().nullable().optional(),
  integration: z.object({
    id: z.string().min(1),
    providerIdentifier: z.string().min(1),
    name: z.string().min(1),
    picture: z.string().nullable().optional(),
  }),
});

export type PostizPost = z.infer<typeof postizPostSchema>;

export function postizContentToText(content: string): string {
  return content
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

export const adminPasskeySchema = z.object({
  passkey: z.string().min(1).max(512),
});

export const listPostizPostsSchema = adminPasskeySchema.extend({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const uploadPostizMediaSchema = adminPasskeySchema.extend({
  filename: z.string().min(1).max(180),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/bmp",
    "image/tiff",
    "video/mp4",
  ]),
  base64: z.string().min(1).max(15_000_000),
});

export const createPostizPostSchema = adminPasskeySchema.extend({
  type: z.enum(["now", "schedule", "draft"]),
  date: z.string().datetime(),
  content: z.string().min(1).max(10_000),
  platformContent: z
    .object({ facebook: z.string().max(10_000), instagram: z.string().max(10_000) })
    .optional(),
  integrationIds: z.array(z.string().min(1)).min(1).max(20),
  media: z.array(postizMediaSchema).max(10).default([]),
});

export const postizCreateResultSchema = z.object({
  postId: z.string().min(1),
  integration: z.string().min(1),
});

export type CreatePostizPostInput = z.infer<typeof createPostizPostSchema>;
