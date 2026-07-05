import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Star, Trash2, Upload, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteOperatorMedia, requestOperatorMediaUpload, saveOperatorMedia } from "@/lib/operator-media.functions";
import type { OperatorMedia } from "@/lib/operator-media";

const BUCKET = "operator-media";

export function OperatorMediaAdmin({
  operatorId,
  operatorName,
  passkey,
  media,
  onChange,
}: {
  operatorId: string;
  operatorName: string;
  passkey: string;
  media: OperatorMedia[];
  onChange: (media: OperatorMedia[]) => void;
}) {
  const requestUpload = useServerFn(requestOperatorMediaUpload);
  const saveMedia = useServerFn(saveOperatorMedia);
  const removeMedia = useServerFn(deleteOperatorMedia);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!operatorId) {
      setMessage("Enter an operator name and ID before uploading media.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const next = [...media];
      for (const file of Array.from(files)) {
        const type = file.type.startsWith("video/") ? "video" : "image";
        const signed = await requestUpload({
          data: {
            passkey,
            operatorId,
            filename: file.name,
            contentType: file.type as any,
            size: file.size,
          },
        });
        const { error } = await supabase.storage.from(BUCKET).uploadToSignedUrl(signed.path, signed.token, file, {
          contentType: file.type,
          upsert: false,
        });
        if (error) throw error;

        const item: OperatorMedia = {
          id: crypto.randomUUID(),
          operatorId,
          type,
          url: signed.publicUrl,
          storagePath: signed.path,
          alt: `${operatorName || operatorId} interface`,
          sortOrder: next.length,
        };
        await saveMedia({ data: { passkey, media: item } });
        next.push(item);
      }
      onChange(next);
      setMessage(`${files.length} media file${files.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: OperatorMedia) {
    setBusy(true);
    setMessage("");
    try {
      await removeMedia({ data: { passkey, id: item.id, storagePath: item.storagePath } });
      onChange(media.filter((entry) => entry.id !== item.id).map((entry, index) => ({ ...entry, sortOrder: index })));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete media");
    } finally {
      setBusy(false);
    }
  }

  async function makePrimary(item: OperatorMedia) {
    const reordered = [item, ...media.filter((entry) => entry.id !== item.id)].map((entry, index) => ({ ...entry, sortOrder: index }));
    setBusy(true);
    try {
      await Promise.all(reordered.map((entry) => saveMedia({ data: { passkey, media: entry } })));
      onChange(reordered);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-line/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">Interface media</h3>
          <p className="text-xs text-muted">Upload multiple screenshots and an optional product video from this device.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b]">
          <Upload size={15} /> {busy ? "Uploading…" : "Add images or video"}
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" multiple disabled={busy} onChange={(event) => uploadFiles(event.target.files)} />
        </label>
      </div>

      {message && <p className="text-sm text-gold">{message}</p>}

      {media.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center gap-2 rounded-md border border-dashed border-line/30 text-sm text-muted"><ImagePlus size={18} /> No interface media uploaded</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item, index) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-line/30 bg-surface-2/30">
              <div className="relative h-36 bg-black">
                {item.type === "video" ? <video src={item.url} controls className="h-full w-full object-cover" /> : <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />}
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] uppercase text-white">{item.type === "video" ? <span className="inline-flex items-center gap-1"><Video size={10} /> Video</span> : `Image ${index + 1}`}</span>
              </div>
              <div className="space-y-2 p-3">
                <input className="input w-full text-xs" value={item.alt} onChange={(event) => onChange(media.map((entry) => entry.id === item.id ? { ...entry, alt: event.target.value } : entry))} placeholder="Alt text" />
                <div className="flex gap-2">
                  <button type="button" disabled={busy || index === 0} onClick={() => makePrimary(item)} className="inline-flex flex-1 items-center justify-center gap-1 rounded border border-line px-2 py-1.5 text-xs disabled:opacity-40"><Star size={12} /> {index === 0 ? "Primary" : "Make primary"}</button>
                  <button type="button" disabled={busy} onClick={() => remove(item)} className="inline-flex items-center justify-center rounded border border-crimson/40 px-2 py-1.5 text-crimson"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
