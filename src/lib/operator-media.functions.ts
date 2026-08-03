import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { OperatorMedia } from "./operator-media";

const BUCKET = "operator-media";
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

function rowToMedia(row: any): OperatorMedia {
  return {
    id: row.id,
    operatorId: row.operator_id,
    type: row.media_type,
    url: row.public_url,
    storagePath: row.storage_path,
    alt: row.alt_text,
    sortOrder: row.sort_order,
  };
}

export const listOperatorMedia = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("operator_media" as any)
    .select("*")
    .order("operator_id", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToMedia);
});

export const requestOperatorMediaUpload = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        passkey: z.string(),
        operatorId: z.string().min(1).max(120),
        filename: z.string().min(1).max(180),
        contentType: z.enum(allowedTypes),
        size: z.number().int().positive().max(104857600),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const auth = await import("./admin-auth.server");
    auth.requireAdminSession(data.passkey);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `${data.operatorId}/${randomUUID()}-${safeName}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    return { path, token: signed.token, publicUrl };
  });

export const saveOperatorMedia = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        passkey: z.string(),
        media: z.object({
          id: z.string().uuid(),
          operatorId: z.string().min(1).max(120),
          type: z.enum(["image", "video"]),
          url: z.string().url(),
          storagePath: z.string().min(1),
          alt: z.string().max(240),
          sortOrder: z.number().int().min(0).max(1000),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const auth = await import("./admin-auth.server");
    auth.requireAdminSession(data.passkey);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const media = data.media;
    const { error } = await supabaseAdmin.from("operator_media" as any).upsert({
      id: media.id,
      operator_id: media.operatorId,
      media_type: media.type,
      public_url: media.url,
      storage_path: media.storagePath,
      alt_text: media.alt,
      sort_order: media.sortOrder,
    } as any);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteOperatorMedia = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        passkey: z.string(),
        id: z.string().uuid(),
        storagePath: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const auth = await import("./admin-auth.server");
    auth.requireAdminSession(data.passkey);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([data.storagePath]);
    if (storageError) throw new Error(storageError.message);
    const { error } = await supabaseAdmin
      .from("operator_media" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
