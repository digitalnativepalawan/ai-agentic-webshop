import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  ImagePlus,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";

import { hasConfig } from "@/lib/agentConfig";
import { generate } from "@/lib/openrouter";
import { createSocialPost, uploadSocialMedia } from "@/lib/postiz.functions";
import type { PostizIntegration, PostizMedia } from "@/lib/postiz.schemas";
import { PostPreview } from "./PostPreview";

const TIME_ZONE = "Asia/Manila";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_MEDIA =
  "image/jpeg,image/png,image/gif,image/webp,image/avif,image/bmp,image/tiff,video/mp4";

function defaultSchedule() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function manilaDateToIso(date: string, time: string) {
  return new Date(`${date}T${time}:00+08:00`).toISOString();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

type AiAction = "generate" | "improve" | "shorten" | "hashtags" | "facebook" | "instagram" | "tone";

export function PostComposer({
  passkey,
  integrations,
  onPostCreated,
}: {
  passkey: string;
  integrations: PostizIntegration[];
  onPostCreated: () => Promise<void> | void;
}) {
  const upload = useServerFn(uploadSocialMedia);
  const createPost = useServerFn(createSocialPost);
  const initialSchedule = useMemo(defaultSchedule, []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<PostizMedia[]>([]);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("schedule");
  const [date, setDate] = useState(initialSchedule.date);
  const [time, setTime] = useState(initialSchedule.time);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState<"" | "now" | "schedule" | "draft">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [aiBusy, setAiBusy] = useState<AiAction | "">("");
  const selectedDefaults = useRef(false);

  useEffect(() => {
    if (!selectedDefaults.current && integrations.length > 0) {
      selectedDefaults.current = true;
      setSelectedIds(integrations.filter((item) => !item.disabled).map((item) => item.id));
    }
  }, [integrations]);

  const selectedIntegrations = integrations.filter((integration) =>
    selectedIds.includes(integration.id),
  );

  function toggleIntegration(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: PostizMedia[] = [];
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than 10 MB.`);
        if (!ACCEPTED_MEDIA.split(",").includes(file.type))
          throw new Error(`${file.name} has an unsupported file type.`);
        const base64 = await fileToBase64(file);
        uploaded.push(
          await upload({
            data: { passkey, filename: file.name, contentType: file.type as never, base64 },
          }),
        );
      }
      setMedia((current) => [...current, ...uploaded].slice(0, 10));
      setMessage(
        `${uploaded.length} media file${uploaded.length === 1 ? "" : "s"} uploaded to Postiz.`,
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Media upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(type: "now" | "schedule" | "draft") {
    setError("");
    setMessage("");
    if (!content.trim()) return setError("Write post content before continuing.");
    if (selectedIds.length === 0) return setError("Select at least one connected account.");
    const scheduledDate =
      type === "schedule" ? manilaDateToIso(date, time) : new Date().toISOString();
    if (type === "schedule" && new Date(scheduledDate).getTime() <= Date.now())
      return setError("Choose a future schedule time.");
    setSubmitting(type);
    try {
      const result = await createPost({
        data: {
          passkey,
          type,
          date: scheduledDate,
          content: content.trim(),
          integrationIds: selectedIds,
          media,
        },
      });
      const verb =
        type === "draft"
          ? "saved as a Postiz draft"
          : type === "now"
            ? "sent to Postiz for publishing"
            : "scheduled in Postiz";
      setMessage(`${result.posts.length} post${result.posts.length === 1 ? "" : "s"} ${verb}.`);
      await onPostCreated();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Postiz could not create the post.",
      );
    } finally {
      setSubmitting("");
    }
  }

  async function runAi(action: AiAction) {
    setError("");
    if (!hasConfig())
      return setError("Connect OpenRouter or Ollama in Operator Admin before using AI Assist.");
    if (action !== "generate" && !content.trim())
      return setError("Write or generate a post first.");
    if (action === "generate" && !aiPrompt.trim())
      return setError("Describe what you want the AI assistant to create.");
    setAiBusy(action);
    try {
      const instruction: Record<AiAction, string> = {
        generate: `Create a polished social media post from this brief: ${aiPrompt}`,
        improve: `Improve this social post while preserving its facts and intent:\n${content}`,
        shorten: `Shorten this social post without losing the core message:\n${content}`,
        hashtags: `Return this post with a concise, relevant set of hashtags appended:\n${content}`,
        facebook: `Rewrite this specifically for a Facebook Page, natural and engagement-friendly:\n${content}`,
        instagram: `Rewrite this specifically for Instagram with line breaks and relevant hashtags:\n${content}`,
        tone: `Rewrite this social post in a ${tone.toLowerCase()} tone:\n${content}`,
      };
      const result = await generate({
        system:
          "You are MerQato's Social Media Operator for Palawan hospitality brands. Never invent facts, prices, dates, amenities, or claims. Return only the finished post copy for human approval.",
        user: instruction[action],
        maxTokens: 700,
        onToken: setContent,
      });
      setContent(result);
      setMessage("AI draft ready for human review. Nothing has been published.");
    } catch (aiError) {
      setError(aiError instanceof Error ? aiError.message : "AI generation failed.");
    } finally {
      setAiBusy("");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
      <section className="card overflow-hidden">
        <div className="border-b border-line/15 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Channels</p>
              <h2 className="font-display text-2xl font-medium">Choose connected accounts</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-muted hover:text-ink"
            >
              Clear all
            </button>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {integrations.map((integration) => {
              const selected = selectedIds.includes(integration.id);
              return (
                <button
                  key={integration.id}
                  type="button"
                  disabled={integration.disabled}
                  onClick={() => toggleIntegration(integration.id)}
                  className={`focus-ring flex min-w-44 items-center gap-3 rounded-xl border p-3 text-left disabled:opacity-40 ${
                    selected ? "border-gold bg-gold/8" : "border-line/20 bg-surface-2/25"
                  }`}
                >
                  {integration.picture ? (
                    <img
                      src={integration.picture}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold">
                      {integration.identifier === "facebook" ? "f" : "◎"}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-ink">
                      {integration.name}
                    </span>
                    <span className="block truncate text-[10px] capitalize text-muted">
                      {integration.identifier.replace("-standalone", "")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-b border-line/15 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Post content</p>
              <h2 className="font-display text-2xl font-medium">Compose</h2>
            </div>
            <span className="font-mono text-[11px] text-faint">{content.length} / 2,200</span>
          </div>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, 2200))}
            rows={9}
            placeholder="Write a post for your connected channels…"
            className="focus-ring mt-4 w-full resize-y rounded-xl border border-line/25 bg-bg/40 p-4 text-sm leading-relaxed text-ink placeholder:text-faint"
          />
        </div>

        <div className="border-b border-line/15 p-5 sm:p-6">
          <p className="eyebrow">Media</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-line/20"
              >
                {item.name?.toLowerCase().endsWith(".mp4") ? (
                  <video src={item.path} className="aspect-square w-full object-cover" />
                ) : (
                  <img
                    src={item.path}
                    alt="Uploaded post media"
                    className="aspect-square w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() =>
                    setMedia((current) => current.filter((entry) => entry.id !== item.id))
                  }
                  aria-label="Remove media"
                  className="focus-ring absolute right-2 top-2 rounded-full bg-black/75 p-1.5 text-white"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <label className="focus-within:ring-2 focus-within:ring-gold flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gold/30 bg-gold/[0.03] text-center text-xs text-muted">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-gold" />
              ) : (
                <ImagePlus size={20} className="text-gold" />
              )}
              <span className="mt-2">{uploading ? "Uploading…" : "Add media"}</span>
              <span className="mt-1 text-[9px] text-faint">Images or MP4 · max 10 MB</span>
              <input
                type="file"
                multiple
                accept={ACCEPTED_MEDIA}
                disabled={uploading}
                onChange={(event) => onFiles(event.target.files)}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="eyebrow">Publishing</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setPublishMode("now")}
              className={`focus-ring rounded-xl border p-3 text-left ${publishMode === "now" ? "border-gold bg-gold/8" : "border-line/20"}`}
            >
              <span className="block text-sm font-medium">Publish now</span>
              <span className="text-[10px] text-muted">Send immediately</span>
            </button>
            <button
              type="button"
              onClick={() => setPublishMode("schedule")}
              className={`focus-ring rounded-xl border p-3 text-left ${publishMode === "schedule" ? "border-gold bg-gold/8" : "border-line/20"}`}
            >
              <span className="block text-sm font-medium">Schedule</span>
              <span className="text-[10px] text-muted">Asia/Manila (GMT+8)</span>
            </button>
            <label className="text-xs text-muted">
              Date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={publishMode === "now"}
                className="input mt-1 disabled:opacity-50"
              />
            </label>
            <label className="text-xs text-muted">
              Time
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                disabled={publishMode === "now"}
                className="input mt-1 disabled:opacity-50"
              />
            </label>
          </div>
          {message ? (
            <p className="mt-4 rounded-md border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-600">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-md border border-crimson/30 bg-crimson/5 px-3 py-2 text-sm text-crimson">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => submit("draft")}
              disabled={Boolean(submitting) || uploading}
              className="focus-ring rounded-md border border-line/30 px-4 py-2.5 text-sm disabled:opacity-50"
            >
              {submitting === "draft" ? "Saving…" : "Save as draft"}
            </button>
            <button
              type="button"
              onClick={() => submit(publishMode)}
              disabled={Boolean(submitting) || uploading}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-[#0b0b0b] disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : publishMode === "now" ? (
                <Send size={14} />
              ) : (
                <CalendarClock size={14} />
              )}
              {submitting ? "Sending…" : publishMode === "now" ? "Publish post" : "Schedule post"}
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <PostPreview content={content} media={media} integrations={selectedIntegrations} />
        <section className="card p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <WandSparkles size={16} className="text-gold" />
            <h2 className="font-display text-xl font-medium">AI Assistant</h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Uses the Agent Brain already selected in Operator Admin.
          </p>
          <textarea
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            rows={3}
            placeholder="Describe what you want to post about…"
            className="focus-ring mt-4 w-full resize-y rounded-lg border border-line/25 bg-bg/40 p-3 text-sm text-ink placeholder:text-faint"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              ["generate", "improve", "shorten", "hashtags", "facebook", "instagram"] as AiAction[]
            ).map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => runAi(action)}
                disabled={Boolean(aiBusy)}
                className="focus-ring rounded-md border border-line/25 px-2 py-2 text-xs capitalize text-muted hover:border-gold/40 hover:text-ink disabled:opacity-50"
              >
                {aiBusy === action
                  ? "Working…"
                  : action === "facebook"
                    ? "Facebook version"
                    : action === "instagram"
                      ? "Instagram version"
                      : action}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              className="input flex-1 text-xs"
            >
              <option>Friendly</option>
              <option>Professional</option>
              <option>Warm</option>
              <option>Playful</option>
              <option>Luxury</option>
            </select>
            <button
              type="button"
              onClick={() => runAi("tone")}
              disabled={Boolean(aiBusy)}
              className="focus-ring inline-flex items-center gap-1 rounded-md bg-ink px-3 py-2 text-xs text-bg disabled:opacity-50"
            >
              <Sparkles size={12} /> Change tone
            </button>
          </div>
          {!hasConfig() ? (
            <p className="mt-3 rounded-md border border-gold/25 bg-gold/5 px-3 py-2 text-[11px] text-gold">
              Connect OpenRouter or Ollama in Operator Admin to enable AI Assist.
            </p>
          ) : null}
          <p className="mt-4 text-[10px] leading-relaxed text-faint">
            Human approval is required before publishing. AI output is never sent automatically.
          </p>
        </section>
      </aside>
    </div>
  );
}
