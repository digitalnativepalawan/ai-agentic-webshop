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
  name: z.string().optional(),
  path: z.string().url(),
});

export type PostizMedia = z.infer<typeof postizMediaSchema>;

export const postizPostSchema = z.object({
  id: z.string().min(1),
  content: z.string().default(""),
  publishDate: z.string().nullable().optional(),
  releaseURL: z.string().nullable().optional(),
  integration: z.object({
    id: z.string().min(1),
    providerIdentifier: z.string().optional(),
    name: z.string().optional(),
    picture: z.string().nullable().optional(),
  }),
});

export type PostizPost = z.infer<typeof postizPostSchema>;

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
  integrationIds: z.array(z.string().min(1)).min(1).max(20),
  media: z.array(postizMediaSchema).max(10).default([]),
});

export type CreatePostizPostInput = z.infer<typeof createPostizPostSchema>;
